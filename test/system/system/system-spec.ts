import "mocha";
import * as chai from "chai";

import { container } from "./inversify-test.config";

const expect = chai.expect;

import { System } from "../../../src/app/system/system";
import { ISystem, INJECTABLES } from "../../../src/types";

let system: ISystem;

describe("System", () => {
    it(" should construct", () => {
        system = container.get<ISystem>(INJECTABLES.System);
        expect(system.boiler.id).to.equal("boiler");
        expect(system.hwPump.id).to.equal("hwPump");
        expect(system.chPump.id).to.equal("chPump");
    });
});