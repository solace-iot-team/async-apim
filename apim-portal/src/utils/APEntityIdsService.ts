import { CommonEntityNameList, CommonEntityNames } from "@solace-iot-team/apim-connector-openapi-browser";
import { Globals } from "./Globals";

export interface IAPEntityIdDisplay {
  apEntityId: TAPEntityId;
}

export type TAPEntityId = {
  id: string;
  displayName: string;
  // version?: string;
}
export type TAPEntityIdList = Array<TAPEntityId>;

class APEntityIdsService {
  private readonly ComponentName = "APEntityIdsService";

  public nameOf(name: keyof TAPEntityId) {
    return `${name}`;
  }

  public nameOf_ApEntityIdDisplay(name: keyof TAPEntityId) {
    return `apEntityId.${name}`;
  }

  public create_EmptyObject_NoId = (): TAPEntityId => {
    return {
      id: '',
      displayName: ''
    };
  }

  public create_EmptyObject = (): TAPEntityId => {
    return {
      id: Globals.getUUID(),
      displayName: ''
    };
  }

  public create_deduped_EntityIdList = (list: TAPEntityIdList): TAPEntityIdList => {
    const unique = new Map<string, number>();
    const distinct: TAPEntityIdList = [];
    for(let i=0; i < list.length; i++) {
      if(!unique.has(list[i].id)) {
        distinct.push(list[i]);
        unique.set(list[i].id, 1);
      }
    }
    return distinct;
  }

  public getSortedDisplayNameList = (list: TAPEntityIdList): Array<string> => {
    if(list.length > 0) {
      const sortedList = this.sort_byDisplayName(list);
      return sortedList.map((x) => { return x.displayName; });
    }
    else return [];
  }

  public getSortedDisplayNameList_As_String = (list: TAPEntityIdList): string => {
    if(list.length > 0) return this.getSortedDisplayNameList(list).join(', ');
    else return '';
  }

  public sort_byDisplayName(list: TAPEntityIdList) {
    return list.sort( (e1: TAPEntityId, e2: TAPEntityId) => {
      if(e1.displayName.toLocaleLowerCase() < e2.displayName.toLocaleLowerCase()) return -1;
      if(e1.displayName.toLocaleLowerCase() > e2.displayName.toLocaleLowerCase()) return 1;
      return 0;
    });
  }

  public create_EntityIdList_From_IdList(idList: Array<string>): TAPEntityIdList {
    return idList.map( (x: string) => {
      return { id: x, displayName: x };
    });
  }

  public create_DisplayNameList(list: TAPEntityIdList): Array<string> {
    return list.map( (x) => {
      return x.displayName;
    });
  }

  public create_SortedDisplayNameList(list: TAPEntityIdList): Array<string> {
    return this.create_DisplayNameList(this.sort_byDisplayName(list));
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

  public create_ApDisplayObjectList_FilteredBy_EntityIdList<T extends IAPEntityIdDisplay>({ apDisplayObjectList, filterByEntityIdList }:{
    apDisplayObjectList: Array<T>;
    filterByEntityIdList: TAPEntityIdList;
  }): Array<T> {
    if(apDisplayObjectList.length === 0) return [];
    if(filterByEntityIdList.length === 0) return [];
    return apDisplayObjectList.filter( (x: T) => {
      const idx = filterByEntityIdList.findIndex( (y) => {
        return x.apEntityId.id === y.id;
      });
      return (idx > -1);
    });
  }

  public create_ApDisplayObjectList_FilteredBy_NotEntityIdList<T extends IAPEntityIdDisplay>({ apDisplayObjectList, filterBy_NotEntityIdList }:{
    apDisplayObjectList: Array<T>;
    filterBy_NotEntityIdList: TAPEntityIdList;
  }): Array<T> {
    if(apDisplayObjectList.length === 0) return [];
    if(filterBy_NotEntityIdList.length === 0) return apDisplayObjectList;
    return apDisplayObjectList.filter( (x: T) => {
      const idx = filterBy_NotEntityIdList.findIndex( (y) => {
        return x.apEntityId.id === y.id;
      });
      return (idx === -1);
    });
  }

  public create_ApDisplayObjectList_FilteredBy_IdList<T extends IAPEntityIdDisplay>({ apDisplayObjectList, filterByIdList }:{
    apDisplayObjectList: Array<T>;
    filterByIdList: Array<string>;
  }): Array<T> {
    if(apDisplayObjectList.length === 0) return [];
    if(filterByIdList.length === 0) return [];
    return apDisplayObjectList.filter( (x: T) => {
      const idx = filterByIdList.findIndex( (y) => {
        return x.apEntityId.id === y;
      });
      return (idx > -1);
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
