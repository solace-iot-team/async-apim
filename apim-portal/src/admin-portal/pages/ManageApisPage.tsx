import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import type { TApiCallState } from '../../utils/ApiCallState';
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from '../../components/APContextProviders/APUserContextProvider';
import { TAPEntityId } from '../../utils/APEntityIdsService';
import { ManageApis } from '../components/ManageApis/ManageApis';
import { TAPPageNavigationInfo } from '../../displayServices/APPageNavigationDisplayUtils';

import "../../pages/Pages.css";

export const ManageApisPage: React.FC = () => {
  const ComponentName = 'ManageApisPage';

  const [userContext] = React.useContext(UserContext);  

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  const location = useLocation<TAPPageNavigationInfo>();
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const [organizationEntityId, setOrganizationEntityId] = React.useState<TAPEntityId>();

  const onSuccess = (apiCallStatus: TApiCallState) => {
    if(apiCallStatus.context.userDetail) toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }

  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'APIs',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationApis) }
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

  React.useEffect(() => {
    const funcName = 'useEffect([])';
    const logName = `${ComponentName}.${funcName}()`;
    if(!userContext.runtimeSettings.currentOrganizationEntityId) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationEntityId is undefined`);
    // alert(`${logName}: location.state=${JSON.stringify(location.state, null, 2)}`);
    setOrganizationEntityId(userContext.runtimeSettings.currentOrganizationEntityId);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */


  return (
    <React.Fragment>
      <Toast ref={toast} />
      {organizationEntityId && renderBreadcrumbs()}
      {organizationEntityId && 
        <ManageApis
          organizationEntityId={organizationEntityId}
          onSuccess={onSuccess} 
          onError={onError} 
          setBreadCrumbItemList={setBreadCrumbItemList}
          apPageNavigationInfo={location.state}
        />
      }
    </React.Fragment>
  );

}

