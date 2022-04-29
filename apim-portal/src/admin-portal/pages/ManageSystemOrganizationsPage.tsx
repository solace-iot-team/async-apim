import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import type { TApiCallState } from '../../utils/ApiCallState';
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';

import "../../pages/Pages.css";
import { ManageOrganizations } from '../components/ManageOrganizations/ManageOrganizations';
import { E_ManageOrganizations_Scope } from '../components/ManageOrganizations/ManageOrganizationsCommon';

export const ManageSystemOrganizationsPage: React.FC = () => {
  const ComponentName = 'ManageSystemOrganizationsPage';

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [userContext, dispatchUserContextAction] = React.useContext(UserContext);  

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  // const [organizationEntityId, setOrganizationEntityId] = React.useState<TAPEntityId>();

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

  // React.useEffect(() => {
  //   const funcName = 'useEffect([])';
  //   const logName = `${componentName}.${funcName}()`;
  //   if(!userContext.runtimeSettings.currentOrganizationEntityId) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationEntityId is undefined`);
  //   setOrganizationEntityId(userContext.runtimeSettings.currentOrganizationEntityId);
  // }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

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

