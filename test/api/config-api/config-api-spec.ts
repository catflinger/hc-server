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
    //     mockController.state.heating = true;
    //     mockController.state.hotWater = false;

    //     return chai.request(app).get('/api/control-state')
    //         .then((res: any) => {
    //             expect(res.status).to.equal(200);
    //             expect(res.type).to.eql('application/json');
    //             const state: any = res.body;
    //             expect(state.heating).to.equal(true);
    //             expect(state.hotWater).to.equal(false);
    //         });
    });
});
