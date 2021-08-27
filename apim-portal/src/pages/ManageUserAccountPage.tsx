import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { EUIResourcePaths, GlobalElementStyles } from '../utils/Globals';
import { ManageUserAccount } from '../components/ManageUserAccount/ManageUserAccount';
import { TApiCallState } from "../utils/ApiCallState";

import "./Pages.css";

export const ManageUserAccountPage: React.FC = (props: any) => {
  // const componentName = 'ManageUserAccountPage';

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;
  const [breadCrumbLabelList, setBreadCrumbLabelList] = React.useState<Array<string>>([]);
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }

  const onSuccess = (apiCallStatus: TApiCallState) => {
    if(apiCallStatus.context.userDetail) toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }

  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const onCancel = () => {
    navigateTo(EUIResourcePaths.UserHome)
  }

  const onBreadcrumbLabelList = (newBreadCrumbLableList: Array<string>) => {
    setBreadCrumbLabelList(newBreadCrumbLableList);
  }
  
  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'User',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIResourcePaths.UserHome) }
      },
      { 
        label: 'Account'
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
    <React.Fragment>
      <Toast ref={toast} />
      {renderBreadcrumbs()}
      <ManageUserAccount 
        onSuccess={onSuccess} 
        onError={onError} 
        onCancel={onCancel}
        onBreadCrumbLabelList={onBreadcrumbLabelList}
      />
    </React.Fragment>
  );
}

 