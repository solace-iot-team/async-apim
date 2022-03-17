
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { TApiCallState } from "../../utils/ApiCallState";
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/APContextProviders/APUserContextProvider";
import { E_ManageOrganizations_Scope, ManageOrganizations } from '../components/ManageOrganizations/ManageOrganizations';

import "../../pages/Pages.css";

export const ManageOrganizationSettingsPage: React.FC = () => {
  // const componentName = 'ManageOrganizationSettingsPage';

  const [userContext] = React.useContext(UserContext);  

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

  const renderBreadcrumbs = (organizationDisplayName: string) => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: `Organization: ${organizationDisplayName}`
      },
      { 
        label: 'Settings',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationSettings) }
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
      {userContext.runtimeSettings.currentOrganizationEntityId && renderBreadcrumbs(userContext.runtimeSettings.currentOrganizationEntityId.displayName)}
      {userContext.runtimeSettings.currentOrganizationEntityId &&
        <ManageOrganizations 
          scope={{ type: E_ManageOrganizations_Scope.ORG_SETTINGS, organizationEntityId: userContext.runtimeSettings.currentOrganizationEntityId }}
          onSuccess={onSuccess} 
          onError={onError}
          setBreadCrumbItemList={setBreadCrumbItemList}
        />
      }
    </div>
  );
}
