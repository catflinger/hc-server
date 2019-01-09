import { IReading } from "hc-common";
import { injectable } from "inversify";
import { ISensorManager } from "../../../../src/types";

@injectable()
export class MockSensorManager implements ISensorManager {
    public readings: IReading[] = [
        {
            id: "A",
            description: "Sensor A",
            role: "hw",
            value: 30,
        },
        {
            id: "B",
            description: "Sensor B",
            role: "something",
            value: 30,
        }
    ];

    public setHwTemp(val: number): void {
        this.readings[0].value = val;
    }
    public readAvailableSensors(): Promise<IReading[]> {
        return Promise.resolve(this.readings);
    }    
    public readConfiguredSensors(): Promise<IReading[]> {
        return Promise.resolve(this.readings);
    }
}

export class MockReading implements IReading {
    constructor(
        public id: string,
        public description: string,
        public role: string,
        public value: number,
    ){}
}
