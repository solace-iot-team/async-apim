import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import type { TApiCallState } from '../../utils/ApiCallState';
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { ManageApis } from '../components/ManageApis/deleteme_ManageApis';
import { TAPOrganizationId } from '../../components/deleteme.APComponentsCommon';
import { UserContext } from '../../components/APContextProviders/APUserContextProvider';

import "../../pages/Pages.css";

export const ManageApisPage: React.FC = () => {
  const componentName = 'ManageApisPage';

  const [userContext] = React.useContext(UserContext);  

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;
  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbLabelList, setBreadCrumbLabelList] = React.useState<Array<string>>([]);

  const onSuccess = (apiCallStatus: TApiCallState) => {
    if(apiCallStatus.context.userDetail) toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }

  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const onBreadcrumbLabelList = (newBreadCrumbLableList: Array<string>) => {
    setBreadCrumbLabelList(newBreadCrumbLableList);
  }

  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'APIs',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.deleteme_ManageOrganizationApis) }
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

  const [organizationId, setOrganizationId] = React.useState<TAPOrganizationId>();

  React.useEffect(() => {
    const funcName = 'useEffect([])';
    const logName = `${componentName}.${funcName}()`;
    if(!userContext.runtimeSettings.currentOrganizationEntityId) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationEntityId is undefined`);
    setOrganizationId(userContext.runtimeSettings.currentOrganizationEntityId.id);
  }, [userContext]);

  return (
    <React.Fragment>
      <Toast ref={toast} />
      {renderBreadcrumbs()}
      {organizationId && 
        <ManageApis
          organizationId={organizationId}
          onSuccess={onSuccess} 
          onError={onError} 
          onBreadCrumbLabelList={onBreadcrumbLabelList}
        />
      }
    </React.Fragment>
  );

}

