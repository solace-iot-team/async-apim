import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { TApiCallState } from "../../utils/ApiCallState";
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { E_ManageOrganizations_Scope, ManageOrganizations } from '../components/ManageOrganizations/deleteme_ManageOrganizations';

import "../../pages/Pages.css";

export const ManageSystemOrganizationsPage: React.FC = () => {
  // const componentName = 'ManageSystemOrganizationsPage';

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 1000;
  const toastLifeError: number = 10000;
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);


  const onSuccess = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }

  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: `System`
      },
      { 
        label: 'Deleteme: Organizations',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.deleteme_ManageSystemOrganizations)}
      }
    ];
    breadCrumbItemList.forEach( (item: MenuItem) => {
      breadcrumbItems.push({
        ...item,
        style: (item.command ? GlobalElementStyles.breadcrumbLink() : {})
      });
    });
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
      <ManageOrganizations 
        scope={{ type: E_ManageOrganizations_Scope.ALL_ORGS }}
        onSuccess={onSuccess} 
        onError={onError}
        setBreadCrumbItemList={setBreadCrumbItemList}
      />
    </React.Fragment>
  );
}
