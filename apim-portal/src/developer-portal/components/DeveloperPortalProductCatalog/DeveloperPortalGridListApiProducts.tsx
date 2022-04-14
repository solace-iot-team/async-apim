
import React from "react";

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataView, DataViewLayoutOptions, DataViewLayoutType } from 'primereact/dataview';
import { MenuItem } from "primereact/api";

import { UserContext } from "../../../components/APContextProviders/APUserContextProvider";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "././DeveloperPortalProductCatalogCommon";
import APEntityIdsService, { TAPEntityId } from "../../../utils/APEntityIdsService";
import APDeveloperPortalApiProductsDisplayService, { TAPDeveloperPortalApiProductDisplay, TAPDeveloperPortalApiProductDisplayList } from "../../displayServices/APDeveloperPortalApiProductsDisplayService";
import { TAPApiDisplayList } from "../../../displayServices/APApisDisplayService";
import { TAPManagedAssetBusinessGroupInfo } from "../../../displayServices/APManagedAssetDisplayService";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";
import "./DeveloperPortalProductCatalogGridList.css";

export interface IDeveloperPortalGridListApiProductsProps {
  organizationEntityId: TAPEntityId;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectView: (apDeveloperPortalApiProductDisplay: TAPDeveloperPortalApiProductDisplay) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const DeveloperPortalGridListApiProducts: React.FC<IDeveloperPortalGridListApiProductsProps> = (props: IDeveloperPortalGridListApiProductsProps) => {
  const ComponentName = 'DeveloperPortalGridListApiProducts';

  const MessageNoManagedProductsFound = "No API Products found."
  const MessageNoManagedProductsFoundWithFilter = 'No API Products found for search.';
  const GlobalSearchPlaceholder = 'search ...';

  type TManagedObject = TAPDeveloperPortalApiProductDisplay;
  type TManagedObjectList = Array<TManagedObject>;

  const createCustomSearchContent = (moList: TManagedObjectList) => {
    moList.forEach( (mo) => {
      const accessDisplay = APDeveloperPortalApiProductsDisplayService.create_AccessDisplay({ 
        apDeveloperPortalApiProductDisplay: mo, 
        userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id,
        userId: userContext.apLoginUserDisplay.apEntityId.id
      });
      mo.apSearchContent = 
        accessDisplay.toLowerCase() + ','
        + mo.apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName.toLowerCase() + ','
        + mo.apEntityId.displayName.toLowerCase() + ',' 
        + mo.apDescription.toLowerCase() + ','
        + APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(mo.apApiDisplayList).join(', ').toLowerCase()
      ;
    });
  }
  const filterManagedObjectList = (moList: TManagedObjectList, filterStr: string): TManagedObjectList => {
    if(filterStr === '') return moList;
    const filterList: Array<string> = filterStr.toLowerCase().split(' ').filter( (s: string) => {
      return (s !== '');
    });
    // alert(`${logName}: filterList=${JSON.stringify(filterList, null, 2)}`);
    if(filterList.length === 0) return moList;

    let _filteredMoList: TManagedObjectList = [];
    moList.forEach( (mo: TManagedObject) => {
      filterList.forEach( (search: string) => {
        if(mo.apSearchContent.includes(search)) {
          // console.log(`${logName}: found search=${search} in ${dataRow.apEntityId.displayName} ...`);
          const found: number = _filteredMoList.findIndex( (existingMo: TManagedObject) => {
            return mo.apEntityId.id === existingMo.apEntityId.id;
          });
          if(found === -1 ) {
            // console.log(`${logName}: adding ${dataRow.apApiProductDisplayName} ...`);
            _filteredMoList.push(mo);
          }
        }
      });  
    });
    // console.log(`${logName}: _filteredMotdList.length=${_filteredMotdList.length}`);
    return _filteredMoList;
  }

  const [userContext] = React.useContext(UserContext);
  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>();  
  const [filteredManagedObjectList, setFilteredManagedObjectList] = React.useState<TManagedObjectList>();

  const [isInitialized, setIsInitialized] = React.useState<boolean>(false); 
  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  // grid/list
  const [dataViewLayoutType, setDataViewLayoutType] = React.useState<DataViewLayoutType>('grid');

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${ComponentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT_LIST, 'retrieve list of api products');
    if(userContext.runtimeSettings.currentBusinessGroupEntityId === undefined) throw new Error(`${logName}: userContext.runtimeSettings.currentBusinessGroupEntityId === undefined`);
    try {
      const list: TAPDeveloperPortalApiProductDisplayList = await APDeveloperPortalApiProductsDisplayService.apiGetList_ApDeveloperPortalApiProductDisplayList({
        organizationId: props.organizationEntityId.id,
        businessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId.id,
        userId: userContext.apLoginUserDisplay.apEntityId.id,
        filterByIsAllowed_To_CreateApp: false
      });
      createCustomSearchContent(list);
      setManagedObjectList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObjectList();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    props.setBreadCrumbItemList([]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectList === undefined) return;
    setFilteredManagedObjectList(filterManagedObjectList(managedObjectList, globalFilter));
  }, [managedObjectList, globalFilter]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(filteredManagedObjectList === undefined) return;
    setIsInitialized(true);
  }, [filteredManagedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) props.onSuccess(apiCallStatus);
      else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *

