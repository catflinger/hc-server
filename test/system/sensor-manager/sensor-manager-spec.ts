import "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as fsu from "../../../src/utils/fs-utils";
import * as path from "path";

import { ISensorManager, INJECTABLES } from "../../../src/types";
import { container } from "./inversify-test.config";
import { IReading } from "hc-common";

chai.use(chaiAsPromised);
const expect = chai.expect;

const oneWireDir = container.get<string>(INJECTABLES.OneWireRootDir);
const sensorManager: ISensorManager = container.get<ISensorManager>(INJECTABLES.SensorManager);

describe("sensor-manager", () => {

    beforeEach(async () => {
        // write the sensor values
        await fsu.writeFileP(path.join(oneWireDir, "28.0", "temperature"), 10);
        await fsu.writeFileP(path.join(oneWireDir, "28.1", "temperature"), 11);
    });

    describe("getReadings", () => {
        
        it("should read sensors", () => {

            const readings = sensorManager.readConfiguredSensors(); 
            return Promise.all([
                expect(readings).to.eventually.be.fulfilled,
                expect(readings).to.eventually.be.an.instanceOf(Array),
                expect(readings).to.eventually.have.lengthOf(2),
                expect(readings).to.eventually.have.deep.members(expectedA)
            ]);


        });
    });

    describe("listSensors", () => {
        
        it("should list available sensors", () => {

            const readings = sensorManager.readAvailableSensors(); 
            return Promise.all([
                expect(readings).to.eventually.be.fulfilled,
                expect(readings).to.eventually.be.an.instanceOf(Array),
                expect(readings).to.eventually.have.lengthOf(2),
                expect(readings).to.eventually.have.deep.members(expectedB)
            ]);


        });
    });
});

const expectedA: IReading[] = [
    {
        id: "28.0",
        description: "first sensor",
        role: "hw",
        value: 10
    },
    {
        id: "28.1",
        description: "second sensor",
        role: "",
        value: 11
    },
];
const expectedB: IReading[] = [
    {
        id: "28.0",
        description: "",
        role: "",
        value: 10
    },
    {
        id: "28.1",
        description: "",
        role: "",
        value: 11
    },
];
