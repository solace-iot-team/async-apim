import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../../server/index';
import path from 'path';
import _ from 'lodash';
import { TestContext, TestLogger } from '../lib/test.helpers';
import { 
  ApiError, 
  ApsAdministrationService, 
  APSError, 
  APSErrorIds, 
  APSOrganizationRolesList, 
  APSUserCreate, 
  APSUserResponse, 
  APSUserResponseList, 
  ApsUsersService, 
  EAPSOrganizationAuthRole, 
  EAPSSystemAuthRole,
  ListApsUsersResponse
} from '../../src/@solace-iot-team/apim-server-openapi-node';
import { ApsUsersHelper } from '../lib/apsUsers.helper';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const NumberOfBatches = 5;
const NumberUsersPerBatch = 5;
const SearchCommonOrganizationId_0 = 'common-org-0';
const SearchCommonOrganizationId_1 = 'common-org-1';
const SearchCommonOrganizationId_2 = 'common-org-2';
const UserIdPostFix = 'user@async-apim.test';
const commonOrgRolesList: APSOrganizationRolesList = [
  { 
    organizationId: SearchCommonOrganizationId_0,
    roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN]
  },
  { 
    organizationId: SearchCommonOrganizationId_1,
    roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN]
  },
  { 
    organizationId: SearchCommonOrganizationId_2,
    roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN]
  }
];


type TUserBatchList = Array<
  {
    batchNumber: number;
    userList: Array<APSUserCreate>;
  }
>;

