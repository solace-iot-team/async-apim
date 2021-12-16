import 'mocha';
import { expect } from 'chai';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from './lib/test.helpers';
import { 
  ApiError, 
  ApsConfigService, 
  APSAbout,
} from '../src/@solace-iot-team/apim-server-openapi-node';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    // ****************************************************************************************************************
    // * OpenApi API Tests *
    // ****************************************************************************************************************

    it(`${scriptName}: should return about`, async () => {
      try {
        const about: APSAbout = await ApsConfigService.getApsAbout();
      } catch (e) {
        expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
        expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
      }
    });

    // ****************************************************************************************************************
    // * Raw API Tests *
    // ****************************************************************************************************************

    // xit(`${scriptName}: should return unauthorized request`, async() => {
    //   // TODO
    // });

    // xit(`${scriptName}: should return forbidden request`, async() => {
    //   // TODO
    // });

  });
});

