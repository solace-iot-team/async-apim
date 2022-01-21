import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { TApiCallState } from "../../utils/ApiCallState";
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/UserContextProvider/UserContextProvider";
import { CommonDisplayName, CommonName } from '@solace-iot-team/apim-connector-openapi-browser';
import { ManageUsers } from '../components/ManageUsers/ManageUsers';
import { E_ManageUsers_Scope } from '../components/ManageUsers/ManageUsersCommon';

import "../../pages/Pages.css";

export const ManageOrgUsersPage: React.FC = () => {
  const componentName="ManageOrgUsersPage";

  const [userContext] = React.useContext(UserContext);  
  
  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [organizationName, setOrganizationName] = React.useState<CommonName>();

  React.useEffect(() => {
    const funcName = 'useEffect([])';
    const logName = `${componentName}.${funcName}()`;
    if(!userContext.runtimeSettings.currentOrganizationName) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationName is undefined`);
    setOrganizationName(userContext.runtimeSettings.currentOrganizationName);
  }, [userContext]);


  const onSuccess = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }
  
  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const renderBreadcrumbs = (orgDisplayName: CommonDisplayName) => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: `Organization: ${orgDisplayName}`
      },
      { 
        label: 'Users',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationUsers)}
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
      {organizationName && renderBreadcrumbs(organizationName)}
      {organizationName &&
        <ManageUsers 
          scope={ { type: E_ManageUsers_Scope.ORG_USERS, organizationId: organizationName, organizationDisplayName: organizationName }}
          onSuccess={onSuccess} 
          onError={onError} 
          setBreadCrumbItemList={setBreadCrumbItemList}
        />
      }
    </div>
);
}
