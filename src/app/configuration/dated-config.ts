import { IDatedConfig } from "../../types";
import { ConfigValidation } from "./config-validation";

export class DatedConfig implements IDatedConfig {
    public readonly programId: string;
    public readonly date: Date;

    constructor(data: any) {
        this.programId = ConfigValidation.getString(data.programId, "datedConfig:programId");
        this.date = ConfigValidation.getDate(data.date, "datedConfig:date");
    }
}
