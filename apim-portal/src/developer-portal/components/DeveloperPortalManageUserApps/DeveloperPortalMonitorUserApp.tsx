
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { TApiCallState } from "../../../utils/ApiCallState";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { APMonitorApp } from "../../../components/APMonitorApp/APMonitorApp";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageUserApps.css";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";

export interface IDeveloperPortalMonitorUserAppProps {
  organizationId: string;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateToApp: (appEntityId: TAPEntityId) => void;
}

export const DeveloperPortalMonitorUserApp: React.FC<IDeveloperPortalMonitorUserAppProps> = (props: IDeveloperPortalMonitorUserAppProps) => {
  // const ComponentName = 'DeveloperPortalMonitorUserApp';

  const DeveloperPortalViewMonitorUserApp_onNavigateToAppCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToApp(props.appEntityId);
  }

  const getBaseBreadCrumbItemList = (): Array<MenuItem> => {
    return [
      {
        label: props.appEntityId.displayName,
        command: DeveloperPortalViewMonitorUserApp_onNavigateToAppCommand
      },
      {
        label: 'Monitor Stats',
      }  
    ];
  }

  const setBreadCrumbItemList = () => {
    props.setBreadCrumbItemList(getBaseBreadCrumbItemList());
  }


  // * useEffect Hooks *
  React.useEffect(() => {
    setBreadCrumbItemList();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className="apd-manage-user-apps">

      <APComponentHeader header={`App: ${props.appEntityId.displayName}`} />

      <APMonitorApp
        organizationId={props.organizationId}
        appEntityId={props.appEntityId}
        onError={props.onError}
        setBreadCrumbItemList={setBreadCrumbItemList}
        onLoadingChange={props.onLoadingChange}
      />

    </div>
  );
}
