import { ConfigValidation } from "hc-common";

import { INamedConfig } from "../../types";

export class NamedConfig implements INamedConfig {
    public readonly weekdayProgramId: string;
    public readonly saturdayProgramId: string;
    public readonly sundayProgramId: string;

    constructor(data: any) {
        this.weekdayProgramId = isPresent(data.weekdayProgramId) ?
            ConfigValidation.getString(data.weekdayProgramId, "namedConfig:weekdayProgramId", null) :
            "";

        this.saturdayProgramId = isPresent(data.saturdayProgramId) ?
            ConfigValidation.getString(data.saturdayProgramId, "namedConfig:saturdayProgramId", null) :
            "";

        this.sundayProgramId = isPresent(data.sundayProgramId) ?
            ConfigValidation.getString(data.sundayProgramId, "namedConfig:sundayProgramId", null) :
            "";
    }
}

function isPresent(val: any): boolean {
    return !(val === null || val === undefined);
}
