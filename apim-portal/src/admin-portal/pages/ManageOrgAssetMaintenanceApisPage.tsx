import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { TApiCallState } from "../../utils/ApiCallState";
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/APContextProviders/APUserContextProvider";

import "../../pages/Pages.css";
import { MaintainApis } from '../components/MaintainApis/MaintainApis';

export const ManageOrgAssetMaintenanceApisPage: React.FC = () => {
  // const ComponentName = 'ManageOrgAssetMaintenanceApisPage';

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

  const renderBreadcrumbs = (orgDisplayName: string) => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: `Organization: ${orgDisplayName}`
      },
      { 
        label: 'Asset Maintenance'
      },
      { 
        label: 'APIs',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationAssetMaintenanceApis) }
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
        <MaintainApis
          organizationEntityId={userContext.runtimeSettings.currentOrganizationEntityId}
          onSuccess={onSuccess} 
          onError={onError}
          setBreadCrumbItemList={setBreadCrumbItemList}
        />
      }
    </div>
  );
}
