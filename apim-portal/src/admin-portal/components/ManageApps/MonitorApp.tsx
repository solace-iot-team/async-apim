
import React from "react";

import { MenuItem, MenuItemCommandParams } from "primereact/api";

import { TApiCallState } from "../../../utils/ApiCallState";
import { TAPEntityId } from "../../../utils/APEntityIdsService";
import { APMonitorApp } from "../../../components/APMonitorApp/APMonitorApp";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";

import '../../../components/APComponents.css';
import "./ManageApps.css";

export interface IMonitorAppProps {
  organizationId: string;
  appEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
  onNavigateToApp: (appEntityId: TAPEntityId) => void;
}

export const MonitorApp: React.FC<IMonitorAppProps> = (props: IMonitorAppProps) => {
  // const ComponentName = 'MonitorApp';

  const AdminPortalMonitorApp_onNavigateToAppCommand = (e: MenuItemCommandParams): void => {
    props.onNavigateToApp(props.appEntityId);
  }

  const getBaseBreadCrumbItemList = (): Array<MenuItem> => {
    return [
      {
        label: props.appEntityId.displayName,
        command: AdminPortalMonitorApp_onNavigateToAppCommand
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
    <div className="ap-manage-apps">

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
