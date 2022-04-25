import React from 'react';
import { useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import type { TApiCallState } from '../../utils/ApiCallState';
import { EUIDeveloperPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/APContextProviders/APUserContextProvider";
import { TAPOrganizationId } from '../../components/deleteme.APComponentsCommon';
import { DeveloperPortalExploreApis } from '../components/DeveloperPortalExploreApis/DeveloperPortalExploreApis';

import "../../pages/Pages.css";

export const DeveloperPortalExploreApisPage: React.FC = () => {
  const componentName="DeveloperPortalExploreApisPage";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userContext, dispatchUserContextAction] = React.useContext(UserContext);  

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
        label: 'Explore'
      },
      { 
        label: 'APIs',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIDeveloperPortalResourcePaths.ExploreApis) }
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
    const funcName = 'useEffect([userContext])';
    const logName = `${componentName}.${funcName}()`;
    if(!userContext.runtimeSettings.currentOrganizationEntityId) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationEntityId is undefined`);
    setOrganizationName(userContext.runtimeSettings.currentOrganizationEntityId.id);
  }, [userContext]);

  return (
    <React.Fragment>
      <Toast ref={toast} />
      {renderBreadcrumbs()}
      {organizationName &&
        <DeveloperPortalExploreApis
          organizationName={organizationName}
          onSuccess={onSuccess}
          onError={onError}
          onBreadCrumbLabelList={onBreadcrumbLabelList}
        />
      }
    </React.Fragment>
);

}

