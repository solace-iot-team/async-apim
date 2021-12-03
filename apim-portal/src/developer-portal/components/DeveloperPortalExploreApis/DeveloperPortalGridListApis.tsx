
import React from "react";

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataView, DataViewLayoutOptions, DataViewLayoutType } from 'primereact/dataview';
import { 
  APIInfoList,
  ApisService, 
  CommonDisplayName, 
  CommonEntityNameList, 
  CommonName, 
} from "@solace-iot-team/apim-connector-openapi-browser";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";

import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APManagedApiDisplay, TAPDeveloperPortalApiDisplay } from "../../../components/APComponentsCommon";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./DeveloperPortalExploreApisCommon";
import { Globals } from "../../../utils/Globals";
import { APRenderUtils } from "../../../utils/APRenderUtils";

import '../../../components/APComponents.css';
import "./DeveloperPortalExploreApis.css";
import "./DeveloperPortalExploreApisGridList.css";

export interface IDeveloperPortalGridListApisProps {
  organizationId: CommonName;
  onError: (apiCallState: TApiCallState) => void;
  onSuccess: (apiCallState: TApiCallState) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onManagedObjectOpen: (name: CommonName, displayName: CommonDisplayName) => void;
}

export const DeveloperPortalGridListApis: React.FC<IDeveloperPortalGridListApisProps> = (props: IDeveloperPortalGridListApisProps) => {
  const componentName = 'DeveloperPortalGridListApis';

  const MessageNoManagedProductsFound = "No APIs found."
  const MessageNoManagedProductsFoundWithFilter = 'No APIs found for search.';
  const GlobalSearchPlaceholder = 'search ...';
  const DefaultApiCategory = 'Async API';
  // const PlaceholderImageUrl = 'https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png';
  // const DefaultApiProductImageUrl = 'https://www.primefaces.org/primereact/showcase/showcase/demo/images/product/chakra-bracelet.jpg';

  type TManagedObject = TAPDeveloperPortalApiDisplay;
  type TManagedObjectList = Array<TManagedObject>;
  type TManagedObjectTableDataRow = TManagedObject & {
    // apUsedBy_ApiProductDisplayNameListAsString: string;
    apApiCategory: string;
    globalSearch: string;
  };
  type TManagedObjectTableDataList = Array<TManagedObjectTableDataRow>;

  const generateGlobalSearchContent = (dataRow: TManagedObjectTableDataRow): string => {
    const filtered = {
      ...dataRow,
    }
    return Globals.generateDeepObjectValuesString(filtered).toLowerCase();
  }
  const transformManagedObjectListToTableDataList = (moList: TManagedObjectList): TManagedObjectTableDataList => {
    const _transformManagedObjectToTableDataRow = (mo: TManagedObject): TManagedObjectTableDataRow => {
      const moTdRow: TManagedObjectTableDataRow = {
        ...mo,
        // apUsedBy_ApiProductDisplayNameListAsString: mo.apiUsedBy_ApiProductEntityNameList.join(', '),
        apApiCategory: DefaultApiCategory,
        globalSearch: ''
      };
      const globalSearch = generateGlobalSearchContent(moTdRow);
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

    if(filterStr === '') return motdList;
    const filterList: Array<string> = filterStr.toLowerCase().split(' ').filter( (s: string) => {
      return (s !== '');
    });
    // alert(`${logName}: filterList=${JSON.stringify(filterList, null, 2)}`);
    if(filterList.length === 0) return motdList;

    let _filteredMotdList: TManagedObjectTableDataList = [];
    motdList.forEach( (dataRow: TManagedObjectTableDataRow) => {
      filterList.forEach( (search: string) => {
        if(dataRow.globalSearch.includes(search)) {
          // console.log(`${logName}: found search=${search} in ${dataRow.apApiProductDisplayName} ...`);
          const found: number = _filteredMotdList.findIndex( (existingDataRow: TManagedObjectTableDataRow) => {
            return dataRow.apName === existingDataRow.apName;
          });
          if(found === -1 ) {
            // console.log(`${logName}: adding ${dataRow.apApiProductDisplayName} ...`);
            _filteredMotdList.push(dataRow);
          }
        }
      });  
    });
    // console.log(`${logName}: _filteredMotdList.length=${_filteredMotdList.length}`);
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
    setIsGetManagedObjectListInProgress(true);
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_DETAILS_LIST, 'retrieve list of api details');
    try { 
      const apiResult = await ApisService.listApis({
        organizationName: props.organizationId,
        format: "extended"
      });
      const apiAPIInfoList: APIInfoList = apiResult as APIInfoList;      
      let _moList: TManagedObjectList = [];
      for(const apiInfo of apiAPIInfoList) {
        // console.log(`${logName}: apiInfo=${JSON.stringify(apiInfo, null, 2)}`);
        if(!apiInfo.name) throw new Error(`${logName}: apiInfo.name is undefined`);
        // get the api Products using the api
        const apiApiProductEntityNameList: CommonEntityNameList = await ApisService.getApiReferencedByApiProducts({
          organizationName: props.organizationId,
          apiName: apiInfo.name
        });
        if(apiApiProductEntityNameList.length > 0) {
          _moList.push(APManagedApiDisplay.createAPDeveloperPortalApiDisplayFromApiEntities(apiInfo, apiApiProductEntityNameList));
        }
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

  // const getApprovalText = (approvalType: APIProduct.approvalType | undefined): string => {
  //   const funcName = 'getApprovalText';
  //   const logName = `${componentName}.${funcName}()`;
  //   if(!approvalType) return 'N/A';
  //   switch(approvalType) {
  //     case APIProduct.approvalType.MANUAL:
  //       return 'requires approval';
  //     case APIProduct.approvalType.AUTO:
  //       return 'auto approved';
  //     default:
  //       Globals.assertNever(logName, approvalType);
  //   }
  //   return 'should never get here';
  // }

  const renderApiProducts = (usedBy_ApiProductEntityNameList: CommonEntityNameList): JSX.Element => {
    const funcName = 'renderApiProducts';
    const logName = `${componentName}.${funcName}()`;
    if(usedBy_ApiProductEntityNameList.length === 0) throw new Error(`${logName}: usedBy_ApiProductEntityNameList.length === 0`);
    return (
      <div>
        {APRenderUtils.getCommonEntityNameListAsStringList(usedBy_ApiProductEntityNameList).join(', ')}
      </div>
    );
  }

  const getDetailsButton = (dataRow: TManagedObjectTableDataRow): JSX.Element => {
    return (
      <Button
        label='Details'
        key={componentName + dataRow.apName}
        data-id={dataRow.apName}
        data-display_name={dataRow.apDisplayName}
        className="p-button-text p-button-plain p-button-outlined" 
        onClick={onManagedObjectOpen}
      />
    );
  }
  const renderApiAsListItem = (dataRow: TManagedObjectTableDataRow) => {
    return (
      <div className="p-col-12">
        <div className="list-item">
          {/* <img src={`showcase/demo/images/product/${data.image}`} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt={data.name} /> */}
          <div className="list-detail">
            <div className="name">{dataRow.apDisplayName}</div>
            <div className="description">{dataRow.apiApiInfo.description}</div>
            <div className="api-product-name-list-title">API Products:</div>
            <div className="api-product-name-list">{renderApiProducts(dataRow.apiUsedBy_ApiProductEntityNameList)}</div>
          </div>
          <div className="list-right">
            <div>
              <i className="pi pi-tag category-icon"></i>
              <span className="category">{dataRow.apApiCategory}</span>
            </div>
            {/* <div>
              <span className={`product-badge status-${dataRow.apiApiProduct.approvalType?.toLocaleLowerCase()}`}>{getApprovalText(dataRow.apiApiProduct.approvalType)}</span>
            </div> */}
            <div className="p-mt-6">{getDetailsButton(dataRow)}</div>
          </div>
      </div>
    </div>
  );
}

const renderApiAsGridItem = (dataRow: TManagedObjectTableDataRow) => {
    return (
      <div className="p-col-12 p-md-4">
        <div className="grid-item card">
          <div className="grid-item-top">
            <div>
              <i className="pi pi-tag category-icon"></i>
              <span className="category">{dataRow.apApiCategory}</span>
            </div>
            {/* <div>
              <span className={`product-badge status-${dataRow.apiApiProduct.approvalType?.toLocaleLowerCase()}`}>{getApprovalText(dataRow.apiApiProduct.approvalType)}</span>
            </div> */}
          </div>
          <div className="grid-item-content p-mt-4">
            {/* <img src={`showcase/demo/images/product/${data.image}`} onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} alt={data.name} /> */}
            {/* <img src={dataRow.apApiProductImageUrl} onError={(e) => e.currentTarget.src=PlaceholderImageUrl} alt={dataRow.apApiProductDisplayName} /> */}
            <div className="name">{dataRow.apDisplayName}</div>
            <div className="description">{dataRow.apiApiInfo.description}</div>
            <div className="api-product-name-list-title">API Products:</div>
            <div className="api-product-name-list">{renderApiProducts(dataRow.apiUsedBy_ApiProductEntityNameList)}</div>

            {/* <div className="api-product-name-list">API Products: {renderApiProducts(dataRow.apiUsedBy_ApiProductEntityNameList)}</div> */}
          </div>
          <div className="grid-item-bottom">
            {/* <span className="product-price">${'65'}</span> */}
            <span></span>
            {getDetailsButton(dataRow)}
          </div>
        </div>
      </div>
    );
}
  const renderApi = (dataRow: TManagedObjectTableDataRow, layoutType: DataViewLayoutType) => {
    if(!dataRow) return (<></>);
    if(layoutType === 'list') return renderApiAsListItem(dataRow);
    else if (layoutType === 'grid') return renderApiAsGridItem(dataRow);
}
  const renderView = () => {
    const header = renderHeader();
    return (
      <div className="card">
          <DataView 
            value={filteredManagedObjectTableDataList} 
            layout={dataViewLayoutType} 
            header={header}
            itemTemplate={renderApi} 
            // paginator 
            // rows={9}
            sortOrder={1} 
            sortField='apDisplayName'
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
          <div className="title p-mt-2 p-mb-4">Explore APIs</div>
          <div className="p-input-icon-left p-mb-2">
            <i className="pi pi-search" />
            <InputText type="search" placeholder={GlobalSearchPlaceholder} onInput={onInputGlobalFilter} style={{width: '700px'}} value={globalFilter} />
          </div>
        </div>
      </React.Fragment>
    );
  }

  return (
    <div className="adp-explore-apis">

      {renderPageHeader()}

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {renderContent()}
      
    </div>
  );
}
