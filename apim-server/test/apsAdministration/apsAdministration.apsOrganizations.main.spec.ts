import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  APSId,
  ApsAdministrationService,
} from '../../src/@solace-iot-team/apim-server-openapi-node';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationId: APSId = 'test_organization_0';

describe(`${scriptName}`, () => {

  // const apiBase = `${TestContext.getApiBase()}/apsConfig/apsConnectors`;

  beforeEach(() => {
    TestContext.newItId();
  });

  after(async() => {
    // TestContext.newItId();      
    // try {
    //   const result: ListApsConnectorsResponse = await ApsConfigService.listApsConnectors();
    //   const apsConnectorList: Array<APSConnector> = result.list;
    //   for (const apsConnector of apsConnectorList) {
    //     await ApsConfigService.deleteApsConnector({
    //       connectorId: apsConnector.connectorId
    //     });
    //   }
    // } catch (e) {
    //   expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
    //   expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    // }
  });

  // ****************************************************************************************************************
  // * OpenApi API Tests *
  // ****************************************************************************************************************

  it(`${scriptName}: should delete organization`, async () => {
    try {
      await ApsAdministrationService.deleteApsOrganization({
        organizationId: OrganizationId
      });
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
    expect(false, `${TestLogger.createTestFailMessage('continue here')}`).to.be.true;
  });


    // xit(`${scriptName}: should return unauthorized request`, async() => {
    //   // TODO
    // });

    // xit(`${scriptName}: should return forbidden request`, async() => {
    //   // TODO
    // });

});

