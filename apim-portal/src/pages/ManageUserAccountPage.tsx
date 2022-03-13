import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { GlobalElementStyles, Globals } from '../utils/Globals';
import { TApiCallState } from "../utils/ApiCallState";
import { ManageUserAccount } from '../components/ManageUserAccount/ManageUserAccount';
import { UserContext } from '../components/APContextProviders/APUserContextProvider';
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';


import "./Pages.css";

export const ManageUserAccountPage: React.FC = (props: any) => {
  // const componentName = 'ManageUserAccountPage';

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;
  const [breadCrumbLabelList, setBreadCrumbLabelList] = React.useState<Array<string>>([]);
  const history = useHistory();
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */
  

  const navigateTo = (path: string): void => { history.push(path); }

  const navigateToCurrentHome = (): void => {
    navigateTo(Globals.getCurrentHomePath(authContext.isLoggedIn, userContext.currentAppState));
  }

  const onSuccess = (apiCallStatus: TApiCallState) => {
    if(apiCallStatus.context.userDetail) toast.current.show({ severity: 'success', summary: 'Success', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeSuccess });
  }

  const onError = (apiCallStatus: TApiCallState) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: `${apiCallStatus.context.userDetail}`, life: toastLifeError });
  }

  const onCancel = () => {
    navigateToCurrentHome();
  }

  const onBreadcrumbLabelList = (newBreadCrumbLableList: Array<string>) => {
    setBreadCrumbLabelList(newBreadCrumbLableList);
  }
  
  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'Home',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateToCurrentHome(); }
      },
      { 
        label: 'Account'
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
    <React.Fragment>
      <Toast ref={toast} />
      {renderBreadcrumbs()}
      <ManageUserAccount 
        onSuccess={onSuccess} 
        onError={onError} 
        onCancel={onCancel}
        onBreadCrumbLabelList={onBreadcrumbLabelList}
      />
    </React.Fragment>
  );
}

 