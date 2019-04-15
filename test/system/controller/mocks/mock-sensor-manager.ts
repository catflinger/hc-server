import { ISensorConfig } from "../../../../src/common/interfaces";
import { injectable } from "inversify";
import { ISensorManager } from "../../../../src/types";

@injectable()
export class MockSensorManager implements ISensorManager {
    start(): Promise<void> {
        return Promise.resolve();
    }

    public readings: ISensorConfig[] = [
        {
            id: "A",
            description: "Sensor A",
            role: "hw",
            reading: 30,
        },
        {
            id: "B",
            description: "Sensor B",
            role: "something",
            reading: 30,
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
        public role: string,
        public reading: number,
        public logPosition: number,
    ){}
}
