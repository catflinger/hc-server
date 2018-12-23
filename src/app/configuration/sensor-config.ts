import { ISensorConfig } from "../../types";

export class SensorConfig implements ISensorConfig {
    id: string;
    description: string;
    role: string;
    deleted: boolean;

    constructor(data: any) {
    }
}
