import { 
  AdministrationService,
  Organization,
  OrganizationResponse,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { 
  ApsAdministrationService,
  APSDisplayName, 
  APSId, 
  APSOrganization, 
  APSOrganizationCreate, 
  APSOrganizationList, 
  APSOrganizationUpdate, 
  ListAPSOrganizationResponse
} from "../_generated/@solace-iot-team/apim-server-openapi-browser";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from './APEntityIdsService';
import { Globals } from './Globals';

export type TAPOrganization = OrganizationResponse & {
  displayName: APSDisplayName;
}
export type TAPOrganizationList = Array<TAPOrganization>;
export type TAPOrganizationCreateRequest = TAPOrganization;
export type TAPOrganizationUpdateRequest = TAPOrganization;
export type TAPOrganizationAssets = {
  userList: Array<TAPEntityId>;
  environmentList: Array<TAPEntityId>;
  apiList: Array<TAPEntityId>;
  apiProductList: Array<TAPEntityId>;
  appList: Array<TAPEntityId>;
}

export class APOrganizationsService {
  private static componentName = "APOrganizationsService";

  public static C_SECRET_MASK = '***';

  public static get_Default_DeveloperPortalApp_CredentailsExpiryDuration(): number {
    // 6 months in milliseconds
    return (6 * 30 * 24 * 3600 * 1000);
  }

  private static _maskSecrets = (obj: any, mask: string): any => {
    const funcName = '_maskSecrets';
    const logName = `${APOrganizationsService.componentName}.${funcName}()`;
    // TODO: implement array traversal if required
    if(Array.isArray(obj)) throw new Error(`${logName}: arrays are not supported`);
    const isObject = (obj:any ) => obj && typeof obj === 'object';
    Object.keys(obj).forEach( key => {
      const value = obj[key];
      const k = key.toLowerCase();
      if( k.includes('token') && typeof value === 'string') {
        obj[key] = mask;
      }
      if(Array.isArray(value) || isObject(value)) APOrganizationsService._maskSecrets(value, mask);
    });
    return obj;
  }

  public static maskSecrets = (connectorOrg: Organization, secretMask: string = APOrganizationsService.C_SECRET_MASK): Organization => {
    // const funcName = 'maskSecrets';
    // const logName = `${APOrganizationsService.componentName}.${funcName}()`;
    // console.log(`${logName}: connectorOrg=${JSON.stringify(connectorOrg, null, 2)}`);
    const maskedConnectorOrg = APOrganizationsService._maskSecrets(connectorOrg, secretMask);
    // console.log(`${logName}: maskedConnectorOrg=${JSON.stringify(maskedConnectorOrg, null, 2)}`);
    return maskedConnectorOrg;
  }

  public static sortAPOrganizationList_byDisplayName = (apOrganizationList: TAPOrganizationList): TAPOrganizationList => {
    return apOrganizationList.sort( (e1: TAPOrganization, e2: TAPOrganization) => {
      if(e1.displayName < e2.displayName) return -1;
      if(e1.displayName > e2.displayName) return 1;
      return 0;
    });
  }

  public static listOrganizationEntityIdList_For_OrganizationIdList = async( { organizationIdList } : {
    organizationIdList: Array<string>;
  }): Promise<TAPEntityIdList> => {
    const allOrgs: TAPEntityIdList = await APOrganizationsService.listOrganizationEntityIdList();
    return APEntityIdsService.create_EntityIdList_FilteredBy_IdList({
      apEntityIdList: allOrgs,
      idList: organizationIdList
    });
  }

  public static listOrganizationEntityIdList = async(): Promise<TAPEntityIdList> => {
    const apsResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
    const list = apsResponse.list;
    return list.map( (x) => {
      return {
        id: x.organizationId,
        displayName: x.displayName
      };
    });
  }

  public static listOrganizations = async(options: any): Promise<TAPOrganizationList> => {
    const _connectorOrgList: Array<Organization> = await AdministrationService.listOrganizations(options);
    const _apsResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
    const _apsOrgList: APSOrganizationList = _apsResponse.list;
    // filter out the health check org if exists
    const idx = _connectorOrgList.findIndex((org: Organization) => {
      return org.name === Globals.getHealthCheckOrgName()
    });
    if(idx > -1) _connectorOrgList.splice(idx, 1);
    const resultOrgList: TAPOrganizationList = [];
    _connectorOrgList.forEach( (connectorOrg: Organization) => {
      const apsOrg = _apsOrgList.find( (apsOrg: APSOrganization) => {
        return apsOrg.organizationId === connectorOrg.name;
      });
      const apOrg: TAPOrganization = {
        ...APOrganizationsService.maskSecrets(connectorOrg),
        displayName: apsOrg ? apsOrg.displayName : connectorOrg.name
      }
      resultOrgList.push(apOrg);
    });
    return resultOrgList;
  }

  private static getConnectorOrganization = async(organizationId: APSId, secretMask: string = APOrganizationsService.C_SECRET_MASK): Promise<OrganizationResponse> => {
    return APOrganizationsService.maskSecrets(await AdministrationService.getOrganization({
      organizationName: organizationId
    }), secretMask);
  }
  public static getOrganizationStatus = async(organizationId: APSId, organizationDisplayName?: string): Promise<TAPOrganization> => {
    const connectorOrganization: Organization = await APOrganizationsService.getConnectorOrganization(organizationId);
    return {
      ...connectorOrganization,
      displayName: organizationDisplayName ? organizationDisplayName : connectorOrganization.name
    }
  }
  public static getOrganizationEntityId = async(organizationId: string): Promise<TAPEntityId> => {
    const apsOrganization: APSOrganization = await ApsAdministrationService.getApsOrganization({
      organizationId: organizationId
    });
    return {
      id: apsOrganization.organizationId,
      displayName: apsOrganization.displayName
    };
  }
  public static getOrganization = async(organizationId: APSId, secretMask: string = APOrganizationsService.C_SECRET_MASK): Promise<TAPOrganization> => {
    const connectorOrganization: Organization = await APOrganizationsService.getConnectorOrganization(organizationId, secretMask);
    let apsOrganization: APSOrganization | undefined = undefined;
    try {
      apsOrganization = await ApsAdministrationService.getApsOrganization({
        organizationId: organizationId
      });
    } catch(e) {
      // ignore 
    }
    const apOrganization: TAPOrganization = {
      ...connectorOrganization,
      displayName: apsOrganization ? apsOrganization.displayName : connectorOrganization.name
    }
    return apOrganization;
  }

  public static getOrganizationAssets = async({ organizationId }: { organizationId: APSId }): Promise<TAPOrganizationAssets> => {
    // TODO: move to APAssetDisplayService
    // TODO: return at least id and displayName
    return {
      userList: [ { id: 'userId', displayName: 'displayName-userId'} ],
      environmentList: [ { id: 'envId', displayName: 'displayName-envId'} ],
      apiList: [ { id: 'apiId', displayName: 'displayName-apiId' } ],
      apiProductList: [ { id: 'apiProductId', displayName: 'displayName-apiProductId'} ],
      appList: [ { id: 'appId', displayName: 'displayName-appId'}]
    };
  }

  public static createOrganization = async({ requestBody, }: { requestBody: TAPOrganizationCreateRequest}): Promise<TAPOrganization> => {
    const connectorRequestBody: Organization = {
      name: requestBody.name,
      "cloud-token": requestBody['cloud-token'],
      sempV2Authentication: requestBody.sempV2Authentication
    }
    const createdConnectorOrg = await AdministrationService.createOrganization({
      requestBody: connectorRequestBody
    });
    const apsRequestBody: APSOrganizationCreate = {
      organizationId: requestBody.name,
      displayName: requestBody.displayName
    }
    const createdApsOrg = await ApsAdministrationService.createApsOrganization({
      requestBody: apsRequestBody
    });
    return {
      ...createdConnectorOrg,
      displayName: createdApsOrg.displayName
    }
  }

  public static updateOrganization = async({ organizationId, requestBody, }: { organizationId: APSId, requestBody: TAPOrganizationUpdateRequest}): Promise<TAPOrganization> => {
    const connectorRequestBody: Organization = {
      name: requestBody.name,
      "cloud-token": requestBody['cloud-token'],
      sempV2Authentication: requestBody.sempV2Authentication
    }
    const updatedConnectorOrganization = await AdministrationService.updateOrganization({
      organizationName: organizationId, 
      requestBody: connectorRequestBody
    });
    let updatedApsOrg: APSOrganization;
    try {
      const apsRequestBody: APSOrganizationUpdate = {
        displayName: requestBody.displayName
      }
      updatedApsOrg = await ApsAdministrationService.updateApsOrganization({
        organizationId: organizationId,
        requestBody: apsRequestBody
      });
    } catch(e) {
      // create it if it doesn't exist
      const apsRequestBody: APSOrganizationCreate = {
        organizationId: organizationId,
        displayName: requestBody.displayName
      }
      updatedApsOrg = await ApsAdministrationService.createApsOrganization({
        requestBody: apsRequestBody
      });
    }
    return {
      ...updatedConnectorOrganization,
      displayName: updatedApsOrg.displayName
    }
  }

  public static deleteOrganization = async({ organizationId }: { organizationId: APSId }): Promise<void> => {
    
    await AdministrationService.deleteOrganization({
      organizationName: organizationId
    });

    await ApsAdministrationService.deleteApsOrganization({
      organizationId: organizationId
    });

  }
}