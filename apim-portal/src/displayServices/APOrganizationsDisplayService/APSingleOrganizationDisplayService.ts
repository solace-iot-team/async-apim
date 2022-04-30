import { OrganizationResponse } from "@solace-iot-team/apim-connector-openapi-browser";
import APSearchContentService, { IAPSearchContent } from "../../utils/APSearchContentService";
import { ApsAdministrationService, APSOrganization } from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { 
  APOrganizationsDisplayService, 
  IAPOrganizationDisplay, 
  IAPOrganizationDisplay_Connectivity, 
  IAPOrganizationDisplay_General 
} from "./APOrganizationsDisplayService";


export interface IAPSingleOrganizationDisplay extends IAPOrganizationDisplay, IAPSearchContent {
  // nothing to add at the moment
}

export interface IAPSingleOrganizationDisplay_General extends IAPOrganizationDisplay_General {};
export interface IAPSingleOrganizationDisplay_Connectivity extends IAPOrganizationDisplay_Connectivity {};

class APSingleOrganizationDisplayService extends APOrganizationsDisplayService {
  private readonly ComponentName = "APSingleOrganizationDisplayService";

  private create_ApSingleOrganizationDisplay_From_ApiEntities({ 
    connectorOrganizationResponse,
    apsOrganization,
  }: {
    connectorOrganizationResponse: OrganizationResponse;
    apsOrganization: APSOrganization;
  }): IAPSingleOrganizationDisplay {

    const apOrganizationDisplay: IAPOrganizationDisplay = this.create_ApOrganizationDisplay_From_ApiEntities({
      apsOrganization: apsOrganization,
      connectorOrganizationResponse: connectorOrganizationResponse
    });

    const apSingleOrganizationDisplay: IAPSingleOrganizationDisplay ={
      ...apOrganizationDisplay,
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<IAPSingleOrganizationDisplay>(apSingleOrganizationDisplay);
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************
  public apiGet_ApOrganizationDisplay = async({ organizationId }:{
    organizationId: string;
  }): Promise<IAPSingleOrganizationDisplay> => {
    const apsOrganization: APSOrganization = await ApsAdministrationService.getApsOrganization({
      organizationId: organizationId
    });
    const connectorOrganizationResponse: OrganizationResponse = await this.apiGet_ConnectorOrganizationResponse({ 
      organizationId: organizationId 
    });
    const apSingleOrganizationDisplay: IAPSingleOrganizationDisplay = this.create_ApSingleOrganizationDisplay_From_ApiEntities({
      apsOrganization: apsOrganization,
      connectorOrganizationResponse: connectorOrganizationResponse
    });
    return apSingleOrganizationDisplay;
  }

}

export default new APSingleOrganizationDisplayService();
