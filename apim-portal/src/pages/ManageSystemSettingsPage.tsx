import React from 'react';
import { useHistory } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';
import { TApiCallState } from "../utils/ApiCallState";
import { EUIResourcePaths, GlobalElementStyles } from '../utils/Globals';
import "./Pages.css";

export const ManageSystemSettingsPage = () => { 
  // const componentName = "ManageSystemSettingsPage";

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbLabelList, setBreadCrumbLabelList] = React.useState<Array<string>>([]);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const onSuccess = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }
  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const onBreadcrumbLabelList = (newBreadCrumbLableList: Array<string>) => {
    setBreadCrumbLabelList(newBreadCrumbLableList);
  }
  /* eslint-eanble @typescript-eslint/no-unused-vars */

  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'System'
      },
      { 
        label: 'Setup'
      },
      { 
        label: 'Settings',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIResourcePaths.ManageSystemConfigConnectors)}
      }
    ];
    breadCrumbLabelList.forEach( (breadCrumbLabel: string) => {
      breadcrumbItems.push({ label: breadCrumbLabel });
    })
    return (
      <React.Fragment>
        <BreadCrumb model={breadcrumbItems} />
      </React.Fragment>
    )
  }

  return (
    <div className="ap-pages">
      <Toast ref={toast} />
      {renderBreadcrumbs()}
      {/* <ManageSystemSettings 
        onSuccess={onSuccess} 
        onError={onError} 
        onBreadCrumbLabelList={onBreadcrumbLabelList}
      /> */}
      <h3>System Settings</h3>
      <ul>
        <li>manage logo</li>
        <li>manage certificates</li>
      </ul>
    </div>
  );
}
