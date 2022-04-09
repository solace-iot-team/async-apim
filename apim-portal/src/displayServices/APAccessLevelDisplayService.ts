import { APIProductAccessLevel } from "@solace-iot-team/apim-connector-openapi-browser";

class APAccessLevelDisplayService {
  private readonly ComponentName = "APAccessLevelDisplayService";

  public get_Default_AccessLevel = (): APIProductAccessLevel => {
    return APIProductAccessLevel.PRIVATE;
  }

  public get_SelectList = (): Array<APIProductAccessLevel> => {
    return Object.values(APIProductAccessLevel);
  }

}

export default new APAccessLevelDisplayService();
