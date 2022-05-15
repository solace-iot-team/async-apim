import { Meta, MetaEntityStage } from "@solace-iot-team/apim-connector-openapi-browser";
import { Globals } from "../utils/Globals";

export interface IAPLifecycleStageInfo {
  stage: MetaEntityStage;
}
export type TAPLifecycleStageList = Array<MetaEntityStage>;

class APLifecycleStageInfoDisplayService {
  private readonly ComponentName = "APLifecycleStageInfoDisplayService";

  public nameOf(name: keyof IAPLifecycleStageInfo) {
    return `${name}`;
  }

  public create_Empty_ApLifecycleStageInfo = (): IAPLifecycleStageInfo => {
    return {
      stage: MetaEntityStage.DRAFT,
    };
  }

  private create_Legacy_ApVersionInfo = (): IAPLifecycleStageInfo => {
    return {
      stage: MetaEntityStage.RELEASED,
    };
  }

  public isLifecycleStage_Released({ connectorMeta }:{
    connectorMeta?: Meta;
  }): boolean {
    const apLifecycleStageInfo: IAPLifecycleStageInfo = this.create_ApLifecycleStageInfo_From_ApiEntities({ connectorMeta: connectorMeta });
    return apLifecycleStageInfo.stage === MetaEntityStage.RELEASED;
  }

  public create_ApLifecycleStageInfo_From_ApiEntities({ connectorMeta }:{
    connectorMeta?: Meta;
  }): IAPLifecycleStageInfo {
    if(connectorMeta === undefined) return this.create_Legacy_ApVersionInfo();
    if(connectorMeta.stage === undefined) return this.create_Legacy_ApVersionInfo();
    return {
      stage: connectorMeta.stage,
    };
  }

  public getList_NextStages({ currentStage }:{
    currentStage: MetaEntityStage;
  }): TAPLifecycleStageList {
    const funcName = 'getList_NextStages';
    const logName = `${this.ComponentName}.${funcName}()`;

    switch(currentStage) {
      case MetaEntityStage.DRAFT:
        return [MetaEntityStage.DRAFT, MetaEntityStage.RELEASED];
      case MetaEntityStage.RELEASED:
        return [MetaEntityStage.RELEASED, MetaEntityStage.DEPRECATED];
      case MetaEntityStage.DEPRECATED:
        return [MetaEntityStage.DEPRECATED, MetaEntityStage.RELEASED, MetaEntityStage.RETIRED];
      case MetaEntityStage.RETIRED:
        return [MetaEntityStage.RETIRED];
      default:
        Globals.assertNever(logName, currentStage);
    }
    throw new Error(`${logName}: should never get here`);
  }

}

export default new APLifecycleStageInfoDisplayService();