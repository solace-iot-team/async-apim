import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  APSUserResponseList, 
  ApsUsersService, 
  EAPSOrganizationAuthRole, 
  EAPSSystemAuthRole,
  ListApsUsersResponse,
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import { APSUsersDBMigrate, APSUser_DB_0, APSUser_DB_1 } from '../../server/api/services/APSUsersService/APSUsersDBMigrate';
import APSUsersService from '../../server/api/services/APSUsersService/APSUsersService';
import { ApsUsersHelper } from '../lib/apsUsers.helper';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const OrganizationId = 'migrate-users-org';
const OrganizationId2 = 'migrate-users-org-2';
const NumberOfUsers = 5;
const UserIdPostFix = 'migrate_user@async-apim.test';

const getNumberStr = (num: number): string => {
  return String(num).padStart(5, '0');
}
const getUserIdFromNumber = (schemaVersion: number, num: number): string => {
  return `${getNumberStr(schemaVersion)}-${getNumberStr(num)}_${UserIdPostFix}`;
}
const createUser_DB_0_List = (numberOfUsers: number): Array<APSUser_DB_0> => {
  const userList: Array<APSUser_DB_0> = [];
  const schemaVersion = 0;
  for(let num=0; num < numberOfUsers; num++) {
    const userId = getUserIdFromNumber(schemaVersion, num);
    const user: APSUser_DB_0 = {
      _id: userId,
      userId: userId,
      isActivated: true,
      password: 'pass',
      profile: {
        email: userId,
        first: 'first',
        last: 'last'
      },
      roles: [EAPSSystemAuthRole.LOGIN_AS, EAPSSystemAuthRole.SYSTEM_ADMIN],
      memberOfOrganizations: [ OrganizationId ]
    }
    userList.push(user);
  }
  return userList;
}

const createUser_DB_1_List = (numberOfUsers: number): Array<APSUser_DB_1> => {
  const userList: Array<APSUser_DB_1> = [];
  const schemaVersion = 1;
  for(let num=0; num < numberOfUsers; num++) {
    const userId = getUserIdFromNumber(schemaVersion, num);
    const user: APSUser_DB_1 = {
      _id: userId,
      userId: userId,
      isActivated: true,
      password: 'pass',
      profile: {
        email: userId,
        first: 'first',
        last: 'last'
      },
      systemRoles: [EAPSSystemAuthRole.LOGIN_AS, EAPSSystemAuthRole.SYSTEM_ADMIN],
      memberOfOrganizations: [ 
        {
          organizationId: OrganizationId,
          roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN, EAPSOrganizationAuthRole.LOGIN_AS, EAPSOrganizationAuthRole.API_TEAM, EAPSOrganizationAuthRole.API_CONSUMER]
        },
        {
          organizationId: OrganizationId2,
          roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN, EAPSOrganizationAuthRole.LOGIN_AS, EAPSOrganizationAuthRole.API_TEAM, EAPSOrganizationAuthRole.API_CONSUMER]
        },
      ]
    }
    userList.push(user);
  }
  return userList;
}

describe(`${scriptName}`, () => {

  beforeEach(() => {
    TestContext.newItId();
  });

  after(`${scriptName}: AFTER: delete all users`, async() => {
    TestContext.newItId();
    try {
      const apsUserResponseList: APSUserResponseList = await ApsUsersHelper.deleteAllUsers()
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

// ****************************************************************************************************************
// * OpenApi API Tests *
// ****************************************************************************************************************

  it(`${scriptName}: PREPARE: delete all users`, async () => {
    try {
      const apsUserResponseList: APSUserResponseList = await ApsUsersHelper.deleteAllUsers()
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('error')}`).to.be.true;
    }
  });

  it(`${scriptName}: should create user DB 0 list`, async () => {
    try {
      const userList = createUser_DB_0_List(NumberOfUsers);
      for(const user of userList) {

        const created = await APSUsersService.getPersistenceService().create({
          collectionDocumentId: user.userId,
          collectionDocument: user,
          collectionSchemaVersion: undefined
        });
        //TestLogger.logMessageWithId(`created DB_0 user = \n${JSON.stringify(created, null, 2)}`);
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

  it(`${scriptName}: should migrate all DB 0 users`, async () => {
    try {
      const numUsersMigrated = await APSUsersDBMigrate.migrate(APSUsersService);
      expect(numUsersMigrated, TestLogger.createTestFailMessage(`incorrect numUsersMigrated=${numUsersMigrated}`)).to.equal(NumberOfUsers);
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

  it(`${scriptName}: should get all migrated DB 0 users via API`, async () => {
    try {
      const expectedTotalCount = NumberOfUsers;
      const searchResponse: ListApsUsersResponse = await ApsUsersService.listApsUsers({        
        pageSize: 100
      });
      expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`searchResponse.meta.totalCount mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
      expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
      expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
  });

  it(`${scriptName}: should create user DB 1 list`, async () => {
    try {
      const userList = createUser_DB_1_List(NumberOfUsers);
      for(const user of userList) {
        const created = await APSUsersService.getPersistenceService().create({
          collectionDocumentId: user.userId,
          collectionDocument: user,
          collectionSchemaVersion: 1
        });
        //TestLogger.logMessageWithId(`created DB_0 user = \n${JSON.stringify(created, null, 2)}`);
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

  it(`${scriptName}: should migrate all DB 1 users`, async () => {
    try {
      const numUsersMigrated = await APSUsersDBMigrate.migrate(APSUsersService);
      expect(numUsersMigrated, TestLogger.createTestFailMessage(`incorrect numUsersMigrated=${numUsersMigrated}`)).to.equal(NumberOfUsers);
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

  it(`${scriptName}: should get all migrated DB 1 users via API`, async () => {
    try {
      const expectedTotalCount = NumberOfUsers * 2;
      const searchResponse: ListApsUsersResponse = await ApsUsersService.listApsUsers({        
        pageSize: 100
      });
      expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`searchResponse.meta.totalCount mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
      expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
      expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
  });


});

