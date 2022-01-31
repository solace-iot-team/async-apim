import { 
  AdministrationService,
  CloudToken,
  Organization,
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
import { Globals } from './Globals';

export type TAPOrganization = Organization & {
  displayName: APSDisplayName;
}
export type TAPOrganizationList = Array<TAPOrganization>;
export type TAPOrganizationUpdateRequest = TAPOrganization;

export class APOrganizationsService {
  
  public static C_SECRET_MASK = '***';

  private static maskSecrets = (connectorOrg: Organization, secretMask: string = APOrganizationsService.C_SECRET_MASK): Organization => {
    if(connectorOrg['cloud-token']) {
      if(typeof connectorOrg['cloud-token'] === 'string') connectorOrg['cloud-token'] = secretMask;
      else {
        const ct: CloudToken = connectorOrg['cloud-token'];
        if(ct.cloud.token) ct.cloud.token = secretMask;
        if(ct.eventPortal.token) ct.eventPortal.token = secretMask;
      }
    }
    return connectorOrg; 
  }
  public static listOrganizations = async(options: any): Promise<TAPOrganizationList> => {
    const _connectorOrgList: Array<Organization> = await AdministrationService.listOrganizations(options);
    const _apsResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
    const _apsOrgList: APSOrganizationList = _apsResponse.list;
    // filter out the health check or if exists
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

  public static getOrganization = async(organizationId: APSId, secretMask: string = APOrganizationsService.C_SECRET_MASK): Promise<TAPOrganization> => {

    const connectorOrganization: Organization = await AdministrationService.getOrganization({
      organizationName: organizationId
    });
    let apsOrganization: APSOrganization | undefined = undefined;
    try {
      apsOrganization = await ApsAdministrationService.getApsOrganization({
        organizationId: organizationId
      });
    } catch(e) {
      // ignore 
    }
    const apOrganization: TAPOrganization = {
      ...APOrganizationsService.maskSecrets(connectorOrganization, secretMask),
      displayName: apsOrganization ? apsOrganization.displayName : connectorOrganization.name
    }
    return apOrganization;
  }

  public static updateOrganization = async({ organizationId, requestBody, }: { organizationId: APSId, requestBody: TAPOrganizationUpdateRequest}): Promise<void> => {
    const connectorRequestBody: Organization = {
      name: requestBody.name,
      "cloud-token": requestBody['cloud-token'],
      sempV2Authentication: requestBody.sempV2Authentication
    }
    await AdministrationService.updateOrganization({
      organizationName: organizationId, 
      requestBody: connectorRequestBody
    });
    try {
      const apsRequestBody: APSOrganizationUpdate = {
        displayName: requestBody.displayName
      }
      await ApsAdministrationService.updateApsOrganization({
        organizationId: organizationId,
        requestBody: apsRequestBody
      });
    } catch(e) {
      // create it if it doesn't exist
      const apsRequestBody: APSOrganizationCreate = {
        organizationId: organizationId,
        displayName: requestBody.displayName
      }
      await ApsAdministrationService.createApsOrganization({
        requestBody: apsRequestBody
      });
    }
  }

}