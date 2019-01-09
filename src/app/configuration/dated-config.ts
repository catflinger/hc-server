import { ConfigValidation } from "hc-common";

import { IDatedConfig } from "../../types";

export class DatedConfig implements IDatedConfig {
    public readonly programId: string;
    public readonly date: Date;

    constructor(data: any) {
        this.programId = ConfigValidation.getString(data.programId, "datedConfig:programId");
        this.date = ConfigValidation.getDate(data.date, "datedConfig:date");
    }
}
