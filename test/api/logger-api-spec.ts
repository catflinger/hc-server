import * as mocha from 'mocha';
import * as chai from 'chai';
import { container } from "./inversify-test.config";

import { ExpressApp } from '../../src/server/express-app';
import { INJECTABLES } from '../../src/types';
import { MockLogger } from './mocks/mock-logger';
import { ILogExtract } from '../../src/common/interfaces';
import { DayOfYear } from '../../src/common/configuration/day-of-year';

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

        return chai.request(app).get('/api/log?year=2019&month=1&day=3')
        .then((res: any) => {
            expect(res.status).to.equal(200);
            expect(res.type).to.eql('application/json');
            expect(res.body.date).not.to.be.undefined;

            expect(res.body.log).not.to.be.undefined;

            let extract = res.body.log;

            expect(extract.dayOfYear.year).to.equal(2019);
            expect(extract.dayOfYear.month).to.equal(1);
            expect(extract.dayOfYear.day).to.equal(3);

            expect(extract.sensors.length).to.equal(2);
            expect(extract.sensors[0]).to.equal("foo");
            expect(extract.sensors[1]).to.equal("bar");

            expect(extract.entries.length).to.equal(1);
            expect(extract.entries[0].readings.length).to.equal(2);
            expect(extract.entries[0].readings[1]).to.equal(67.8);
        });
    });
});

const extractA = {
    sensors: ["foo", "bar"],

    dayOfYear: new DayOfYear({ year: 2019, month: 1, day: 3}),

    entries: [
        {
            date: new Date("2019-01-03T12:00:00"),
            heating: true,
            hotWater: false,
            readings: [ 11.1, 67.8 ],
        },
    ],
};
