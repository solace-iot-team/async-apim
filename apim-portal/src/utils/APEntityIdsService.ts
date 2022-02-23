import { CommonEntityNameList, CommonEntityNames } from "@solace-iot-team/apim-connector-openapi-browser";

export interface IAPEntityIdDisplay {
  apEntityId: TAPEntityId;
}

export type TAPEntityId = {
  id: string;
  displayName: string;
}
export type TAPEntityIdList = Array<TAPEntityId>;

class APEntityIdsService {
  private readonly ComponentName = "APEntityIdsService";

  public create_EmptyObject = (): TAPEntityId => {
    return {
      id: '',
      displayName: ''
    };
  }

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

  public create_DisplayNameList(list: TAPEntityIdList): Array<string> {
    return list.map( (x) => {
      return x.displayName;
    });
  }

  public create_IdList(list: TAPEntityIdList): Array<string> {
    return list.map( (x) => {
      return x.id;
    });
  }

  public create_EntityIdList_FilteredBy_IdList({apEntityIdList, idList}: {
    apEntityIdList: TAPEntityIdList; 
    idList: Array<string>;
  }): TAPEntityIdList {
    return apEntityIdList.filter( (x) => {
      return idList.includes(x.id);
    });
  }

  public sort_ApDisplayObjectList_By_DisplayName<T extends IAPEntityIdDisplay>(list: Array<T>): Array<T> {
    return list.sort( (e1: T, e2: T) => {
      if(e1.apEntityId.displayName.toLocaleLowerCase() < e2.apEntityId.displayName.toLocaleLowerCase()) return -1;
      if(e1.apEntityId.displayName.toLocaleLowerCase() > e2.apEntityId.displayName.toLocaleLowerCase()) return 1;
      return 0;
    });
  }

  public create_SortedDisplayNameList_From_ApDisplayObjectList<T extends IAPEntityIdDisplay>(list: Array<T>): Array<string> {
    return list.map( (apDisplayObject: T) => {
      return apDisplayObject.apEntityId.displayName;
    }).sort( (e1: string, e2:string) => {
      if(e1.toLocaleLowerCase() < e2.toLocaleLowerCase()) return -1;
      if(e1.toLocaleLowerCase() > e2.toLocaleLowerCase()) return 1;
      return 0;
    });
  }

  public create_IdList_From_ApDisplayObjectList<T extends IAPEntityIdDisplay>(list: Array<T>): Array<string> {
    return list.map( (apDisplayObject: T) => {
      return apDisplayObject.apEntityId.id;
    });
  }

  public create_EntityIdList_From_ApDisplayObjectList<T extends IAPEntityIdDisplay>(list: Array<T>): TAPEntityIdList {
    return list.map( (apDisplayObject: T) => {
      return apDisplayObject.apEntityId;
    });
  }

  public create_SortedApEntityIdList_From_CommonEntityNamesList(list: CommonEntityNameList) {
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