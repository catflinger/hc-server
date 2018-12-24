import { INamedConfig } from "../../types";
import { ConfigValidation } from "./config-validation";

export class NamedConfig implements INamedConfig {
    public readonly weekdayProgramId: string;
    public readonly saturdayProgramId: string;
    public readonly sundayProgramId: string;

    constructor(data: any) {
        this.weekdayProgramId = ConfigValidation.getString(data.weekdayProgramId, "namedConfig:weekdayProgramId", null);
        this.saturdayProgramId = ConfigValidation.getString(data.saturdayProgramId, "namedConfig:saturdayProgramId", null);
        this.sundayProgramId = ConfigValidation.getString(data.sundayProgramId, "namedConfig:sundayProgramId", null);
    }
}