  const onManagedObjectView = (event: any): void => {
    const funcName = 'onManagedObjectView';
    const logName = `${ComponentName}.${funcName}()`;
    if(managedObjectList === undefined) throw new Error(`${logName}: managedObjectList === undefined`);
    const id = event.currentTarget.dataset.id;
    if(id === undefined) throw new Error(`${logName}: id === undefined`);
    if(typeof id !== 'string') throw new Error(`${logName}: typeof id !== 'string'`);
    const mo: TManagedObject | undefined = managedObjectList.find( (x) => {
      return x.apEntityId.id === id;
    });
    if(mo === undefined) throw new Error(`${logName}: mo === undefined`);
    props.onManagedObjectView(mo);
  }

  const onInputGlobalFilter = (event: React.FormEvent<HTMLInputElement>) => {
    setGlobalFilter(event.currentTarget.value);
  }

  const renderHeader = (): React.ReactNode => {
    return (
      <div className="p-grid p-nogutter">
        <div className="p-col-6" style={{textAlign: 'left'}}>
          {/* <Dropdown options={sortOptions} value={sortKey} optionLabel="label" placeholder="Sort By Price" onChange={onSortChange}/> */}
        </div>
        <div className="p-col-6" style={{textAlign: 'right'}}>
          <DataViewLayoutOptions layout={dataViewLayoutType} onChange={(e) => setDataViewLayoutType(e.value)} />
        </div>
      </div>
    );
  }

  // const getApprovalText = (apApprovalType: EAPApprovalType): string => {
  //   const funcName = 'getApprovalText';
  //   const logName = `${ComponentName}.${funcName}()`;
  //   switch(apApprovalType) {
  //     case EAPApprovalType.MANUAL:
  //       return 'requires approval';
  //     case EAPApprovalType.AUTO:
  //       return 'auto approved';
  //     default:
  //       Globals.assertNever(logName, apApprovalType);
  //   }
  //   return 'should never get here';
  // }
  // const getAccessLevelText = (apAccessLevel: APIProductAccessLevel): string => {
  //   return 
  //   const funcName = 'getAccessLevelText';
  //   const logName = `${ComponentName}.${funcName}()`;
  //   switch(apAccessLevel) {
  //     case APIProductAccessLevel.PRIVATE:
  //       return 'private';
  //     case APIProductAccessLevel.INTERNAL:
  //       return 'internal';
  //     case APIProductAccessLevel.PUBLIC:
  //       return 'public';
  //     default:
  //       Globals.assertNever(logName, apAccessLevel);  
  //   }
  //   return 'should never get here';
  // }
  const getApisText = (apApiDisplayList: TAPApiDisplayList, maxLen: number): string => {
    const t = APEntityIdsService.create_SortedDisplayNameList_From_ApDisplayObjectList(apApiDisplayList).join(', ');
    if(t.length > maxLen) return t.substring(0, maxLen-3) + '...';
    return t;
  }
  const getBusinessGroupText = (apBusinessGroupInfo: TAPManagedAssetBusinessGroupInfo): string => {
    return apBusinessGroupInfo.apOwningBusinessGroupEntityId.displayName;
  }

