import { TAPEntityId } from "../utils/APEntityIdsService";

export type TAPNavigationTarget = {
  apEntityId: TAPEntityId;
  tabIndex?: number;
}
export type TAPNavigationOrigin = {
  breadcrumbLabel: string;
  apEntityId: TAPEntityId;
  apOriginPath: string;
  tabIndex?: number;
}
export type TAPPageNavigationInfo = {
  apNavigationTarget: TAPNavigationTarget;
  apNavigationOrigin: TAPNavigationOrigin;
}

