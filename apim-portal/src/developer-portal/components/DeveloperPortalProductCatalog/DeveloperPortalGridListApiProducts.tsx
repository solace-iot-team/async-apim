
import React from "react";

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataView, DataViewLayoutOptions, DataViewLayoutType } from 'primereact/dataview';
import { 
  APIProduct, 
  ApiProductsService, 
  CommonDisplayName, 
  CommonName, 
  EnvironmentResponse, 
  EnvironmentsService 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APManagedApiProductDisplay, TAPDeveloperPortalApiProductDisplay } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "././DeveloperPortalProductCatalogCommon";
import { Globals } from "../../../utils/Globals";

import '../../../components/APComponents.css';
import "./DeveloperPortalProductCatalog.css";
import "./DeveloperPortalProductCatalogGridList.css";

export interface IDeveloperPortalGridListApiProductsProps {
  organizationId: CommonName;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectOpen: (name: CommonName, displayName: CommonDisplayName) => void;
}

export const DeveloperPortalGridListApiProducts: React.FC<IDeveloperPortalGridListApiProductsProps> = (props: IDeveloperPortalGridListApiProductsProps) => {
  const componentName = 'DeveloperPortalGridListApiProducts';

  const MessageNoManagedProductsFound = "No API Products found."
  const MessageNoManagedProductsFoundWithFilter = 'No API Products found for search.';
  const GlobalSearchPlaceholder = 'search ...';
  const DefaultApiProductCategory = 'Solace AsyncAPI';
  const PlaceholderImageUrl = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png';
  const DefaultApiProductImageUrl = 'https://www.primefaces.org/primereact/showcase/showcase/demo/images/product/chakra-bracelet.jpg';

  type TManagedObject = TAPDeveloperPortalApiProductDisplay;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    apApiDisplayNameListAsString: string;
    apProtocolListAsString: string;
    apAttributeListAsString: string;
    apEnvironmentListAsStringList: Array<string>;
    apApiProductCategory: string;
    apApiProductImageUrl: string;
    globalSearch: string;
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const transformManagedObjectListToTableDataList = (moList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObjectToTableDataRow = (mo: TManagedObject): TManagedObjectTableDataRow => {
      const moTdRow: TManagedObjectTableDataRow = {
        ...mo,
        apApiDisplayNameListAsString: APManagedApiProductDisplay.getApApiDisplayNameListAsString(mo.apiApiProduct.apis),
        apProtocolListAsString: APManagedApiProductDisplay.getApProtocolListAsString(mo.apiApiProduct.protocols),
        apAttributeListAsString: APManagedApiProductDisplay.getApAttributeNamesAsString(mo.apiApiProduct.attributes),
        apEnvironmentListAsStringList: APManagedApiProductDisplay.getApEnvironmentsAsDisplayList(mo.apiEnvironmentList),
        apApiProductCategory: DefaultApiProductCategory,
        apApiProductImageUrl: DefaultApiProductImageUrl,
        globalSearch: ''
      };
      const globalSearch = APManagedApiProductDisplay.generateGlobalSearchContent(moTdRow);
      return {
        ...moTdRow,
        globalSearch: globalSearch
      }
    }
    return moList.map( (mo: TManagedObject) => {
      return _transformManagedObjectToTableDataRow(mo);
    });
  }
  const transformManagedObjectTableDataListToFilteredList = (motdList: TManagedObjectTableDataList, filterStr: string): TManagedObjectTableDataList => {
    const funcName = 'transformManagedObjectTableDataListToFilteredList';
    const logName = `${componentName}.${funcName}()`;

    const filterList: Array<string> = filterStr.split(' ');
    let _filteredMotdList: TManagedObjectTableDataList = [];
    motdList.forEach( (dataRow: TManagedObjectTableDataRow) => {
      filterList.forEach( (search: string) => {
        if(dataRow.globalSearch.includes(search)) {
        // if(dataRow.globalSearch.includes(search.toLowerCase())) {
          console.log(`${logName}: found search=${search} in ${dataRow.apApiProductDisplayName} ...`);
          _filteredMotdList.push(dataRow);
        }
      });  
    });
    console.log(`${logName}: _filteredMotdList.length=${_filteredMotdList.length}`);
    // console.log(`${logName}: _filteredMotdList=${JSON.stringify(_filteredMotdList, null, 2)}`);
    return _filteredMotdList;
  }

  const [managedObjectList, setManagedObjectList] = React.useState<TManagedObjectList>([]);  
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [isGetManagedObjectListInProgress, setIsGetManagedObjectListInProgress] = React.useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  const [managedObjectTableDataList, setManagedObjectTableDataList] = React.useState<TManagedObjectTableDataList>([]);
  const [filteredManagedObjectTableDataList, setFilteredManagedObjectTableDataList] = React.useState<TManagedObjectTableDataList>([]);

  // grid/list
  const [dataViewLayoutType, setDataViewLayoutType] = React.useState<DataViewLayoutType>('grid');

  // * Api Calls *
  const apiGetManagedObjectList = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObjectList';
    const logName = `${componentName}.${funcName}()`;
    console.log(`${logName}: starting: managedObjectList.length=${managedObjectList.length}`);

    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_PRODUCT_LIST, 'retrieve list of api products');
    try { 
      const apiApiProductList: Array<APIProduct> = await ApiProductsService.listApiProducts({
        organizationName: props.organizationId
      });
      let _moList: TManagedObjectList = [];
      // get all envs for all products
      let _apiEnvListCache: Array<EnvironmentResponse> = [];
      for(const apiApiProduct of apiApiProductList) {
        if(!apiApiProduct.environments) throw new Error(`${logName}: apiApiProduct.environments is undefined`);
        let _apiEnvList: Array<EnvironmentResponse> = [];
        for(const envName of apiApiProduct.environments) {
          const found = _apiEnvListCache.find( (apiEnv: EnvironmentResponse) => {
            return apiEnv.name === envName;
          });
          if(!found) {
            const _apiEnvResp: EnvironmentResponse = await EnvironmentsService.getEnvironment({
              organizationName: props.organizationId,
              envName: envName
            });
            _apiEnvListCache.push(_apiEnvResp);
            _apiEnvList.push(_apiEnvResp);
          } else {
            _apiEnvList.push(found);
          }
        }
        _moList.push(APManagedApiProductDisplay.createAPDeveloperPortalApiProductDisplayFromApiEntities(apiApiProduct, _apiEnvList));
      }
      setManagedObjectList(_moList);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    setIsGetManagedObjectListInProgress(false);
    return callState;
  }

  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObjectList();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    setManagedObjectTableDataList(transformManagedObjectListToTableDataList(managedObjectList));
  }, [managedObjectList]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    setFilteredManagedObjectTableDataList(transformManagedObjectTableDataListToFilteredList(managedObjectTableDataList, globalFilter));
  }, [managedObjectTableDataList, globalFilter]); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(apiCallStatus.success) props.onSuccess(apiCallStatus);
      else props.onError(apiCallStatus);
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Data Table *

  const onManagedObjectOpen = (event: any): void => {
    const id = event.currentTarget.dataset.id;
    const displayName = event.currentTarget.dataset.display_name;
    props.onManagedObjectOpen(id, displayName);
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

  const getApprovalText = (approvalType: APIProduct.approvalType | undefined): string => {
    const funcName = 'getApprovalText';
    const logName = `${componentName}.${funcName}()`;
    if(!approvalType) return 'N/A';
    switch(approvalType) {
      case APIProduct.approvalType.MANUAL:
        return 'requires approval';
      case APIProduct.approvalType.AUTO:
        return 'auto approved';
      default:
        Globals.assertNever(logName, approvalType);
    }
    return 'should never get here';
  }
  const getDetailsButton = (dataRow: TManagedObjectTableDataRow): JSX.Element => {
    return (
      <Button
        label='Details'
        key={componentName + dataRow.apApiProductName}
        data-id={dataRow.apApiProductName}
        data-display_name={dataRow.apApiProductDisplayName}
        className="p-button-text p-button-plain p-button-outlined" 
        onClick={onManagedObjectOpen}
      />
    );
  }
  const renderApiProductAsListItem = (dataRow: TManagedObjectTableDataRow) => {
    return (
      <div className="p-col-12">
        <div className="product-list-item">
          {/* <img src={`showcase/demo/images/product/${data.image}`} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt={data.name} /> */}
          <div className="product-list-detail">
            <div className="product-name">{dataRow.apApiProductDisplayName}</div>
            <div className="product-description">{dataRow.apiApiProduct.description}</div>
            <div className="product-api-name-list">APIs: {dataRow.apApiDisplayNameListAsString}</div>
            <div className="product-api-name-list">Attributes: {dataRow.apAttributeListAsString}</div>
            <div className="product-api-name-list">Environments: {dataRow.apEnvironmentListAsStringList.join(', ')}</div>
            <div className="product-api-name-list">Protocols: {dataRow.apProtocolListAsString}</div>
          </div>
          <div className="product-list-right">
            <div>
              <i className="pi pi-tag product-category-icon"></i>
              <span className="product-category">{dataRow.apApiProductCategory}</span>
            </div>
            <div>
              <span className={`product-badge status-${dataRow.apiApiProduct.approvalType?.toLocaleLowerCase()}`}>{getApprovalText(dataRow.apiApiProduct.approvalType)}</span>
            </div>
            <div className="p-mt-6">{getDetailsButton(dataRow)}</div>
          </div>
      </div>
    </div>
  );
}

const renderApiProductAsGridItem = (dataRow: TManagedObjectTableDataRow) => {
    return (
      <div className="p-col-12 p-md-4">
        <div className="product-grid-item card">
          <div className="product-grid-item-top">
            <div>
              <i className="pi pi-tag product-category-icon"></i>
              <span className="product-category">{dataRow.apApiProductCategory}</span>
            </div>
            <div>
              <span className={`product-badge status-${dataRow.apiApiProduct.approvalType?.toLocaleLowerCase()}`}>{getApprovalText(dataRow.apiApiProduct.approvalType)}</span>
            </div>
          </div>
          <div className="product-grid-item-content p-mt-4">
            {/* <img src={`showcase/demo/images/product/${data.image}`} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt={data.name} /> */}
            {/* <img src={dataRow.apApiProductImageUrl} onError={(e) => e.currentTarget.src=PlaceholderImageUrl} alt={dataRow.apApiProductDisplayName} /> */}
            <div className="product-name">{dataRow.apApiProductDisplayName}</div>
            <div className="product-description">{dataRow.apiApiProduct.description}</div>
            <div className="product-api-name-list">APIs: {dataRow.apApiDisplayNameListAsString}</div>
          </div>
          <div className="product-grid-item-bottom">
            {/* <span className="product-price">${'65'}</span> */}
            <span></span>
            {getDetailsButton(dataRow)}
          </div>
        </div>
      </div>
    );
}
  const renderApiProduct = (dataRow: TManagedObjectTableDataRow, layoutType: DataViewLayoutType) => {
    if(!dataRow) return (<></>);
    if(layoutType === 'list') return renderApiProductAsListItem(dataRow);
    else if (layoutType === 'grid') return renderApiProductAsGridItem(dataRow);
}
  const renderView = () => {
    const header = renderHeader();
    return (
      <div className="card">
          <DataView 
            value={filteredManagedObjectTableDataList} 
            layout={dataViewLayoutType} 
            header={header}
            itemTemplate={renderApiProduct} 
            // paginator 
            // rows={9}
            sortOrder={1} 
            sortField='apApiProductDisplayName'
          />
      </div>
    );
  }
  const renderContent = () => {
    if(filteredManagedObjectTableDataList.length === 0 && !isGetManagedObjectListInProgress && apiCallStatus && apiCallStatus.success) {
      if(globalFilter && globalFilter !== '') return (<h3>{MessageNoManagedProductsFoundWithFilter}</h3>);
      return (<h3>{MessageNoManagedProductsFound}</h3>);
    }
    if(filteredManagedObjectTableDataList.length > 0 && !isGetManagedObjectListInProgress) {
      return renderView();
    } 
  }

  const renderPageHeader = (): JSX.Element => {
    return(
      <React.Fragment>
        <div className="p-mb-2 p-mt-2 page-header">
          <div className="title p-mt-2 p-mb-4">Explore API Products</div>
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

      {renderContent()}
      
    </div>
  );
}