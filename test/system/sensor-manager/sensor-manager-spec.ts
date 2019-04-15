import "mocha";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as fsu from "../../../src/utils/fs-utils";
import * as path from "path";

import { ISensorManager, INJECTABLES } from "../../../src/types";
import { container } from "./inversify-test.config";
import { ISensorConfig } from "../../../src/common/interfaces";

chai.use(chaiAsPromised);
const expect = chai.expect;

const oneWireDir = container.get<string>(INJECTABLES.OneWireRootDir);
const sensorManager: ISensorManager = container.get<ISensorManager>(INJECTABLES.SensorManager);

describe("sensor-manager", () => {
    before(() => {
        sensorManager.start();
    });

    beforeEach(async () => {
        // write the sensor values
        await fsu.writeFileP(path.join(oneWireDir, "28.0", "temperature"), 10);
        await fsu.writeFileP(path.join(oneWireDir, "28.1", "temperature"), 11);
    });

    describe("getReadings", () => {
        
        it("should read sensors", () => {

            const readings = sensorManager.getReadings(); 
            expect(readings).to.be.an.instanceOf(Array),
            expect(readings).to.have.lengthOf(3),
            expect(readings).to.have.deep.members(expectedA)
        });
    });
});

const expectedA: ISensorConfig[] = [
    {
        id: "28.0",
        description: "first sensor",
        role: "hw",
        reading: 10,
    },
    {
        id: "28.1",
        description: "second sensor",
        role: "",
        reading: 11,
    },
    {
        id: "28.99",
        description: "deleted sensor",
        role: "",
        reading: null,
    },
];
