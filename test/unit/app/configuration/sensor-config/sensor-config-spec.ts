import "mocha";
import * as chai from "chai";

import { SensorConfig } from "../../../../../src/app/configuration/sensor-config";

const expect = chai.expect;

describe("Named Config", () => {
    describe("loading with good data", () => {
        it("load with all fields present", () => {
            let sc: SensorConfig = new SensorConfig({
                id: "A",
                description: "B",
                role: "C",
                deleted: true,
            }); 
            expect(sc.id).to.equal("A");
            expect(sc.description).to.equal("B");
            expect(sc.role).to.equal("C");
            expect(sc.deleted).to.equal(true);
        });
        it("load with role missing", () => {
            let sc: SensorConfig = new SensorConfig({
                id: "A",
                description: "B",
                deleted: true,
            }); 
            expect(sc.id).to.equal("A");
            expect(sc.description).to.equal("B");
            expect(sc.role).to.equal("");
            expect(sc.deleted).to.equal(true);
        });
        it("load with deleted missing", () => {
            let sc: SensorConfig = new SensorConfig({
                id: "A",
                description: "B",
                role: "C",
            }); 
            expect(sc.id).to.equal("A");
            expect(sc.description).to.equal("B");
            expect(sc.role).to.equal("C");
            expect(sc.deleted).to.equal(false);
        });
    });
    
    it("should fail to load with invalid data", () => {
        expect(() => { new SensorConfig({})}).to.throw;
        expect(() => { new SensorConfig(undefined)}).to.throw;
    });
});
