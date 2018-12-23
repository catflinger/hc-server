import { IProgram, IRule } from "../../types";
import { Rule } from "./rule";

export class Program implements IProgram {
    public readonly id: string;
    public readonly name: string;
    public readonly minHwTemp: number;
    public readonly maxHwTemp: number;

    private rules: IRule[];

    constructor(data: any) {
        if (data.id) {
            this.id = data.id;
        } else {
            throw new Error("id not found in program config");
        }

        if (data.name) {
            this.name = data.name;
        } else {
            throw new Error("name not found in program config");
        }

        if (data.minHwTemp) {
            this.minHwTemp = data.minHwTemp;
        } else {
            throw new Error("minHwTemp not found in program config");
        }

        if (data.maxHwTemp) {
            this.maxHwTemp = data.maxHwTemp;
        } else {
            throw new Error("maxHwTemp not found in program config");
        }

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
