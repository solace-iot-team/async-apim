import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import type { TApiCallState } from '../../utils/ApiCallState';
import { EUIDeveloperPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/UserContextProvider/UserContextProvider";
import { TAPOrganizationId } from '../../components/APComponentsCommon';
import { DeveloperPortalManageUserApps } from '../components/DeveloperPortalManageUserApps/DeveloperPortalManageUserApps';

import "../../pages/Pages.css";

export const DeveloperPortalManageUserAppsPage: React.FC = () => {
  const componentName = "DeveloperPortalManageUserAppsPage";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);

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

  // const addBreadCrumbItemList = (itemList: Array<MenuItem>) => {
  //   const newItemList: Array<MenuItem> = breadCrumbItemList.concat(itemList);
  //   setBreadCrumbItemList(newItemList);
  // }

  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'My Apps',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIDeveloperPortalResourcePaths.ManageUserApplications) }
      }
    ];
    breadCrumbItemList.forEach( (item: MenuItem) => {
      breadcrumbItems.push({
        ...item,
        style: (item.command ? GlobalElementStyles.breadcrumbLink() : {})
      });
    })
    // breadCrumbLabelList.forEach( (breadCrumbLabel: string) => {
    //   breadcrumbItems.push({ label: breadCrumbLabel });
    // })
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
    if(!userContext.runtimeSettings.currentOrganizationName) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationName is undefined`);
    setOrganizationName(userContext.runtimeSettings.currentOrganizationName);
  }, [userContext]); 

  return (
    <React.Fragment>
      
      <Toast ref={toast} />
      
      {breadCrumbItemList && renderBreadcrumbs()}
      
      {organizationName &&
        <DeveloperPortalManageUserApps
          organizationName={organizationName}
          userId={userContext.user.userId}
          onSuccess={onSuccess} 
          onError={onError} 
          setBreadCrumbItemList={setBreadCrumbItemList}
          // addBreadCrumbItemList={addBreadCrumbItemList}
        />
      }
    </React.Fragment>
);

}

