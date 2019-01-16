import { IReading } from "../../../src/common/interfaces";
import { injectable } from "inversify";
import { ISensorManager } from "../../../src/types";

@injectable()
export class MockSensorManager implements ISensorManager {

    readAvailableSensors(): Promise<IReading[]> {
        return Promise.resolve(defaultAvailableSensors);
    }

    readConfiguredSensors(): Promise<IReading[]> {
        return Promise.resolve(defaultConfiguredSensors);
    }
}

const defaultAvailableSensors: IReading[] = [
    {
        id: "28.0",
        description: "",
        role: "",
        value: 43.23,
    },
    {
        id: "28.1",
        description: "",
        role: "",
        value: 19.2,
    },
    {
        id: "28.3",
        description: "",
        role: "",
        value: 4,
    },
];

const defaultConfiguredSensors: IReading[] = [
    {
        id: "28.0",
        description: "hot water",
        role: "hw",
        value: 43.23,
    },
    {
        id: "28.1",
        description: "bedroom",
        role: "",
        value: 19.2,
    },
];
