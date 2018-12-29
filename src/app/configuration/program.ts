import { injectable } from "inversify";
import { v4 as guid } from "uuid";

import { IProgram, IRule } from "../../types";
import { ConfigValidation } from "./config-validation";
import { Rule } from "./rule";

@injectable()
export class Program implements IProgram {
    public readonly id: string;
    public readonly name: string;
    public readonly minHwTemp: number;
    public readonly maxHwTemp: number;

    private rules: IRule[] = [];

    constructor(data: any) {
        this.id = data.id ? ConfigValidation.getString(data.id, "programConfig:id") : guid();
        this.name = ConfigValidation.getString(data.name, "programConfig:name");
        this.minHwTemp = ConfigValidation.getNumber(data.minHwTemp, "programConfig:minHwTemp");
        this.maxHwTemp = ConfigValidation.getNumber(data.maxHwTemp, "programConfig:maxHwTemp");

        if (data.rules) {
            if (Array.isArray(data.rules)) {
                data.rules.forEach((r: any) => {
                    this.rules.push(new Rule(r));
                });
            } else {
                throw new Error("invalid config: datedConfig not an array");
            }
        }
    }

    public getRules(): ReadonlyArray<IRule> {
        return this.rules as ReadonlyArray<IRule>;
    }
}
