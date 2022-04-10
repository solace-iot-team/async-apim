import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import { Toast } from 'primereact/toast';
import { MenuItem } from 'primereact/components/menuitem/MenuItem';
import { BreadCrumb } from 'primereact/breadcrumb';

import type { TApiCallState } from '../../utils/ApiCallState';
import { EUIDeveloperPortalResourcePaths, GlobalElementStyles } from '../../utils/Globals';
import { UserContext } from "../../components/APContextProviders/APUserContextProvider";
import { DeveloperPortalProductCatalog } from '../components/DeveloperPortalProductCatalog/DeveloperPortalProductCatalog';
import { TAPEntityId } from '../../utils/APEntityIdsService';

import "../../pages/Pages.css";

export const DeveloperPortalExploreApiProductsPage: React.FC = () => {
  const componentName="DeveloperPortalExploreApiProductsPage";

  const [userContext] = React.useContext(UserContext);  

  const toast = React.useRef<any>(null);
  const toastLifeSuccess: number = 3000;
  const toastLifeError: number = 10000;

  const history = useHistory();
  const navigateTo = (path: string): void => { history.push(path); }
  const [breadCrumbItemList, setBreadCrumbItemList] = React.useState<Array<MenuItem>>([]);

  const [organizationEntityId, setOrganizationEntityId] = React.useState<TAPEntityId>();

  const [locationState, setLocationState] = React.useState<TAPEntityId>();
  const location = useLocation<TAPEntityId>();

  React.useEffect(() => {
    const funcName = 'useEffect([])';
    const logName = `${componentName}.${funcName}()`;
    if(!userContext.runtimeSettings.currentOrganizationEntityId) throw new Error(`${logName}: userContext.runtimeSettings.currentOrganizationEntityId is undefined`);
    setOrganizationEntityId(userContext.runtimeSettings.currentOrganizationEntityId);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
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
        label: 'Explore'
      },
      { 
        // label: 'API Products',
        label: 'APIs',
        style: GlobalElementStyles.breadcrumbLink(),
        command: () => { navigateTo(EUIDeveloperPortalResourcePaths.ExploreApiProducts) }
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

  return (
    <React.Fragment>
      <Toast ref={toast} />
      {organizationEntityId && renderBreadcrumbs()}
      {organizationEntityId &&
        <DeveloperPortalProductCatalog
          organizationEntityId={organizationEntityId}
          viewApiProductEntityId={locationState}
          onSuccess={onSuccess} 
          onError={onError} 
          setBreadCrumbItemList={setBreadCrumbItemList}
        />
      }
    </React.Fragment>
  );

}

