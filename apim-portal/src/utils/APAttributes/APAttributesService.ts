import { attributes } from "@solace-iot-team/apim-connector-openapi-browser";
import APEntityIdsService, { IAPEntityIdDisplay } from "../APEntityIdsService";

// not defined in connector api
export type TAPConnectorAttribute = {
  name: string,
  value: string
}
export type TAPConnectorAttributeList = Array<TAPConnectorAttribute>;

export type TAPAttributeDisplay = IAPEntityIdDisplay & {
  connectorAttribute: TAPConnectorAttribute;
}
export type TAPAttributeDisplayList = Array<TAPAttributeDisplay>;

export class APAttributesService {
  private readonly BaseComponentName = "APAttributesService";

  private create_DisplayName(connectorAttribute: TAPConnectorAttribute): string {
    return connectorAttribute.name;
  }
 
  // private create_ConnectorAttribute_From_ApAttributeDisplay(apAttributeDisplay: TAPAttributeDisplay): TAPConnectorAttribute {
  //   return apAttributeDisplay.connectorAttribute;
  // }

  public create_EmptyObject(): TAPAttributeDisplay {
    return this.create_ApAttributeDisplay_From_ConnnectorAttribute({ name: '', value: ''});
  }

  public is_EmptyObject(apAttributeDisplay: TAPAttributeDisplay): boolean {
    return (apAttributeDisplay.connectorAttribute.name === '' && apAttributeDisplay.connectorAttribute.value === '' );
  }

  public create_ApAttributeDisplay_From_ConnnectorAttribute(connectorAttribute: TAPConnectorAttribute): TAPAttributeDisplay {
    return {
      apEntityId: {
        id: connectorAttribute.name,
        displayName: this.create_DisplayName(connectorAttribute)
      },
      connectorAttribute: connectorAttribute
    }
  }

  public create_SortedApAttributeDisplayList_From_ConnectorAttributeList(connectorAttributeList: attributes): TAPAttributeDisplayList {
    const list: TAPAttributeDisplayList = [];
    for(const connectorAttribute of connectorAttributeList) {
      list.push(this.create_ApAttributeDisplay_From_ConnnectorAttribute(connectorAttribute));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPAttributeDisplay>(list);
  }

  public create_ConnectorAttributeList_From_ApAttributeDisplayList(apAttributeDisplayList: TAPAttributeDisplayList): attributes {
    return apAttributeDisplayList.map( (x) => {
      return x.connectorAttribute;
    });
  }

  public add_ApAttributeDisplay_To_ApAttributeDisplayList(apAttributeDisplayList: TAPAttributeDisplayList, addApAttributeDisplay: TAPAttributeDisplay): TAPAttributeDisplayList {
    apAttributeDisplayList.push(addApAttributeDisplay);
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPAttributeDisplay>(apAttributeDisplayList);
  }

  public remove_ApAttributeDisplay_From_ApAttributeDisplayList(apAttributeDisplayList: TAPAttributeDisplayList, removeApAttributeDisplay: TAPAttributeDisplay): TAPAttributeDisplayList {
    const idx = apAttributeDisplayList.findIndex( (x) => {
      return x.apEntityId.id === removeApAttributeDisplay.apEntityId.id;
    });
    if(idx > -1) apAttributeDisplayList.splice(idx, 1);
    return apAttributeDisplayList;
  }

}

export default new APAttributesService();
