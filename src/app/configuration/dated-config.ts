import { IDatedConfig } from "../../types";

export class DatedConfig implements IDatedConfig {
    public readonly programId: string;
    public readonly date: Date;

    constructor(data: any) {

        if (data.programId) {
            this.programId = data.programId;
        } else {
            throw new Error("program id not found in dated config");
        }

        if (data.date) {
            this.date = new Date(data.date);
        } else {
            throw new Error("date not found in dated config");
        }
    }
}
