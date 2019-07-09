import { ConfigValidation } from "../config-validation";
import { IDatedConfig } from "../interfaces";
import { DayOfYear } from "./day-of-year";

export class DatedConfig implements IDatedConfig {
    public readonly programId: string;
    public readonly dayOfYear: DayOfYear;

    constructor(data: any) {
        this.programId = ConfigValidation.getString(data.programId, "datedConfig:programId");
        this.dayOfYear = new DayOfYear(data.dayOfYear);
    }
}
