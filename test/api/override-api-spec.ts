import * as mocha from 'mocha';
import * as chai from 'chai';
import { container } from "./inversify-test.config";

import { ExpressApp } from '../../src/server/express-app';
import { INJECTABLES } from '../../src/types';

let expressApp = container.get<ExpressApp>(INJECTABLES.ExpressApp);
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

        it('should be json', () => {
            return chai.request(app).get('/api/override')
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                    expect(res.type).to.eql('application/json');
                });
        });

        it('should have tests written', () => {
            expect(false).to.be.true;
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
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                    expect(res.type).to.eql('application/json');
                });
        });

        it('should have tests written', () => {
            expect(false).to.be.true;
        });
    });
});

