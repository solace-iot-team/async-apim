import { AdministrationService, Organization, OrganizationResponse } from "@solace-iot-team/apim-connector-openapi-browser";
import APSearchContentService, { IAPSearchContent } from "../../utils/APSearchContentService";
import { 
  ApsAdministrationService, 
  APSOrganization, 
  ListAPSOrganizationResponse 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { 
  APOrganizationsDisplayService, 
  IAPOrganizationDisplay, 
  IAPOrganizationDisplay_General 
} from "./APOrganizationsDisplayService";

export interface IAPSystemOrganizationDisplay extends IAPOrganizationDisplay, IAPSearchContent {
  // nothing to add at the moment
}
export type TAPSystemOrganizationDisplayList = Array<IAPSystemOrganizationDisplay>;

export interface IAPSystemOrganizationDisplay_General extends IAPOrganizationDisplay_General {};

class APSystemOrganizationsDisplayService extends APOrganizationsDisplayService {
  private readonly ComponentName = "APSystemOrganizationsDisplayService";

  protected create_Empty_ApOrganizationDisplay(): IAPSystemOrganizationDisplay {
    const apOrganizationDisplay: IAPOrganizationDisplay = super.create_Empty_ApOrganizationDisplay();
    const apSystemOrganizationDisplay: IAPSystemOrganizationDisplay ={
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
      displayName: connectorOrganizationResponse.name
    };
    return apsOrganization;
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

}

export default new APSystemOrganizationsDisplayService();
