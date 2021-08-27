import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestContext, TestLogger } from './lib/test.helpers';
import { isInstanceOfApiError } from './lib/api.helpers';
import { ExamplesService } from '../src/@solace-iot-team/apim-server-openapi-node';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> initializing ...");

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should get all examples`, async () => {
      let response: any;
      try {
        response = await ExamplesService.getExamplesService();
      } catch (e) {
        expect(isInstanceOfApiError(e), `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        let message = `examples service`;
        expect(false, `${TestLogger.createTestFailMessage(message)}`).to.be.true;
      }
      expect(response, `${TestLogger.createTestFailMessage('array of length 2')}`).to.be.an.an('array').of.length(2);
    });

  });
});
