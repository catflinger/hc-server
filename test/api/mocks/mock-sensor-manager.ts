import { ISensorConfig } from "../../../src/common/interfaces";
import { injectable } from "inversify";
import { ISensorManager } from "../../../src/types";

@injectable()
export class MockSensorManager implements ISensorManager {

    readAvailableSensors(): Promise<ISensorConfig[]> {
        return Promise.resolve(defaultAvailableSensors);
    }

    readConfiguredSensors(): Promise<ISensorConfig[]> {
        return Promise.resolve(defaultConfiguredSensors);
    }

    readSensors(): Promise<ISensorConfig[]> {
        return Promise.resolve(defaultConfiguredSensors);
    }

}

const defaultAvailableSensors: ISensorConfig[] = [
    {
        id: "28.0",
        description: "",
        role: "",
        reading: 43.23,
    },
    {
        id: "28.1",
        description: "",
        role: "",
        reading: 19.2,
    },
    {
        id: "28.3",
        description: "",
        role: "",
        reading: 4,
    },
];

const defaultConfiguredSensors: ISensorConfig[] = [
    {
        id: "28.0",
        description: "hot water",
        role: "hw",
        reading: 43.23,
    },
    {
        id: "28.1",
        description: "bedroom",
        role: "",
        reading: 19.2,
    },
];
