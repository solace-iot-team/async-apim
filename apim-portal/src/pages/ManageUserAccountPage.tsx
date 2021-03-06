import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import { GlobalElementStyles, Globals } from '../utils/Globals';
import { TApiCallState } from "../utils/ApiCallState";
import { UserContext } from '../components/APContextProviders/APUserContextProvider';
import { AuthContext } from '../components/AuthContextProvider/AuthContextProvider';
import { ManageUserAccount } from '../components/ManageUserAccount/ManageUserAccount';

import "./Pages.css";

export const ManageUserAccountPage: React.FC = (props: any) => {
  // const componentName = 'ManageUserAccountPage';

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);
  const [authContext, dispatchAuthContextAction] = React.useContext(AuthContext);
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);
  const history = useHistory();
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

  const renderBreadcrumbs = () => {
    const breadcrumbItems: Array<MenuItem> = [
      { 
        label: 'Home',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateToCurrentHome(); }
      },
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
    <React.Fragment>
      <Toast ref={toast} />
      {renderBreadcrumbs()}
      <ManageUserAccount 
        onSuccess={onSuccess} 
        onError={onError} 
        onCancel={onCancel}
        setBreadCrumbItemList={setBreadCrumbItemList}
      />
    </React.Fragment>
  );
}

 