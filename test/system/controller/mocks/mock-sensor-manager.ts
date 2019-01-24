import { ISensorConfig } from "../../../../src/common/interfaces";
import { injectable } from "inversify";
import { ISensorManager } from "../../../../src/types";

@injectable()
export class MockSensorManager implements ISensorManager {
    public readings: ISensorConfig[] = [
        {
            id: "A",
            description: "Sensor A",
            role: "hw",
            reading: 30,
            logPosition: null
        },
        {
            id: "B",
            description: "Sensor B",
            role: "something",
            reading: 30,
            logPosition: null
        }
    ];

    public setHwTemp(val: number): void {
        this.readings[0].reading = val;
    }
    public readAvailableSensors(): Promise<ISensorConfig[]> {
        return Promise.resolve(this.readings);
    }    
    public readConfiguredSensors(): Promise<ISensorConfig[]> {
        return Promise.resolve(this.readings);
    }
    readSensors(): Promise<ISensorConfig[]> {
        return Promise.resolve(this.readings);
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
