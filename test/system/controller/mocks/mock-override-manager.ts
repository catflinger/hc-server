import { injectable } from "inversify";

import { IOverrideManager, IOverride, IRule } from "../../../../src/types";

@injectable()
export class MockOverrideManager implements IOverrideManager {
    public overrides: IOverride[] = [];

    addOverride(rule: IRule): void {
        return;
    }
    getOverrides(): ReadonlyArray<IOverride> {
        return this.overrides as ReadonlyArray<IOverride>;
    }
    clearOverrides(): void {
        this.overrides.length = 0;;
    }
    housekeep(): void {
        throw new Error("Method not implemented.");
    }
}
