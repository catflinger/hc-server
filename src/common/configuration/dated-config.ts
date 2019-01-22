import { ConfigValidation } from "../config-validation";
import { IDatedConfig } from "../interfaces";

export class DatedConfig implements IDatedConfig {
    public readonly programId: string;
    public readonly date: Date;

    constructor(data: any) {
        this.programId = ConfigValidation.getString(data.programId, "datedConfig:programId");
        this.date = ConfigValidation.getDate(data.date, "datedConfig:date");
    }

    public toJSON(): any {
        return {
            date: this.date,
            programId: this.programId,
        };
    }
}
