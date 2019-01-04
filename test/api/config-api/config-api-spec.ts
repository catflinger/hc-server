import * as mocha from 'mocha';
import * as chai from 'chai';
import { container } from "../inversify-test.config";

import { ExpressApp } from '../../../src/server/express-app';
import { INJECTABLES } from '../../../src/types';
import { MockConfigManager } from '../mocks/mock-config-manager';
import { Configuration } from '../../../src/app/configuration/configuration';

let mockConfigManager = container.get<MockConfigManager>(INJECTABLES.ConfigManager);
let expressApp = container.get<ExpressApp>(INJECTABLES.ExpressApp);
let app: Express.Application;

chai.use(require("chai-http"));
const expect = chai.expect;

describe("Config API' get /api/config", () => {

    before(() => {
        return expressApp.start()
        .then((result) => {
            app = result;
        });
    });

    it('should be json', () => {
        return chai.request(app).get('/api/config')
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.type).to.eql('application/json');
            });
    });

    it('should contain valid data', () => {
        return chai.request(app).get('/api/config')
            .then((res: any) => {
                const config: any = res.body;

                console.log(JSON.stringify(config, null, 4));
                
                // check a few random values
                expect(config.namedConfig.weekdayProgramId).to.equal("C");

                expect(config.datedConfig.length).to.equal(2);
                expect(config.datedConfig[1].programId).to.equal("Y");

                expect(config.programConfig.length).to.equal(2);
                expect(config.programConfig[0].id).to.equal("P1");

                expect(config.sensorConfig.length).to.equal(2);
                expect(config.sensorConfig[0].role).to.equal("");
                expect(config.sensorConfig[1].role).to.equal("hw");
            });
    });
});
