import { ConfigValidation } from "../config-validation";
import { ISensorConfig, RoleType } from "../interfaces";

export class SensorConfig implements ISensorConfig {
    public readonly id: string;
    public readonly description: string;
    public readonly role: RoleType;
    public readonly reading: number;

    constructor(data: any) {
        this.id = ConfigValidation.getString(data.id, "sensorConfig:id");
        this.description = ConfigValidation.getString(data.description, "sensorConfig:description");
        this.role = ConfigValidation.getRoleType(data.role, "sensorConfig:role", "");
        this.reading = data.reading === null ? null : ConfigValidation.getNumber(data.reading, "sensorConfig:reading", null);
    }
}
