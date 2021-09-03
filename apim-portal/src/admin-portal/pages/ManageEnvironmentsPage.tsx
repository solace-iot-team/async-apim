import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { TApiCallState } from "../../utils/ApiCallState";
import { EUIAdminPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/UserContextProvider/UserContextProvider";
import { TAPOrganizationId } from '../../components/APComponentsCommon';
import { ManageEnvironments } from '../components/ManageEnvironments/ManageEnvironments';

import "../../pages/Pages.css";

export const ManageEnvironmentsPage: React.FC = () => {
  const componentName="ManageEnvironmentsPage";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);  
  
  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbLabelList, setBreadCrumbLabelList] = React.useState<Array<string>>([]);

  const onSuccess = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
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
        label: 'Environments',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIAdminPortalResourcePaths.ManageOrganizationEnvironments)}
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

  const [organizationName, setOrganizationName] = React.useState<TAPOrganizationId>();

  React.useEffect(() => {
    const funcName = 'useEffect([])';
    const logName = `${componentName}.${funcName}()`;
    if(!userContext.runtimeSettings.currentOrganizationName) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationName is undefined`);
    setOrganizationName(userContext.runtimeSettings.currentOrganizationName);
  }, [userContext]);

  return (
    <div className="ap-pages">
      <Toast ref={toast} />
      {renderBreadcrumbs()}
      {organizationName &&
        <ManageEnvironments 
          organizationName={organizationName}
          onSuccess={onSuccess} 
          onError={onError} 
          onBreadCrumbLabelList={onBreadcrumbLabelList}
        />
      }
    </div>
);
}
