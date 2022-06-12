import { AdministrationService, ApiError, Organization, OrganizationResponse } from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";
import APSearchContentService, { IAPSearchContent } from "../../utils/APSearchContentService";
import { 
  ApsAdministrationService, 
  APSOrganization, 
  ListAPSOrganizationResponse 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { 
  APOrganizationsDisplayService, 
  IAPOrganizationDisplay, 
  IAPOrganizationDisplay_Connectivity, 
  IAPOrganizationDisplay_General, 
  IAPOrganizationDisplay_Integration
} from "./APOrganizationsDisplayService";

export interface IAPSystemOrganizationDisplay extends IAPOrganizationDisplay, IAPSearchContent {
  // nothing to add at the moment
}
export type TAPSystemOrganizationDisplayList = Array<IAPSystemOrganizationDisplay>;

export interface IAPSystemOrganizationDisplay_General extends IAPOrganizationDisplay_General {};

export interface IAPSystemOrganizationDisplay_Connectivity extends IAPOrganizationDisplay_Connectivity {};

export interface IAPSystemOrganizationDisplay_Integration extends IAPOrganizationDisplay_Integration {};

class APSystemOrganizationsDisplayService extends APOrganizationsDisplayService {
  private readonly ComponentName = "APSystemOrganizationsDisplayService";

  public create_Empty_ApOrganizationDisplay(): IAPSystemOrganizationDisplay {
    const apOrganizationDisplay: IAPOrganizationDisplay = super.create_Empty_ApOrganizationDisplay();
    const apSystemOrganizationDisplay: IAPSystemOrganizationDisplay = {
      ...apOrganizationDisplay,
      apSearchContent: ''
    };
    return apSystemOrganizationDisplay;
  }

  private create_ApSystemOrganizationDisplay_From_ApiEntities({ 
    connectorOrganizationResponse,
    apsOrganization,
  }: {
    connectorOrganizationResponse: OrganizationResponse;
    apsOrganization: APSOrganization;
  }): IAPSystemOrganizationDisplay {

    const apOrganizationDisplay: IAPOrganizationDisplay = this.create_ApOrganizationDisplay_From_ApiEntities({
      apsOrganization: apsOrganization,
      connectorOrganizationResponse: connectorOrganizationResponse
    });

    const apSystemOrganizationDisplay: IAPSystemOrganizationDisplay ={
      ...apOrganizationDisplay,
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<IAPSystemOrganizationDisplay>(apSystemOrganizationDisplay);
  }

  private create_ApsOrganization_From_ConnectorOrganization({ connectorOrganizationResponse }:{
    connectorOrganizationResponse: OrganizationResponse;
  }): APSOrganization {
    const apsOrganization: APSOrganization = {
      organizationId: connectorOrganizationResponse.name,
      displayName: connectorOrganizationResponse.name,
      appCredentialsExpiryDuration: this.get_DefaultAppCredentialsExpiryDuration_Millis(),
      maxNumApisPerApiProduct: this.get_DefaultMaxNumApis_Per_ApiProduct(),
    };
    return apsOrganization;
  }

  private create_ConnectorOrganizationCreate_From_ApSystemOrganzationDisplay({ apSystemOrganizationDisplay }:{
    apSystemOrganizationDisplay: IAPSystemOrganizationDisplay;
  }): Organization {

    const connectorOrganizationCreate: Organization = {
      name: apSystemOrganizationDisplay.apEntityId.id,
      "cloud-token": this.create_ConnectorCloudToken({
        apCloudConnectivityConfig: apSystemOrganizationDisplay.apCloudConnectivityConfig,
        apEventPortalConnectivityConfig: apSystemOrganizationDisplay.apEventPortalConnectivityConfig
      }),
      sempV2Authentication: this.create_ConnectorSempv2Authentication({
        apOrganizationSempv2AuthConfig: apSystemOrganizationDisplay.apOrganizationSempv2AuthConfig
      }),
    };

    return connectorOrganizationCreate;

  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public apiGet_ApOrganizationDisplay = async({ organizationId }:{
    organizationId: string;
  }): Promise<IAPSystemOrganizationDisplay> => {
    const apsOrganization: APSOrganization = await ApsAdministrationService.getApsOrganization({
      organizationId: organizationId
    });
    const connectorOrganizationResponse: OrganizationResponse = await this.apiGet_ConnectorOrganizationResponse({ 
      organizationId: organizationId 
    });
    const apSystemOrganizationDisplay: IAPSystemOrganizationDisplay = this.create_ApSystemOrganizationDisplay_From_ApiEntities({
      apsOrganization: apsOrganization,
      connectorOrganizationResponse: connectorOrganizationResponse
    });
    return apSystemOrganizationDisplay;
  }

  public apiGetList_ApSystemOrganizationDisplayList = async(): Promise<TAPSystemOrganizationDisplayList> => {
    // const funcName = 'apiGetList_ApSystemOrganizationDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // test downstream error handling
    // throw new Error(`${logName}: test error handling`);

    const listAPSOrganizationResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();

    const apSystemOrganizationDisplayList: TAPSystemOrganizationDisplayList = [];

    for(const apsOrganization of listAPSOrganizationResponse.list) {
      // get the connector org
      const connectorOrganizationResponse: OrganizationResponse = await this.apiGet_ConnectorOrganizationResponse({ organizationId: apsOrganization.organizationId });
      const apSystemOrganizationDisplay: IAPSystemOrganizationDisplay = this.create_ApSystemOrganizationDisplay_From_ApiEntities({
        apsOrganization: apsOrganization,
        connectorOrganizationResponse: connectorOrganizationResponse
      });
      apSystemOrganizationDisplayList.push(apSystemOrganizationDisplay);
    }
    return apSystemOrganizationDisplayList;
  }

  public apiGet_Importable_ApOrganizationDisplay = async({ organizationId }:{
    organizationId: string;
  }): Promise<IAPSystemOrganizationDisplay> => {
    const connectorOrganizationResponse: OrganizationResponse = await this.apiGet_ConnectorOrganizationResponse({ 
      organizationId: organizationId 
    });
    // create an apsOrg
    const apsOrganization: APSOrganization = this.create_ApsOrganization_From_ConnectorOrganization({
      connectorOrganizationResponse: connectorOrganizationResponse
    });
    const apSystemOrganizationDisplay: IAPSystemOrganizationDisplay = this.create_ApSystemOrganizationDisplay_From_ApiEntities({
      apsOrganization: apsOrganization,
      connectorOrganizationResponse: connectorOrganizationResponse
    });
    return apSystemOrganizationDisplay;
  }

  public apiGetList_Importable_ApSystemOrganizationDisplayList = async(): Promise<TAPSystemOrganizationDisplayList> => {
    // const funcName = 'apiGetList_Importable_ApSystemOrganizationDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // test downstream error handling
    // throw new Error(`${logName}: test error handling`);

    // get all the connector orgs
    const listConnectorOrganizations: Array<Organization> = await AdministrationService.listOrganizations({});
    // get all the aps orgs
    const listAPSOrganizationResponse: ListAPSOrganizationResponse = await ApsAdministrationService.listApsOrganizations();
    // create the importable list
    const importableOrganizationIdList: Array<string> = [];
    for(const connectorOrgannization of listConnectorOrganizations) {
      const found = listAPSOrganizationResponse.list.find( (x) => {
        return x.organizationId === connectorOrgannization.name;
      });
      if(found === undefined) importableOrganizationIdList.push(connectorOrgannization.name);
    }
    // create object list
    const apSystemOrganizationDisplayList: TAPSystemOrganizationDisplayList = [];
    for(const organizationId of importableOrganizationIdList) {
      // get the connector org
      const connectorOrganizationResponse: OrganizationResponse = await this.apiGet_ConnectorOrganizationResponse({ organizationId: organizationId });
      // create an apsOrg
      const apsOrganization: APSOrganization = this.create_ApsOrganization_From_ConnectorOrganization({
        connectorOrganizationResponse: connectorOrganizationResponse
      });
      const apSystemOrganizationDisplay: IAPSystemOrganizationDisplay = this.create_ApSystemOrganizationDisplay_From_ApiEntities({
        apsOrganization: apsOrganization,
        connectorOrganizationResponse: connectorOrganizationResponse
      });
      apSystemOrganizationDisplayList.push(apSystemOrganizationDisplay);
    }
    return apSystemOrganizationDisplayList;
  }

  public async apiImport_ApOrganizationDisplay_General({ apOrganizationDisplay_General }:{
    apOrganizationDisplay_General: IAPOrganizationDisplay_General;
  }): Promise<void> {
    // const funcName = 'apiImport_ApOrganizationDisplay_General';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // // test downstream error handling
    // throw new Error(`${logName}: test error handling`);

    const apsCreate: APSOrganization = {
      organizationId: apOrganizationDisplay_General.apEntityId.id,
      displayName: apOrganizationDisplay_General.apEntityId.displayName,
      appCredentialsExpiryDuration: apOrganizationDisplay_General.apAppCredentialsExpiryDuration_millis,
      maxNumApisPerApiProduct: apOrganizationDisplay_General.apMaxNumApis_Per_ApiProduct,
    };
    await ApsAdministrationService.createApsOrganization({
      requestBody: apsCreate
    });
  }

  public async apiCreate_ApSystemOrganizationDisplay({ apSystemOrganizationDisplay }:{
    apSystemOrganizationDisplay: IAPSystemOrganizationDisplay;
  }): Promise<void> {
    const apsCreate: APSOrganization = {
      organizationId: apSystemOrganizationDisplay.apEntityId.id,
      displayName: apSystemOrganizationDisplay.apEntityId.displayName,
      appCredentialsExpiryDuration: apSystemOrganizationDisplay.apAppCredentialsExpiryDuration_millis,
      maxNumApisPerApiProduct: apSystemOrganizationDisplay.apMaxNumApis_Per_ApiProduct,
    };
    await ApsAdministrationService.createApsOrganization({
      requestBody: apsCreate
    });
    await AdministrationService.createOrganization({
      requestBody: this.create_ConnectorOrganizationCreate_From_ApSystemOrganzationDisplay({ apSystemOrganizationDisplay: apSystemOrganizationDisplay })
    });
  }

  public async apiDelete_ApSystemOrganizationDisplay({ organizationId }:{
    organizationId: string;
  }): Promise<void> {
    // const funcName = 'apiDelete_ApSystemOrganizationDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;

    try {
      await AdministrationService.deleteOrganization({
        organizationName: organizationId
      });
    } catch (e: any) {
      if (APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if (apiError.status !== 404) throw e;
      } else throw e;
    }

    await ApsAdministrationService.deleteApsOrganization({
      organizationId: organizationId
    });

  }

}

export default new APSystemOrganizationsDisplayService();
