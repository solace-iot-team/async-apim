import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  APSOrganizationList, 
  ListAPSOrganizationResponse,
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import { APSOrganizationsDBMigrate, APSOrganization_DB_v0 } from '../../server/api/services/apsAdministration/APSOrganizationsDBMigrate';
import { ApsOrganizationsHelper } from '../lib/apsOrganizations.helper';
import APSOrganizationsService from '../../server/api/services/apsAdministration/APSOrganizationsService';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const NumberOfOrganizations = 5;

const getNumberStr = (num: number): string => {
  return String(num).padStart(5, '0');
}
const getIdFromNumber = (schemaVersion: number, num: number): string => {
  return `${getNumberStr(schemaVersion)}-${getNumberStr(num)}_migrate-org`;
}

const create_Org_DB_v0_List = (num: number): Array<APSOrganization_DB_v0> => {
  const list: Array<APSOrganization_DB_v0> = [];
  const schemaVersion = 0;
  for(let i=0; i<num; i++) {
    const orgId = getIdFromNumber(schemaVersion, i);
    const org_DB_v0: APSOrganization_DB_v0 = {
      _id: orgId,
      organizationId: orgId,
      displayName: `displayName for ${orgId}`
    }
    list.push(org_DB_v0);
  }
  return list;
}

describe(`${scriptName}`, () => {

  beforeEach(() => {
    TestContext.newItId();
  });

  // after(`${scriptName}: AFTER: delete all users`, async() => {
  //   TestContext.newItId();
  //   try {
  //     const apsUserResponseList: APSUserResponseList = await ApsUsersHelper.deleteAllUsers()
  //   } catch (e) {
  //     expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
  //     expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
  //   }
  // });

  it(`${scriptName}: PREPARE: delete all orgs`, async () => {
    try {
      const deletedList: APSOrganizationList = await ApsOrganizationsHelper.deleteAllOrganizations();
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('error')}`).to.be.true;
    }
  });

  it(`${scriptName}: should create org DB 0 list`, async () => {
    try {
      const schemaVersion: number = 0;
      const list: Array<APSOrganization_DB_v0> = create_Org_DB_v0_List(NumberOfOrganizations);
      for(const org of list) {
        const created = await APSOrganizationsService.getPersistenceService().create({
          collectionDocumentId: org.organizationId,
          collectionDocument: org,
          collectionSchemaVersion: schemaVersion
        });
        TestLogger.logMessageWithId(`created = \n${JSON.stringify(created, null, 2)}`);
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

  it(`${scriptName}: should migrate all DB 0 orgs to DB 'latest' orgs`, async () => {
    try {
      const numberMigrated = await APSOrganizationsDBMigrate.migrate(APSOrganizationsService);
      expect(numberMigrated, TestLogger.createTestFailMessage(`incorrect numberMigrated=${numberMigrated}`)).to.equal(numberMigrated);
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

  it(`${scriptName}: should get all migrated DB orgs via API`, async () => {
    try {
      const expectedTotalCount = NumberOfOrganizations;
      const listAPSOrganizationResponse: ListAPSOrganizationResponse = await APSOrganizationsService.all();
      TestLogger.logMessageWithId(`listAPSOrganizationResponse = \n${JSON.stringify(listAPSOrganizationResponse, null, 2)}`);
      expect(listAPSOrganizationResponse.meta.totalCount, TestLogger.createTestFailMessage(`listAPSOrganizationResponse.meta.totalCount mismatch, expected=${expectedTotalCount}, received=${listAPSOrganizationResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
      expect(listAPSOrganizationResponse.list.length, TestLogger.createTestFailMessage(`listAPSOrganizationResponse.list.length mismatch, expected=${expectedTotalCount}, received=${listAPSOrganizationResponse.list.length}`)).to.equal(expectedTotalCount);  
      expect(listAPSOrganizationResponse.list.length, TestLogger.createTestFailMessage(`listAPSOrganizationResponse.list.length to equal totalCount, length=${listAPSOrganizationResponse.list.length}, totalCount=${listAPSOrganizationResponse.meta.totalCount}`)).to.equal(listAPSOrganizationResponse.meta.totalCount);  
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
  });

  // it(`${scriptName}: continue here`, async () => {
  //   expect(false, 'continue here').to.be.true;
  // });


});

