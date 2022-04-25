import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import type { TApiCallState } from '../../utils/ApiCallState';
import { EUIDeveloperPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/APContextProviders/APUserContextProvider";
import { TAPOrganizationId } from '../../components/deleteme.APComponentsCommon';
import { DeveloperPortalManageUserApps } from '../components/DeveloperPortalManageUserApps/deleteme.DeveloperPortalManageUserApps';
import { TAPDeveloperPortalApiProductCompositeId } from '../components/DeveloperPortalManageUserApps/deleteme.DeveloperPortalManageUserAppsCommon';

import "../../pages/Pages.css";

export const DeveloperPortalManageUserAppsPage: React.FC = () => {
  const componentName = "DeveloperPortalManageUserAppsPage";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [locationState, setLocationState] = React.useState<TAPDeveloperPortalApiProductCompositeId>();
  const location = useLocation<TAPDeveloperPortalApiProductCompositeId>();

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }

  React.useEffect(() => {
    // const funcName = 'useEffect([])';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: location.state=${JSON.stringify(location.state)}`);
    if(location.state) {
      setLocationState(location.state);
    }
  }, [location.state]);

  const onSuccess = (apiCallStatus: TApiCallState) => {
    if(apiCallStatus.context.userDetail) toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }

  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'DELETEME: My Apps',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIDeveloperPortalResourcePaths.DELETEME_ManageUserApplications) }
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

  const [organizationName, setOrganizationName] = React.useState<TAPOrganizationId>();

  React.useEffect(() => {
    const funcName = 'useEffect([])';
    const logName = `${componentName}.${funcName}()`;
    if(!userContext.runtimeSettings.currentOrganizationEntityId) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationEntityId is undefined`);
    setOrganizationName(userContext.runtimeSettings.currentOrganizationEntityId.id);
  }, [userContext]); 

  return (
    <React.Fragment>
      
      <Toast ref={toast} />
      
      {breadCrumbItemList && renderBreadcrumbs()}
      
      {organizationName &&
        <DeveloperPortalManageUserApps
          organizationName={organizationName}
          userId={userContext.apLoginUserDisplay.apEntityId.id}
          onSuccess={onSuccess} 
          onError={onError} 
          setBreadCrumbItemList={setBreadCrumbItemList}
          createAppWithApiProductCompositeId={locationState}
        />
      }
    </React.Fragment>
  );

}

