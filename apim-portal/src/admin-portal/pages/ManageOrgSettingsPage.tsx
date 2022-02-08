import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { TApiCallState } from "../../utils/ApiCallState";
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/UserContextProvider/UserContextProvider";
import { E_ManageOrganizations_Scope, ManageOrganizations } from '../components/ManageOrganizations/ManageOrganizations';

import "../../pages/Pages.css";

export const ManageOrgSettingsPage: React.FC = () => {
  // const componentName = 'ManageOrgSettingsPage';

  const [userContext] = React.useContext(UserContext);  

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 1000;
  const toastLifeError: number = 10000;
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbLabelList, setBreadCrumbLabelList] = React.useState<Array<string>>([]);
  // const [organizationName, setOrganizationName] = React.useState<CommonName>();

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

  const onBreadcrumbLabelList = (newBreadCrumbLableList: Array<string>) => {
    setBreadCrumbLabelList(newBreadCrumbLableList);
  }

  const renderBreadcrumbs = (orgDisplayName: string) => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: `Organization: ${orgDisplayName}`
      },
      { 
        label: 'Settings',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationSettings) }
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
      {userContext.runtimeSettings.currentOrganizationEntityId && renderBreadcrumbs(userContext.runtimeSettings.currentOrganizationEntityId.displayName)}
      {userContext.runtimeSettings.currentOrganizationEntityId &&
        <ManageOrganizations 
          scope={{ type: E_ManageOrganizations_Scope.ORG_SETTINGS, organizationEntityId: userContext.runtimeSettings.currentOrganizationEntityId }}
          onSuccess={onSuccess} 
          onError={onError}
          onBreadCrumbLabelList={onBreadcrumbLabelList}
        />
      }
    </div>
  );
}
