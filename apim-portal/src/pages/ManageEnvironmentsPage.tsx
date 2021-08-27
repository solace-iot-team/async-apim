import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { TApiCallState } from "../utils/ApiCallState";
import { ManageEnvironments } from '../components/ManageEnvironments/ManageEnvironments';
import { EUIResourcePaths, GlobalElementStyles } from '../utils/Globals';
import { UserContext } from "../components/UserContextProvider/UserContextProvider";
import { TAPOrganizationId } from '../components/APComponentsCommon';

import "./Pages.css";

export const ManageEnvironmentsPage = () => {
  const componentName="ManageEnvironmentsPage";

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
        command: () => { navigateTo(EUIResourcePaths.ManageOrganizationEnvironments)}
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
  }, []);

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
