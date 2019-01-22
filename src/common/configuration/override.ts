import { v4 as uuid } from "uuid";
import { IOverride, IRule } from "../interfaces";

export class Override implements IOverride {
    public readonly rule: IRule;
    public readonly id: string;
    public readonly date: Date;

    constructor(rule: IRule, date: Date) {
        this.id = uuid();
        this.date = date;
        this.rule = rule;
    }

    public toJSON(): any {
        return {
            date: this.date,
            id: this.id,
            rule: this.rule,
        };
    }
}
