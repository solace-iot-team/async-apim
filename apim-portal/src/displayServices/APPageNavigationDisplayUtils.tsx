import { TAPEntityId } from "../utils/APEntityIdsService";

export type TAPNavigationTarget = {
  apEntityId: TAPEntityId;
}
export type TAPNavigationOrigin = {
  apEntityId: TAPEntityId;
  apOriginPath: string;
}
export type TAPPageNavigationInfo = {
  apNavigationTarget: TAPNavigationTarget;
  apNavigationOrigin: TAPNavigationOrigin;
}

