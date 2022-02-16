import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const apiBase = `${TestContext.getApiBase()}/apsBusinessGroups`;

describe(`${scriptName}`, () => {

  beforeEach(() => {
    TestContext.newItId();
  });

  // after(async() => {
  //   // TestContext.newItId();      
  //   // try {
  //   //   const listOrgResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
  //   //   const orgList: APSOrganizationList = listOrgResponse.list;
  //   //   for(const org of orgList) {
  //   //     await ApsAdministrationService.deleteApsOrganization({
  //   //       organizationId: org.organizationId
  //   //     });
  //   //   }
  //   // } catch (e) {
  //   //   expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
  //   //   expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
  //   // }
  // });

  // ****************************************************************************************************************
  // * Raw API Tests *
  // ****************************************************************************************************************

  it(`${scriptName}: should catch missing parameter external_system_id`, async() => {
    // cannot create a test that detects external_system_id is missing, interpreted as orgId by server
    const resource = `${apiBase}/organizationId/externalSystem/xxxx`;
    const res: request.Response = await request(Server)
      .get(resource);
    TestContext.setFromSuperTestRequestResponse(res);
    // expect(res.status, TestLogger.createTestFailMessage('status code')).equal(405);
    // expect(res.header, TestLogger.createTestFailMessage('header "allow"')).to.be.an('object').that.has.property('allow').contains('GET, POST'); 
    // expect(res.body, TestLogger.createTestFailMessage('errorId')).to.be.an('object').that.has.property('errorId').equal(APSErrorIds.OPEN_API_REQUEST_VALIDATION);
    // expect(res.body, TestLogger.createTestFailMessage('meta')).to.have.property('meta');
    // expect(res.body.meta, TestLogger.createTestFailMessage('errors')).to.be.an('object').that.has.property('errors').to.be.an('array').of.length(1);
    // expect(res.body.meta, TestLogger.createTestFailMessage('headers')).to.be.an('object').that.has.property('headers').to.be.an('object');
    // expect(false, TestLogger.createTestFailMessage('continue here')).to.be.true;
  });

});

