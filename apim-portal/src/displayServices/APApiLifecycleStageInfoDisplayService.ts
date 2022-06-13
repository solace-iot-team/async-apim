import { MetaEntityStage } from "@solace-iot-team/apim-connector-openapi-browser";
import { Globals } from "../utils/Globals";
import { APLifecycleStageInfoDisplayService, TAPLifecycleStageList } from "./APLifecycleStageInfoDisplayService";

class APApiLifecycleStageInfoDisplayService extends APLifecycleStageInfoDisplayService {
  private readonly ComponentName = "APApiLifecycleStageInfoDisplayService";

  public getList_NextStages({ currentStage }:{
    currentStage: MetaEntityStage;
  }): TAPLifecycleStageList {
    const funcName = 'getList_NextStages';
    const logName = `${this.ComponentName}.${funcName}()`;

    switch(currentStage) {
      case MetaEntityStage.DRAFT:
      case MetaEntityStage.RETIRED:
        throw new Error(`${logName}: invalid stage for apis: ${currentStage}`);
      case MetaEntityStage.RELEASED:
        return [MetaEntityStage.RELEASED, MetaEntityStage.DEPRECATED];
      case MetaEntityStage.DEPRECATED:
        return [MetaEntityStage.DEPRECATED, MetaEntityStage.RELEASED];
      default:
        Globals.assertNever(logName, currentStage);
    }
    throw new Error(`${logName}: should never get here`);
  }

}

export default new APApiLifecycleStageInfoDisplayService();
