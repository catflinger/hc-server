import * as mocha from 'mocha';
import * as chai from 'chai';
import { container } from "./inversify-test.config";

import { ExpressApp } from '../../src/server/express-app';
import { INJECTABLES } from '../../src/types';
import { MockController } from './mocks/mock-controller';
import { MockSensorManager } from './mocks/mock-sensor-manager';

let mockSensorManager = container.get<MockSensorManager>(INJECTABLES.SensorManager);
let expressApp = container.get<ExpressApp>(INJECTABLES.ExpressApp);
let app: Express.Application;

chai.use(require("chai-http"));
const expect = chai.expect;

describe("Sensor API'", () => {

    before(() => {
        return expressApp.start()
        .then((result) => {
            app = result;
        });
    });

    describe("GET /api/sensor/configured", () => {
        it('should be json', () => {
        return chai.request(app).get('/api/sensor/configured')
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.type).to.eql('application/json');
            });
        });

        it('should contain valid data', () => {
            return chai.request(app).get('/api/sensor/configured')
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                    expect(res.type).to.eql('application/json');
                    const state: any = res.body;
                    expect(Array.isArray(state.sensors)).to.equal(true);
                    expect(state.sesnors.length).to.equal(2);
                    expect(state.sesnors[0].id).to.equal("28.0");
                    expect(state.sesnors[1].role).to.equal("bedroom");
                });
        });
    });

    describe("GET /api/sensor/available", () => {
        it('should be json', () => {
        return chai.request(app).get('/api/sensor/available')
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.type).to.eql('application/json');
            });
        });

        it('should contain valid data', () => {
            return chai.request(app).get('/api/sensor/available')
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                    expect(res.type).to.eql('application/json');
                    const state: any = res.body;
                    expect(Array.isArray(state.sensors)).to.equal(true);
                    expect(state.sesnors.length).to.equal(3);
                    expect(state.sesnors[0].id).to.equal("28.0");
                });
        });
    });
});
