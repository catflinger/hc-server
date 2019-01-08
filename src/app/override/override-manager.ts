import { inject, injectable } from "inversify";

import { IClock, INJECTABLES, IOverride, IOverrideManager, IRule, ITimeOfDay } from "../../types";
import { TimeOfDay } from "../controller/time-of-day";
import { Override } from "./override";

@injectable()
export class OverrideManager implements IOverrideManager {
    private overrides: IOverride[] = [];

    @inject(INJECTABLES.Clock)
    private clock: IClock;

    public addOverride(rule: IRule): void {
        this.overrides.push(new Override(rule, this.clock.now()));
    }

    public getOverrides(): ReadonlyArray<IOverride> {
        return this.overrides as ReadonlyArray<IOverride>;
    }

    public clearOverrides(): void {
        this.overrides.length = 0;
    }

    public housekeep(): void {
        const today = this.clock.now();
        const now = this.clock.timeOfDay();

        let index: number = 0;

        while (index !== null) {
            index = this.checkOveride(index, today, now);
        }
    }

    private checkOveride(idx: number, today: Date, now: ITimeOfDay): number {
        let next: number = null;

        if (this.overrides.length === 0) {
            // array is now empty
            next = null;
        } else if (idx >= this.overrides.length) {
            // past the end of the array
            next = null;
        } else {
            // check if the override is still valid
            const ov = this.overrides[idx];

            if (ov.date.toDateString() !== today.toDateString() ||
                ov.rule.endTime.isEarlierThan(now)) {
                // remove the override and carry on from the same location
                this.overrides.splice(idx, 1);
                next = idx;
            } else {
                // override is OK, move on to the next location
                next = idx + 1;
            }
        }
        return next;
    }
}
