import * as chai from 'chai';
import { container } from "./inversify-test.config";

import { ExpressApp } from '../../src/server/express-app';
import { INJECTABLES } from '../../src/types';

let expressApp = container.get<ExpressApp>(INJECTABLES.ExpressApp);
let app: Express.Application;

chai.use(require("chai-http"));
const expect = chai.expect;

describe("Control API' POST /api/control/hwboost", () => {

    before(() => {
        return expressApp.start()
        .then((result) => {
            app = result;
        });
    });

    it('should be json and dated', () => {
        return chai.request(app).post('/api/control/hwboost')
            .send({})
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.type).to.eql('application/json');
                expect(res.body.date).not.to.be.undefined;
            });
    });
});
