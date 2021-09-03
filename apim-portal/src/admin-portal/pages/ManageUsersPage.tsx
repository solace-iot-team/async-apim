import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { ManageUsers } from '../components/ManageUsers/ManageUsers';
import type { TApiCallState } from '../../utils/ApiCallState';
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';

import "../../pages/Pages.css";

export const ManageUsersPage: React.FC = () => {
  // const componentName = 'ManageUsersPage';

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbLabelList, setBreadCrumbLabelList] = React.useState<Array<string>>([]);

  const onSuccess = (apiCallStatus: TApiCallState) => {
    if(apiCallStatus.context.userDetail) toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }

  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const onBreadcrumbLabelList = (newBreadCrumbLableList: Array<string>) => {
    setBreadCrumbLabelList(newBreadCrumbLableList);
  }

  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'System'
      },
      { 
        label: 'Users',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageSystemUsers) }
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
      <ManageUsers 
        onSuccess={onSuccess} 
        onError={onError} 
        onBreadCrumbLabelList={onBreadcrumbLabelList}
      />
    </React.Fragment>
);

}

