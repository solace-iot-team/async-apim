
export type TAPEntityId = {
  id: string;
  displayName: string;
}
export type TAPEntityIdList = Array<TAPEntityId>;

export class APEntityId {

  public static sortAPEntityIdList_byDisplayName = (apEntityIdList: TAPEntityIdList): TAPEntityIdList => {
    return apEntityIdList.sort( (e1: TAPEntityId, e2: TAPEntityId) => {
      if(e1.displayName < e2.displayName) return -1;
      if(e1.displayName > e2.displayName) return 1;
      return 0;
    });
  }
}

