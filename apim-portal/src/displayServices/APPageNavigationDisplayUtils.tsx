import { TAPEntityId } from "../utils/APEntityIdsService";

export enum E_AP_Navigation_Scope {
  ORIGIN = "ORIGIN",
  LINKED = "LINKED"
}
export type TAPNavigationTarget = {
  apEntityId: TAPEntityId;
  tabIndex?: number;
  scope: E_AP_Navigation_Scope;
}
export type TAPNavigationOrigin = {
  breadcrumbLabel: string;
  apEntityId: TAPEntityId;
  apOriginPath: string;
  tabIndex?: number;
  scope: E_AP_Navigation_Scope;
}
export type TAPPageNavigationInfo = {
  apNavigationTarget: TAPNavigationTarget;
  apNavigationOrigin: TAPNavigationOrigin;
}