  const getDetailsButton = (mo: TManagedObject): JSX.Element => {
    return (
      <Button
        label='Details'
        key={ComponentName + mo.apEntityId.id}
        data-id={mo.apEntityId.id}
        // data-display_name={dataRow.apEntityId.displayName}
        className="p-button-text p-button-plain p-button-outlined" 
        onClick={onManagedObjectView}
      />
    );
  }
  const renderApiProductAsListItem = (mo: TManagedObject) => {
    return (
      <div className="p-col-12">
        <div className="product-list-item">
          {/* <img src={`showcase/demo/images/product/${data.image}`} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt={data.name} /> */}
          <div className="product-list-detail">
            <div className="product-name">{mo.apEntityId.displayName}</div>
            <div className="product-description">{mo.apDescription}</div>
            <div className="product-name-list">APIs: {getApisText(mo.apApiDisplayList, 100)}</div>

            {/* <div className="product-name-list">Attributes: {dataRow.apAttributeDisplayNameList.join(', ')}</div>
            <div className="product-name-list">Environments: {dataRow.apEnvironmentDisplayNameList.join(', ')}</div>
            <div className="product-name-list">Protocols: {dataRow.apProtocolDisplayNameList.join(', ')}</div> */}
          </div>
          <div className="product-list-right">
            <div>
              {/* <i className="pi pi-tag product-category-icon"></i>
              <span className="product-category">{mo.apApiProductCategoryDisplayName}</span> */}
              <div className="business-group">{getBusinessGroupText(mo.apBusinessGroupInfo)}</div>
            </div>
            <div>
              {/* <div className={`product-badge status-${mo.apApprovalType.toLocaleLowerCase()}`}>{getApprovalText(mo.apApprovalType)}</div>
              <div className={`product-badge status-${mo.apAccessLevel.toLocaleLowerCase()}`}>{getAccessLevelText(mo.apAccessLevel)}</div> */}
              <div className="product-access">{APDeveloperPortalApiProductsDisplayService.create_AccessDisplay({ 
                apDeveloperPortalApiProductDisplay: mo, 
                userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id,
                userId: userContext.apLoginUserDisplay.apEntityId.id
                })}</div>
            </div>
            <div className="p-mt-6">{getDetailsButton(mo)}</div>
          </div>
      </div>
    </div>
  );
}

const renderApiProductAsGridItem = (mo: TManagedObject) => {
    return (
      <div className="p-col-12 p-md-4">
        <div className="product-grid-item card">
          <div className="product-grid-item-top" style={{alignItems: 'top'}}>
            <div>
              {/* <i className="pi pi-tag product-category-icon"></i> */}
              {/* <span className="product-category">{mo.apApiProductCategoryDisplayName}</span> */}
              <div className="business-group">{getBusinessGroupText(mo.apBusinessGroupInfo)}</div>
            </div>
            <div>
              {/* <div className={`product-badge status-${mo.apApprovalType.toLocaleLowerCase()}`}>{getApprovalText(mo.apApprovalType)}</div>
              <div className={`product-badge status-${mo.apAccessLevel.toLocaleLowerCase()}`}>{getAccessLevelText(mo.apAccessLevel)}</div> */}
              {/* <div className="business-group">{getBusinessGroupText(mo.apBusinessGroupInfo)}</div> */}

              <div className="product-access">{APDeveloperPortalApiProductsDisplayService.create_AccessDisplay({ 
                apDeveloperPortalApiProductDisplay: mo, 
                userBusinessGroupId: userContext.runtimeSettings.currentBusinessGroupEntityId?.id,
                userId: userContext.apLoginUserDisplay.apEntityId.id
                })}</div>

            </div>
          </div>
          <div className="product-grid-item-content p-mt-4">
            {/* <img src={`showcase/demo/images/product/${data.image}`} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt={data.name} /> */}
            {/* <img src={dataRow.apApiProductImageUrl} onError={(e) => e.currentTarget.src=PlaceholderImageUrl} alt={dataRow.apApiProductDisplayName} /> */}
            <div className="product-name">{mo.apEntityId.displayName}</div>
            <div className="product-description">{mo.apDescription}</div>
            <div className="product-api-name-list">APIs: {getApisText(mo.apApiDisplayList, 45)}</div>
          </div>
          <div className="product-grid-item-bottom">
            {/* <span className="product-price">${'65'}</span> */}
            <span></span>
            {getDetailsButton(mo)}
          </div>
        </div>
      </div>
    );
}
  const renderApiProduct = (mo: TManagedObject, layoutType: DataViewLayoutType) => {
    if(mo === undefined) return (<></>);
    if(layoutType === 'list') return renderApiProductAsListItem(mo);
    else if (layoutType === 'grid') return renderApiProductAsGridItem(mo);
}

  const renderView = () => {
    const header = renderHeader();
    const dataKeyField = APDeveloperPortalApiProductsDisplayService.nameOf_ApEntityId('id');
    const sortField: string = APDeveloperPortalApiProductsDisplayService.nameOf_ApEntityId('displayName');
    return (
      <div className="card">
        <DataView 
          id={dataKeyField}
          value={filteredManagedObjectList} 
          layout={dataViewLayoutType} 
          header={header}
          itemTemplate={renderApiProduct} 
          // paginator 
          // rows={9}
          sortOrder={1} 
          sortField={sortField}
        />
      </div>
    );
  }

  const renderContent = () => {
    const funcName = 'renderContent';
    const logName = `${ComponentName}.${funcName}()`;
    if(filteredManagedObjectList === undefined) throw new Error(`${logName}: filteredManagedObjectList === undefined`);
    if(filteredManagedObjectList.length === 0 && apiCallStatus && apiCallStatus.success) {
      if(globalFilter && globalFilter !== '') return (<h3>{MessageNoManagedProductsFoundWithFilter}</h3>);
      return (<h3>{MessageNoManagedProductsFound}</h3>);
    }
    if(filteredManagedObjectList.length > 0) {
      return renderView();
    } 
  }

  const renderPageHeader = (): JSX.Element => {
    return(
      <React.Fragment>
        <div className="p-mb-2 p-mt-2 page-header">
          <div className="title p-mt-2 p-mb-4">Explore API Products</div>
          {/* <div className="title p-mt-2 p-mb-4">Explore APIs</div> */}
          <div className="p-input-icon-left p-mb-2">
            <i className="pi pi-search" />
            <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '700px'}} value={globalFilter} />
          </div>
        </div>
      </React.Fragment>
    );
  }

  return (
    <div className="adp-productcatalog">

      {renderPageHeader()}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {isInitialized && renderContent()}
      
    </div>
  );
}