let NumberIsActivedUsers: number = 0;
let NumberNotIsActivedUsers: number = 0;
const getIsActivated = (num: number): boolean => {
  const isActivated = (num % 2 === 0);
  if(isActivated) NumberIsActivedUsers++;
  else NumberNotIsActivedUsers++;
  return isActivated;
}
const getNumberStr = (num: number): string => {
  return String(num).padStart(5, '0');
}
const getOrgIdFromNum = (num: number): string => {
  return `org-${getNumberStr(num)}`;
}
const getUserIdFromNumbers = (batchNum: number, userNum: number): string => {
  return `${getNumberStr(batchNum)}-${getNumberStr(userNum)}_${UserIdPostFix}`;
}
const createUserBatches = (numberOfBatches: number, numberUsersPerBatch: number): TUserBatchList => {
  const userBatchList: TUserBatchList = [];
  
  for(let batchNumber=0; batchNumber < numberOfBatches; batchNumber++) {
    // const batchNumberStr: string = getNumberStr(batchNumber);
    const orgId = getOrgIdFromNum(batchNumber);
    
    const userList: Array<APSUserCreate> = [];

    for(let userNumber=0; userNumber < numberUsersPerBatch; userNumber++) {
      const userId = getUserIdFromNumbers(batchNumber, userNumber);
      const apsUserCreate: APSUserCreate = {
        isActivated: getIsActivated(userNumber),
        userId: userId,
        password: 'password',
        profile: {
          email: userId,
          first: 'first',
          last: 'last'
        },
        systemRoles: [EAPSSystemAuthRole.LOGIN_AS, EAPSSystemAuthRole.SYSTEM_ADMIN],
        memberOfOrganizations: [
          ...commonOrgRolesList,
          { 
            organizationId: orgId,
            roles: [EAPSOrganizationAuthRole.ORGANIZATION_ADMIN]
          },
        ]
      }
      userList.push(apsUserCreate);
    }

    userBatchList.push( {
      batchNumber: batchNumber,
      userList: userList
    })
  }

  return userBatchList;
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

  // it(`${scriptName}: should print user batches`, async () => {
  //   const userBatchList = createUserBatches(NumberOfBatches, NumberUsersPerBatch);
  //   TestLogger.logMessageWithId(`userBatchList=\n${JSON.stringify(userBatchList, null, 2)}`);
  // });
  it(`${scriptName}: PREPARE: delete all users`, async () => {
    try {
      const apsUserResponseList: APSUserResponseList = await ApsUsersHelper.deleteAllUsers()
    } catch (e) {
      expect(e instanceof ApiError, `${TestLogger.createNotApiErrorMesssage(e.message)}`).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('error')}`).to.be.true;
    }
  });

  it(`${scriptName}: should create organizations for referencing`, async () => {
    try {
      const orgIdList = [
        SearchCommonOrganizationId_0,
        SearchCommonOrganizationId_1,
        SearchCommonOrganizationId_2
      ]
      for (const orgId of orgIdList) {
        await ApsAdministrationService.createApsOrganization({
          requestBody: {
            organizationId: orgId,
            displayName: orgId
          }
        });
      }
      for(let batchNumber=0; batchNumber < NumberOfBatches; batchNumber++) {
        const orgId = getOrgIdFromNum(batchNumber);
        await ApsAdministrationService.createApsOrganization({
          requestBody: {
            organizationId: orgId,
            displayName: orgId
          }
        });
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, `${TestLogger.createTestFailMessage('failed')}`).to.be.true;
    }
  });

  it(`${scriptName}: should create user batches`, async () => {
    try {
      const userBatchList = createUserBatches(NumberOfBatches, NumberUsersPerBatch);
      for(const userBatch of userBatchList) {

        for(const user of userBatch.userList) {

          const apsUserResponse: APSUserResponse = await ApsUsersService.createApsUser({
            requestBody: user
          });

        }
      }
    } catch (e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;
    }
  });

  it(`${scriptName}: should return correct search result for searchOrganizationId`, async () => {

    let expectedTotalCount = 0;
    let searchResponse: ListApsUsersResponse;
    try {
      expectedTotalCount = NumberUsersPerBatch * NumberOfBatches;
      searchResponse = await ApsUsersService.listApsUsers({
        searchOrganizationId: SearchCommonOrganizationId_0
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`result count for searchOrganizationId mismatch`)).to.equal(expectedTotalCount);  

    // all orgs
    for(let batchNumber=0; batchNumber < NumberOfBatches; batchNumber++) {
      const orgId = getOrgIdFromNum(batchNumber);

      try { 
        expectedTotalCount = NumberOfBatches;
        searchResponse = await ApsUsersService.listApsUsers({
          searchOrganizationId: orgId
        });
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
        expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
      }
      expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  
      expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for searchOrganizationId mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
      expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`result count for searchOrganizationId mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
    }
  });

  it(`${scriptName}: should return correct search result for excludeSearchOrganizationId`, async () => {

    let expectedTotalCount = 0;
    let searchResponse: ListApsUsersResponse;

    // none
    try {
      expectedTotalCount = 0;
      searchResponse = await ApsUsersService.listApsUsers({
        excludeSearchOrganizationId: SearchCommonOrganizationId_0
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for excludeSearchOrganizationId mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`result count for excludeSearchOrganizationId mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  

    // all all but 1
    try {
      expectedTotalCount = (NumberOfBatches - 1) * NumberUsersPerBatch;
      searchResponse = await ApsUsersService.listApsUsers({
        excludeSearchOrganizationId: getOrgIdFromNum(0)
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for excludeSearchOrganizationId mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`result count for excludeSearchOrganizationId mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
  });

  it(`${scriptName}: should return api error for using searchOrganizationId & excludeSearchOrganizationId together`, async () => {
    // invalid query
    try {
      await ApsUsersService.listApsUsers({
        excludeSearchOrganizationId: SearchCommonOrganizationId_0,
        searchOrganizationId: SearchCommonOrganizationId_1
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      const apiError: ApiError = e;
      expect(apiError.status, TestLogger.createTestFailMessage('status not 400')).equal(400);
      const apsError: APSError = apiError.body;
      expect(apsError.errorId, TestLogger.createTestFailMessage('incorrect errorId')).equal(APSErrorIds.INVALID_QUERY_PARAMETER_COMBINATION);
      expect(apsError.meta.invalidQueryParameterCombinationList, TestLogger.createTestFailMessage(`response does not contain excludeSearchOrganizationId`)).contains('excludeSearchOrganizationId');
      expect(apsError.meta.invalidQueryParameterCombinationList, TestLogger.createTestFailMessage('response does not contain searchOrganizationId')).contains('searchOrganizationId');
      expect(apsError.meta.apsObjectName, TestLogger.createTestFailMessage('incorrect apsObjectName')).equal('APSUser');
      return;
    }
    expect(false, TestLogger.createTestFailMessage('should not get here')).to.be.true;
  });

  it(`${scriptName}: should return correct search result for searchIsActivated`, async () => {

    let expectedTotalCount = 0;
    let searchResponse: ListApsUsersResponse;

    // not activated
    try {
      expectedTotalCount = NumberNotIsActivedUsers;
      searchResponse = await ApsUsersService.listApsUsers({        
        searchIsActivated: false,
        pageSize: 100
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`searchResponse.meta.totalCount for searchIsActivated=false mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for searchIsActivated=false mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  

    // activated
    try {
      expectedTotalCount = NumberIsActivedUsers;
      searchResponse = await ApsUsersService.listApsUsers({
        searchIsActivated: true
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for searchIsActivated=true mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`result count for searchIsActivated=true mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
  });

  it(`${scriptName}: should return correct search result for searchUserId`, async () => {

    let expectedTotalCount = 0;
    let searchResponse: ListApsUsersResponse;
    let searchUserId: string;
    // exact match
    try {
      searchUserId = getUserIdFromNumbers(0, 0);
      expectedTotalCount = 1;
      searchResponse = await ApsUsersService.listApsUsers({        
        searchUserId: searchUserId,
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`searchResponse.meta.totalCount for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount for searchUserId=${searchUserId}, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  

    // contains
    try {
      searchUserId = getNumberStr(0);
      expectedTotalCount = NumberOfBatches + NumberUsersPerBatch -1;
      searchResponse = await ApsUsersService.listApsUsers({        
        searchUserId: searchUserId,
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`searchResponse.meta.totalCount for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount for searchUserId=${searchUserId}, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  

    // all
    try {
      searchUserId = UserIdPostFix;
      expectedTotalCount = NumberOfBatches * NumberUsersPerBatch;
      searchResponse = await ApsUsersService.listApsUsers({        
        searchUserId: searchUserId,
        pageSize: 100
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`searchResponse.meta.totalCount for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount for searchUserId=${searchUserId}, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  

    // single batch
    try {
      // '00004_user@async-apim.test'
      searchUserId = `${getNumberStr(0)}_${UserIdPostFix}`;
      expectedTotalCount = NumberUsersPerBatch;
      searchResponse = await ApsUsersService.listApsUsers({        
        searchUserId: searchUserId,
        pageSize: 100
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`searchResponse.meta.totalCount for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount for searchUserId=${searchUserId}, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  
  });

  it(`${scriptName}: should return correct search result for combined searchUserId & searchIsActivated`, async () => {

    let expectedTotalCount = 0;
    let searchResponse: ListApsUsersResponse;
    let searchUserId: string;
    // exact match found
    try {
      searchUserId = getUserIdFromNumbers(0, 0);
      expectedTotalCount = 1;
      searchResponse = await ApsUsersService.listApsUsers({        
        searchUserId: searchUserId,
        searchIsActivated: true
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`searchResponse.meta.totalCount for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount for searchUserId=${searchUserId}, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  

    // exact match not found
    try {
      searchUserId = getUserIdFromNumbers(0, 0);
      expectedTotalCount = 0;
      searchResponse = await ApsUsersService.listApsUsers({        
        searchUserId: searchUserId,
        searchIsActivated: false
      });
    } catch(e) {
      expect(e instanceof ApiError, TestLogger.createNotApiErrorMesssage(e.message)).to.be.true;
      expect(false, TestLogger.createTestFailMessage('error')).to.be.true;  
    }
    expect(searchResponse.meta.totalCount, TestLogger.createTestFailMessage(`searchResponse.meta.totalCount for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.meta.totalCount}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length for searchUserId=${searchUserId} mismatch, expected=${expectedTotalCount}, received=${searchResponse.list.length}`)).to.equal(expectedTotalCount);  
    expect(searchResponse.list.length, TestLogger.createTestFailMessage(`searchResponse.list.length to equal totalCount for searchUserId=${searchUserId}, length=${searchResponse.list.length}, totalCount=${searchResponse.meta.totalCount}`)).to.equal(searchResponse.meta.totalCount);  
  });

  // combine searchOrganizationId, searchIsActivated, searchUserId

});

