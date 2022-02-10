import { CommonEntityNameList, CommonEntityNames } from "@solace-iot-team/apim-connector-openapi-browser";

export type TAPEntityId = {
  id: string;
  displayName: string;
}
export type TAPEntityIdList = Array<TAPEntityId>;

class APEntityIdsService {
  private readonly ComponentName = "APEntityIdsService";

  public getSortedDisplayNameList_As_String = (list: TAPEntityIdList): string => {
    if(list.length > 0) {
      const sortedList = this.sort_byDisplayName(list);
      return sortedList.map((x) => { return x.displayName; }).join(', ');
    }
    else return '';
  }

  public sort_byDisplayName(list: TAPEntityIdList) {
    return list.sort( (e1: TAPEntityId, e2: TAPEntityId) => {
      if(e1.displayName.toLocaleLowerCase() < e2.displayName.toLocaleLowerCase()) return -1;
      if(e1.displayName.toLocaleLowerCase() > e2.displayName.toLocaleLowerCase()) return 1;
      return 0;
    });
  }

  public mapToDisplayNameList(list: TAPEntityIdList) {
    return list.map( (x) => {
      return x.displayName;
    });
  }

  public getSortedApEntityIdList_From_CommonEntityNamesList(list: CommonEntityNameList) {
    const funcName = 'getSortedApEntityIdList_From_CommonEntityNamesList';
    const logName = `${this.ComponentName}.${funcName}()`;

    const entityIdList = list.map( (x: CommonEntityNames) => {
      if(x.name === undefined) throw new Error(`${logName}: x.name is undefined`);
      if(x.displayName === undefined) throw new Error(`${logName}: x.displayName is undefined`);
      return {
        id: x.name,
        displayName: x.displayName 
      } 
    });
    return this.sort_byDisplayName(entityIdList);
  }

}

export default new APEntityIdsService();
