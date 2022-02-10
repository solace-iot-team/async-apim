import { 
  EnvironmentListItem, 
  EnvironmentResponse,
  EnvironmentsService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { TAPEntityId } from './APEntityIdsService';

// TODO: refactor APEnvironmentsService from ManageEnvironmentsCommon and use in ManageEnvironments

export type TAPEnvironmentDisplay = {
  apEntityId: TAPEntityId;
  connectorEnvironmentResponse: EnvironmentResponse;
  apDisplayString: string;
  // references ...
}
export type TAPEnvironmentDisplayList = Array<TAPEnvironmentDisplay>;


class APEnvironmentsService {
  private readonly BaseComponentName = "APEnvironmentsService";

  public getSortedDisplayNameList(apEnvironmentDisplayList: TAPEnvironmentDisplayList): Array<string> {
    const apEntityIdList = apEnvironmentDisplayList.map( (apEnvDisplay: TAPEnvironmentDisplay) => {
      return apEnvDisplay.apEntityId;
    });
    return APEntityIdsService.mapToDisplayNameList(apEntityIdList);
  }

  private getApDisplayString(envResponse: EnvironmentResponse): string {
    return `${envResponse.displayName} (${envResponse.datacenterProvider}:${envResponse.datacenterId})`;
  }

  private create_ApEnvironmentDisplay_From_ApiEntities = (connectorEnvResponse: EnvironmentResponse): TAPEnvironmentDisplay => {
    const _base: TAPEnvironmentDisplay = {
      apEntityId: {
        id: connectorEnvResponse.name,
        displayName: connectorEnvResponse.displayName ? connectorEnvResponse.displayName : connectorEnvResponse.name
      },
      connectorEnvironmentResponse: connectorEnvResponse,
      apDisplayString: this.getApDisplayString(connectorEnvResponse)
    }
    return _base;
  }

  public async listApEnvironmentDisplay({ organizationId }: {
    organizationId: string;
  }): Promise<TAPEnvironmentDisplayList> {

    const envListItemList: Array<EnvironmentListItem> = await EnvironmentsService.listEnvironments({
      organizationName: organizationId
    });
    // TODO: PARALLELIZE
    const apEnvDisplayList: TAPEnvironmentDisplayList = [];
    for(const envListItem of envListItemList) {
      const envResponse = await EnvironmentsService.getEnvironment({
        organizationName: organizationId,
        envName: envListItem.name
      });
      apEnvDisplayList.push(this.create_ApEnvironmentDisplay_From_ApiEntities(envResponse));
    }
    return apEnvDisplayList;
  }

  public async listApEnvironmentDisplayForEnvIdList({ organizationId, envIdList }: {
    organizationId: string;
    envIdList: Array<string>;
  }): Promise<TAPEnvironmentDisplayList> {

    // TODO: PARALLELIZE
    const apEnvDisplayList: TAPEnvironmentDisplayList = [];
    for(const envId of envIdList) {
      const envResponse = await EnvironmentsService.getEnvironment({
        organizationName: organizationId,
        envName: envId
      });
      apEnvDisplayList.push(this.create_ApEnvironmentDisplay_From_ApiEntities(envResponse));
    }
    return apEnvDisplayList;
  }

}

export default new APEnvironmentsService();
