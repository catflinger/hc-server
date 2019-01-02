import { ISensorManager, IReading } from "../../../../src/types";
import { injectable } from "inversify";

@injectable()
export class MockSensorManager implements ISensorManager {
    public readings: IReading[] = [];

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
