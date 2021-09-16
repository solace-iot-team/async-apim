import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server/index';
import path from 'path';
import { TestContext, TestLogger } from './lib/test.helpers';
import { 
  ExamplesService,
  ExampleList,
  ApiError
} from '../src/@solace-iot-team/apim-server-openapi-node';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    const apiStartupBase = `${TestContext.getApiBase()}/examples`; 

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should start server`, async() => {
      const res = await request(Server).get(apiStartupBase);
      TestLogger.logMessageWithId(`${scriptName}: res = ${JSON.stringify(res, null, 2)}\nbody-json = ${JSON.stringify(JSON.parse(res.text), null, 2)}`);
      expect(res.status, TestLogger.createTestFailMessage('status code')).equal(200);
    });

    it(`${scriptName}: should get all 3 examples`, async () => {
      let exampleList: ExampleList
      try {
        exampleList = await ExamplesService.listExamples();
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('log:')}`).to.be.true;
      }
      expect(exampleList, `${TestLogger.createTestFailMessage('array of length 2')}`).to.be.an.an('array').of.length(3);
    });

    it(`${scriptName}: should get examples header`, async () => {
      let totalCount: number;
      try {
        const headerValue: string = await ExamplesService.listExamplesTotalCount();
        totalCount = +headerValue;
        if(isNaN(totalCount)) throw new Error(`${scriptName}: headerValue not a number: ${headerValue}`);
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('log:')}`).to.be.true;
      }
      expect(totalCount, `${TestLogger.createTestFailMessage('3')}`).to.equal(3);
    });

  });
});
