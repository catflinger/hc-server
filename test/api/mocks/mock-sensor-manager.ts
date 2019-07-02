import { ISensorConfig } from "../../../src/common/interfaces";
import { injectable } from "inversify";
import { ISensorManager } from "../../../src/types";

@injectable()
export class MockSensorManager implements ISensorManager {
    getReadingByRole(role: import("../../../src/common/interfaces").RoleType): number {
        throw new Error("Method not implemented.");
    }

    start(): Promise<void> {
        return Promise.resolve();
    } 

    getReadings(): ISensorConfig[] {
        return defaultConfiguredSensors;
    }

    refresh(): Promise<void> {
        return Promise.resolve();
    }

}

const defaultAvailableSensors: ISensorConfig[] = [
    {
        id: "28.0",
        description: "",
        role: null,
        reading: 43.23,
        displayColor: "black",
        displayOrder: 100,
},
    {
        id: "28.1",
        description: "",
        role: null,
        reading: 19.2,
        displayColor: "black",
        displayOrder: 100,
},
    {
        id: "28.3",
        description: "",
        role: null,
        reading: 4,
        displayColor: "black",
        displayOrder: 100,
},
];

const defaultConfiguredSensors: ISensorConfig[] = [
    {
        id: "28.0",
        description: "hot water",
        role: "hw",
        reading: 43.23,
        displayColor: "black",
        displayOrder: 100,
},
    {
        id: "28.1",
        description: "bedroom",
        role: null,
        reading: 19.2,
        displayColor: "black",
        displayOrder: 100,
},
];
