import * as mocha from 'mocha';
import * as chai from 'chai';
import { container } from "./inversify-test.config";

import { ExpressApp } from '../../src/server/express-app';
import { INJECTABLES } from '../../src/types';
import { MockOverrideManager } from '../system/controller/mocks/mock-override-manager';
import { TimeOfDay } from '../../src/common/types';

let expressApp = container.get<ExpressApp>(INJECTABLES.ExpressApp);
let mockOverrideManager: MockOverrideManager = container.get<MockOverrideManager>(INJECTABLES.OverrideManager);
let app: Express.Application;

chai.use(require("chai-http"));
const expect = chai.expect;

describe("Override API", () => {
    describe("get /api/override", () => {

        before(() => {
            return expressApp.start()
            .then((result) => {
                app = result;
            });
        });

        it('should contian json data', () => {
            mockOverrideManager.overrides = [
                {
                    id: "abc",
                    date: new Date(),
                    rule: {
                        kind: "BasicHeatingRule",
                        data: null,
                        id: null,
                        startTime: new TimeOfDay({hour: 1, minute: 1, second: 1}),
                        endTime: new TimeOfDay({hour: 2, minute: 2, second: 2}),
                    },
                },
                {
                    id: "def",
                    date: new Date(),
                    rule: {
                        kind: "BasicHeatingRule",
                        data: null,
                        id: null,
                        startTime: new TimeOfDay({hour: 1, minute: 1, second: 1}),
                        endTime: new TimeOfDay({hour: 2, minute: 2, second: 2}),
                    },
                },
            ];
            return chai.request(app).get('/api/override')
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                    expect(res.type).to.eql('application/json');
                    expect(Array.isArray(res.body.overrides)).to.be.true;
                    expect(res.body.date).not.to.be.undefined;
                    expect(res.body.overrides.length).to.equal(2);
                    expect(res.body.overrides[0].id).to.equal("abc");
                    expect(res.body.overrides[1].id).to.equal("def");
                });
        });
    });

    describe("put /api/override", () => {

        before(() => {
            return expressApp.start()
            .then((result) => {
                app = result;
            });
        });

        it('should be json', () => {
            return chai.request(app).put('/api/override')
            .send({ duration: 2})
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.type).to.eql('application/json');
            });
        });

        it('should fail with no data', () => {
            return chai.request(app).put('/api/override')
            .then((res: any) => {
                expect(res.status).to.equal(400);
            });
        });

        it('should fail with bad data', () => {
            return chai.request(app).put('/api/override')
            .send({ x: 1})
            .then((res: any) => {
                expect(res.status).to.equal(400);
            });
        });

        it('should fail with negative duration', () => {
            return chai.request(app).put('/api/override')
            .send({ duration: -1})
            .then((res: any) => {
                expect(res.status).to.equal(400);
            });
        });

        it('should suceed with largest duration', () => {
            return chai.request(app).put('/api/override')
            .send({ duration: 60 * 24})
            .then((res: any) => {
                expect(res.status).to.equal(200);
            });
        });

        it('should fail with over large duration', () => {
            return chai.request(app).put('/api/override')
            .send({ duration: 60 * 24 + 1})
            .then((res: any) => {
                expect(res.status).to.equal(400);
            });
        });
    });
});

