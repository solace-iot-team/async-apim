
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { TApiCallState } from "../../../utils/ApiCallState";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { APMonitorApp } from "../../../components/APMonitorApp/APMonitorApp";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";

import '../../../components/APComponents.css';
import "./DeveloperPortalManageApps.css";

export interface IDeveloperPortalMonitorAppProps {
  organizationId: string;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateToApp: (appEntityId: TAPEntityId) => void;
}

export const DeveloperPortalMonitorApp: React.FC<IDeveloperPortalMonitorAppProps> = (props: IDeveloperPortalMonitorAppProps) => {
  // const ComponentName = 'DeveloperPortalMonitorApp';

  const DeveloperPortalMonitorApp_onNavigateToAppCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToApp(props.appEntityId);
  }

  const getBaseBreadCrumbItemList = (): Array<MenuItem> => {
    return [
      {
        label: props.appEntityId.displayName,
        command: DeveloperPortalMonitorApp_onNavigateToAppCommand
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
