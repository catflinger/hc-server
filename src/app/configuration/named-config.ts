import { INamedConfig } from "../../types";

export class NamedConfig implements INamedConfig {
    public readonly weekdayProgramId: string;
    public readonly saturdayProgramId: string;
    public readonly sundayProgramId: string;

    constructor(data: any) {
        if (data.weekdayProgramId) {
            this.weekdayProgramId = data.weekdayProgramId;
        } else {
            throw new Error("weekday program id not found in named config");
        }
        if (data.saturdayProgramId) {
            this.saturdayProgramId = data.saturdayProgramId;
        } else {
            throw new Error("saturday program id not found in named config");
        }
        if (data.sundayProgramId) {
            this.sundayProgramId = data.sundayProgramId;
        } else {
            throw new Error("sunday program id not found in named config");
        }
    }
}
