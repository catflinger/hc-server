import { injectable } from "inversify";

import { IOverrideManager, IOverride, IRule } from "../../../../src/types";

@injectable()
export class MockOverrideManager implements IOverrideManager {
    public overrides: IOverride[] = [];

    addOverride(rule: IRule): void {
        throw new Error("Method not implemented.");
    }
    getOverrides(): ReadonlyArray<IOverride> {
        return this.overrides as ReadonlyArray<IOverride>;
    }
    clearOverrides(): void {
        throw new Error("Method not implemented.");
    }
    housekeep(): void {
        throw new Error("Method not implemented.");
    }
}
