import 'mocha';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should have 1 It id`, async () => {
      TestLogger.logMessageWithId('logMessageWithId - should have 1 It Id ....');
    });

    it(`${scriptName}: should have another It id`, async () => {

      TestLogger.logMessageWithId('logMessageWithId - should have another It id ....');
      // expect(false, TestLogger.createTestFailMessage('createTestFailMessage: should have another It id')).to.be.true;
    });


  });
});

