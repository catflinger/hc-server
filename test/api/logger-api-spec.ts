import * as mocha from 'mocha';
import * as chai from 'chai';
import { container } from "./inversify-test.config";

import { ExpressApp } from '../../src/server/express-app';
import { INJECTABLES } from '../../src/types';
import { MockLogger } from './mocks/mock-logger';
import { ILogExtract } from '../../src/common/interfaces';

let mockLogger: MockLogger = container.get<MockLogger>(INJECTABLES.Logger);

let expressApp = container.get<ExpressApp>(INJECTABLES.ExpressApp);
let app: Express.Application;

chai.use(require("chai-http"));
const expect = chai.expect;

describe("Logger API' get /api/log", () => {

    before(() => {
        return expressApp.start()
        .then((result) => {
            app = result;
        });
    });

    it('should be json and dated', () => {
        mockLogger.extract = extractA;

        const params: any = {
            from: "2019-01-01T00:00:00",
            to: "2019-12-31T23:59:59",
            sensors: [ "foo", "bar"],
        };

        return chai.request(app).get('/api/log?params=' + JSON.stringify(params))
        .then((res: any) => {
            expect(res.status).to.equal(200);
            expect(res.type).to.eql('application/json');
            expect(res.body.date).not.to.be.undefined;

            expect(res.body.log).not.to.be.undefined;

            let extract = res.body.log;

            expect(extract.entries.length).to.equal(1);
            expect(extract.entries[0].readings.length).to.equal(2);
            expect(extract.entries[0].readings[1]).to.equal(67.8);
        });
    });
});

const extractA = {
    sensors: ["foo", "bar"],

    from: new Date("2019-01-03T12:00:00"),
    to: new Date("2019-01-03T13:00:00"),

    // the data retrieved
    entries: [
        {
            date: new Date("2019-01-03T12:00:00"),
            heating: true,
            hotWater: false,
            readings: [ 11.1, 67.8 ],
        },
    ],
};
