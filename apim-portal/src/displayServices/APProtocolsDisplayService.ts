import { 
  Protocol,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId } from '../utils/APEntityIdsService';

export type TAPProtocolDisplay = IAPEntityIdDisplay & {
  connectorProtocol: Protocol;
}
export type TAPProtocolDisplayList = Array<TAPProtocolDisplay>;

class APProtocolsDisplayService {
  private readonly BaseComponentName = "APProtocolsDisplayService";

  public nameOf<TAPProtocolDisplay>(name: keyof TAPProtocolDisplay) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `${this.nameOf('apEntityId')}.${name}`;
  }
  public nameOf_connectorProtocol(name: keyof Protocol) {
    return `${this.nameOf('connectorProtocol')}.${name}`;
  }

  private create_DisplayName(connectorProtocol: Protocol): string {
    return connectorProtocol.version ? `${connectorProtocol.name} (${connectorProtocol.version })` : connectorProtocol.name;
  }
  
  private create_ApProtocolDisplay_From_ConnectorProtocol({ connectorProtocol }:{
    connectorProtocol: Protocol;
  }): TAPProtocolDisplay {
    return {
      apEntityId: {
        id: connectorProtocol.name,
        displayName: this.create_DisplayName(connectorProtocol)
      },
      connectorProtocol: connectorProtocol
    };
  }

  public create_SortedApProtocolDisplayList_From_ConnectorProtocolList({ connectorProtocolList }:{
    connectorProtocolList?: Array<Protocol>;
  }): TAPProtocolDisplayList {
    if(!connectorProtocolList) return [];
    const list: TAPProtocolDisplayList = [];
    for(const connectorProtocol of connectorProtocolList) {
      list.push(this.create_ApProtocolDisplay_From_ConnectorProtocol({ connectorProtocol: connectorProtocol }));
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName<TAPProtocolDisplay>(list);
  }

  public create_ConnectorProtocols_From_ApProtocolDisplayList({ apProtocolDisplayList }:{
    apProtocolDisplayList: TAPProtocolDisplayList;
  }): Array<Protocol> {
    return apProtocolDisplayList.map( (x) => {
      return x.connectorProtocol;
    });
  }

  public create_DisplayString_From_ApProtocolDisplayList({ apProtocolDisplayList }:{
    apProtocolDisplayList: TAPProtocolDisplayList;
  }): string {
    if(apProtocolDisplayList.length > 0) {
      return APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList<TAPProtocolDisplay>(apProtocolDisplayList).join(', ');
    } else return '-';
  }

}

export default new APProtocolsDisplayService();

