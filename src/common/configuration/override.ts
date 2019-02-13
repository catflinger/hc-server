import { v4 as uuid } from "uuid";
import { ConfigValidation } from "../config-validation";
import { IOverride, IRule } from "../interfaces";
import { BasicHeatingRule } from "./basic-heating-rule";

export class Override implements IOverride {
    public readonly rule: IRule;
    public readonly id: string;
    public readonly date: Date;

    constructor(data: any) {

        this.id = data.id ?
            ConfigValidation.getString(data.id, "Override construcor: id") :
            this.id = uuid();

        if (data.date) {
            this.date = ConfigValidation.getDate(data.date, "Override construcor: : date");
        } else {
            throw new Error("date missing from Override construcor: ");
        }

        if (data.rule) {
            this.rule = new BasicHeatingRule(data.rule);
        } else {
            throw new Error("rule missing from Override construcor");
        }
    }
}
