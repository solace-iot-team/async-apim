import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server/index';
import path from 'path';
import { TestContext, TestLogger } from './lib/test.helpers';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    const apiBase = `${TestContext.getApiBase()}/apsUser`;

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should catch bad config`, async() => {
      const res = await request(Server)
        .get(apiBase)

      TestLogger.logMessageWithId(`res = ${JSON.stringify(res, null, 2)}\nbody-json = ${JSON.stringify(JSON.parse(res.text), null, 2)}`);

      expect(res.status, TestLogger.createTestFailMessage('status code')).equal(400);
      expect(res.body).to.be.an('object').that.has.property('errorId').equal('openApiValidation');
      expect(res.body).to.have.property('meta').to.be.an('array').of.length(2);
      expect(JSON.stringify(res.body.meta)).contains('first');
      expect(JSON.stringify(res.body.meta)).contains('last');
    });

  });
});

