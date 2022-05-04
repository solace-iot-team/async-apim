import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import type { TApiCallState } from '../../utils/ApiCallState';
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { ManageOrganizations } from '../components/ManageOrganizations/ManageOrganizations';
import { E_ManageOrganizations_Scope } from '../components/ManageOrganizations/ManageOrganizationsCommon';

import "../../pages/Pages.css";

export const ManageSystemOrganizationsPage: React.FC = () => {
  // const ComponentName = 'ManageSystemOrganizationsPage';

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  const onSuccess = (apiCallStatus: TApiCallState) => {
    if(apiCallStatus.context.userDetail) toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
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
        label: 'Organizations',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageSystemOrganizations) }
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
    <div className="ap-pages">
      
      <Toast ref={toast} />
      
      {renderBreadcrumbs()}

      <ManageOrganizations 
        scope={{ type: E_ManageOrganizations_Scope.SYSTEM_ORGS }}
        onSuccess={onSuccess} 
        onError={onError}
        setBreadCrumbItemList={setBreadCrumbItemList}
      />

    </div>
  );

}

