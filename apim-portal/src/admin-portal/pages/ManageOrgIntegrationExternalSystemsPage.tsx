import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { TApiCallState } from "../../utils/ApiCallState";
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/UserContextProvider/UserContextProvider";
import { ManageExternalSystems } from '../components/ManageExternalSystems/ManageExternalSystems';

import "../../pages/Pages.css";

export const ManageOrgIntegrationExternalSystemsPage: React.FC = () => {
  // const componentName = 'ManageOrgIntegrationExternalSystemsPage';

  const [userContext] = React.useContext(UserContext);  

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 1000;
  const toastLifeError: number = 10000;
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);


  // React.useEffect(() => {
  //   const funcName = 'useEffect([])';
  //   const logName = `${componentName}.${funcName}()`;
  //   if(!userContext.runtimeSettings.currentOrganizationEntityId) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationEntityId is undefined`);
  //   setOrganizationName(userContext.runtimeSettings.currentOrganizationEntityId.id);
  // }, [userContext]);

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
        label: 'Integration'
      },
      { 
        label: 'External Systems',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationIntegrationExternalSystems) }
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
        <ManageExternalSystems
          organizationEntityId={userContext.runtimeSettings.currentOrganizationEntityId}
          onSuccess={onSuccess} 
          onError={onError}
          setBreadCrumbItemList={setBreadCrumbItemList}
        />
      }
    </div>
  );
}
