import { ISensorConfig, RoleType } from "../../../src/common/interfaces";
import { injectable } from "inversify";
import { ISensorManager } from "../../../src/types";

@injectable()
export class MockSensorManager implements ISensorManager {

    getReadingByRole(role: RoleType): number {
        if (role === "hw") {
            return this.readings[0].reading;
        }
        if (role === "bedroom") {
            return this.readings[1].reading;
        }

        return null;
    }

    start(): Promise<void> {
        return Promise.resolve();
    }

    public readings: ISensorConfig[] = [
        {
            id: "A",
            description: "Sensor A",
            role: "hw",
            reading: 30,
            displayColor: "black",
            displayOrder: 100,
},
        {
            id: "B",
            description: "Sensor B",
            role: "bedroom",
            reading: 15,
            displayColor: "black",
            displayOrder: 100,
}
    ];

    public setHwTemp(val: number): void {
        this.readings[0].reading = val;
    }
    public refresh(): Promise<void> {
        return Promise.resolve();
    }
    public getReadings(): ISensorConfig[] {
        return this.readings;
    }

}

export class MockReading implements ISensorConfig {
    tag: any;

    constructor(
        public id: string,
        public description: string,
        public role: RoleType,
        public reading: number,
        public displayColor: "black",
        public displayOrder: 100,
){}
}
