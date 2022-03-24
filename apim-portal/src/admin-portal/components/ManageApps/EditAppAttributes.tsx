
import React from "react";
import { useForm } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { MenuItem } from "primereact/api";

import { 
  ApiProductsService,
  AppListItem,
  AppResponse,
  AppPatch,
  AppsService
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { 
  APSUserResponse,
  ApsUsersService 
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { Globals } from "../../../utils/Globals";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { TApiProductList } from "../../../components/APApiObjectsCommon";
import { TAPOrganizationId } from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";
import { APManageConnectorAttributes } from "../../../components/APManageAttributes/APManageConnectorAttributes";
import { APDisplayOwner } from "../../../components/APDisplay/APDisplayOwner";
import { TAPConnectorAttribute, TAPConnectorAttributeList } from "../../../utils/APAttributes/deleteme.APAttributesService";

import '../../../components/APComponents.css';
import "./ManageApps.css";

export interface IEditAppAttributesProps {
  organizationId: TAPOrganizationId,
  appId: string;
  appDisplayName: string;
  appType: AppListItem.appType;
  appOwnerId: string;
  onError: (apiCallState: TApiCallState) => void;
  onEditSuccess: (apiCallState: TApiCallState) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const EditAppAttributes: React.FC<IEditAppAttributesProps> = (props: IEditAppAttributesProps) => {
  const componentName = 'EditAppAttributes';

  type TAPApiProductAttribute = {
    name: string,
    displayName: string,
    attributeValue: string,
  };
  type TAPApiProductAttributeList = Array<TAPApiProductAttribute>;
  type TAPApiProductAttributeValueList = {
    apiProductAttributeList: TAPApiProductAttributeList,
    name: string,
    valueList: Array<string>
  }
  type TAPApiProductAttributeValueListList = Array<TAPApiProductAttributeValueList>;

  type TUpdateApiObject = AppPatch;
  type TManagedObject = {
    apiAppResponse: AppResponse;
    apiProductList: TApiProductList;
    apsUser: APSUserResponse;
    consolidatedApiProductAttributeValueListList: TAPApiProductAttributeValueListList;
    modifiedAppAttributeList: TAPConnectorAttributeList
  }
  type TManagedObjectFormData = TManagedObject & {
    attributeList: TAPConnectorAttributeList
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);

  // APP Attributes
  const combinedApiProductAttributesDataTableRef = React.useRef<any>(null);
  const [combinedApiProductAttributesDataTableGlobalFilter, setCombinedApiProductAttributesDataTableGlobalFilter] = React.useState<string>();
  const [selectedCombinedApiProductAttribute, setSelectedCombinedApiProductAttribute] = React.useState<TAPConnectorAttribute>();
  const [expandedApiProductAttributesDataTableRows, setExpandedApiProductAttributesDataTableRows] = React.useState<any>(null);
  const [managedAttributeListFormData, setManagedAttributeListFormData] = React.useState<TAPConnectorAttributeList>([]);
  
  // form
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;

  const transformApiProductAttributeToAttribute = (apiProductAttributeValueList: TAPApiProductAttributeValueList): TAPConnectorAttribute => {
    return {
      name: apiProductAttributeValueList.name,
      value: apiProductAttributeValueList.valueList.join(',')
    }
  }
  const createConsolidatedApiProductAttributeList = (apiProductList: TApiProductList): TAPApiProductAttributeValueListList => {
    const mergeValueLists = (one: Array<string>, two: Array<string>): Array<string> => {
      let mergedList: Array<string> = [];
      if(one.length > 0) mergedList = one.concat(two);
      else mergedList = two;
      // dedup mergedList
      const unique = new Map<string, number>();
      let distinct = [];
      for(let i=0; i < mergedList.length; i++) {
        if(!unique.has(mergedList[i])) {
          distinct.push(mergedList[i]);
          unique.set(mergedList[i], 1);
        }
      }
      return distinct;
    }

    const createValueListFromAttributeValue = (attributeValue: string): Array<string> => {
      const a: Array<string> = attributeValue.split(',');
      // console.log(`attributeValue=${attributeValue}`);
      // console.log(`a=${JSON.stringify(a)}`);
      return a;
    }

    let _attributeValueListList: TAPApiProductAttributeValueListList = [];
    for (const apiProduct of apiProductList) {
      // console.log(`${logName}:  apiProduct.name=${apiProduct.name}, apiProduct.attributes=${JSON.stringify(apiProduct.attributes)}`);
      apiProduct.attributes.forEach( (attribute: TAPConnectorAttribute) => {
        const attributeName: string = attribute.name;
        const attributeValueList: Array<string> = createValueListFromAttributeValue(attribute.value);
        const _found: TAPApiProductAttributeValueList | undefined = _attributeValueListList.find( (existing: TAPApiProductAttributeValueList) => {
          return existing.name === attributeName;
        });
        if(_found) {
          const newValueList: Array<string> = mergeValueLists(_found.valueList, attributeValueList);
          const idx = _attributeValueListList.findIndex( (elem: TAPApiProductAttributeValueList) => {
              return elem.name === _found.name;
            });
            _attributeValueListList[idx].valueList = newValueList;
            _attributeValueListList[idx].apiProductAttributeList.push({
              name: apiProduct.name,
              displayName: apiProduct.displayName,
              attributeValue: attribute.value
            });
        } else {
          _attributeValueListList.push({
            name: attributeName,
            valueList: attributeValueList,
            apiProductAttributeList: [ {
              name: apiProduct.name,
              displayName: apiProduct.displayName,
              attributeValue: attribute.value
            }]
          });
        }
      });
    }
    // console.log(`${logName}:  _attributeValueListList=${JSON.stringify(_attributeValueListList)}`);
    return _attributeValueListList;
  }

  const transformGetApiObjectsToManagedObject = (apiAppResponse: AppResponse, apiProductList: TApiProductList, apsUser: APSUserResponse): TManagedObject => {
    // const appAttributeList: TAPAttributeList = apiAppResponse.attributes ? apiAppResponse.attributes : [];
    const _managedObject: TManagedObject = {
      apiAppResponse: apiAppResponse,
      apiProductList: apiProductList,
      apsUser: apsUser,
      consolidatedApiProductAttributeValueListList: createConsolidatedApiProductAttributeList(apiProductList),
      modifiedAppAttributeList: []
    }
    return _managedObject;
  }

  const transformManagedObjectToUpdateApiObject = (managedObject: TManagedObject): TUpdateApiObject => {
    return {
      attributes: managedObject.modifiedAppAttributeList
    }
  }

  const transformManagedObjectToFormData = (managedObject: TManagedObject): TManagedObjectFormData => {
    const fd: TManagedObjectFormData = {
      ...managedObject,
      attributeList: managedObject.apiAppResponse.attributes ? managedObject.apiAppResponse.attributes : []
    }
    return fd;
  }
  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    const funcName = 'transformFormDataToManagedObject';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: formData=${JSON.stringify(formData, null, 2)}`);
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    const mo: TManagedObject = {
      ...managedObject,
      modifiedAppAttributeList: formData.attributeList,
    }
    return mo;
  }

  // * Api Calls *
  const apiGetManagedObject = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_APP, `retrieve app details for: ${props.appDisplayName}`);
    try {
      let _apiAppResponse: AppResponse | undefined = undefined;
      switch(props.appType) {
        case AppListItem.appType.DEVELOPER:
          _apiAppResponse = await AppsService.getDeveloperApp({
            organizationName: props.organizationId, 
            developerUsername: props.appOwnerId, 
            appName: props.appId
          });    
        break;
        case AppListItem.appType.TEAM:
          _apiAppResponse = await AppsService.getTeamApp({
            organizationName: props.organizationId, 
            teamName: props.appOwnerId,
            appName: props.appId
          });
        break;
        default:
          Globals.assertNever(logName, props.appType);
      }
      if(!_apiAppResponse) throw new Error(`${logName}: _apiAppResponse is undefined`);
      let _apiProductList: TApiProductList = [];
      for(const apiApiProductId of _apiAppResponse.apiProducts) {
        const apiApiProduct = await ApiProductsService.getApiProduct({
          organizationName: props.organizationId,
          apiProductName: apiApiProductId
        });
        _apiProductList.push(apiApiProduct);
      }
      let _apsUser: APSUserResponse | undefined = undefined;
      try {
        _apsUser = await ApsUsersService.getApsUser({
          userId: props.appOwnerId
        });
      } catch(e: any) {
        APSClientOpenApi.logError(logName, e);
        callState = ApiCallState.addErrorToApiCallState(e, callState);
        throw(e);
      }
      if(!_apsUser) throw new Error(`${logName}: _apsUser is undefined`);
      setManagedObject(transformGetApiObjectsToManagedObject(_apiAppResponse, _apiProductList, _apsUser));
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_APP, `update app: ${props.appDisplayName}`);
    try { 
      switch(props.appType) {
        case AppListItem.appType.DEVELOPER:
          await AppsService.updateDeveloperApp({
            organizationName: props.organizationId, 
            developerUsername: props.appOwnerId, 
            appName: props.appId,
            requestBody: transformManagedObjectToUpdateApiObject(managedObject)    
          });
        break;
        case AppListItem.appType.TEAM:
          await AppsService.updateTeamApp({
            organizationName: props.organizationId, 
            teamName: props.appOwnerId, 
            appName: props.appId,
            requestBody: transformManagedObjectToUpdateApiObject(managedObject)    
          });
        break;
        default:
          Globals.assertNever(logName, props.appType);
      }
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: `Attributes`
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      setManagedObjectFormData(transformManagedObjectToFormData(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormData) doPopulateManagedObjectFormDataValues(managedObjectFormData);
  }, [managedObjectFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_APP) {
        props.onEditSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Attributes *
  const onAttributeListUpdate = (attributeList: TAPConnectorAttributeList) => {
    setManagedAttributeListFormData(attributeList);
  }

  // * Form *
  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    // placeholder
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    props.onLoadingChange(true);
    await apiUpdateManagedObject(managedObject);
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (newManagedObjectFormData: TManagedObjectFormData) => {
    const _managedObjectFormData: TManagedObjectFormData = {
      ...newManagedObjectFormData,
      attributeList: managedAttributeListFormData
    }
    doSubmitManagedObject(transformFormDataToManagedObject(_managedObjectFormData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    // placeholder
  }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button key={componentName+"SAVE"} form={formId} type="submit" label="Save" icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderCombinedApiProductAttributes = (): JSX.Element => {
    const funcName = 'renderCombinedApiProductAttributes';
    const logName = `${componentName}.${funcName}()`;

    const rowExpansionTemplate = (rowData: TAPApiProductAttributeValueList) => {
      const dataTableList = rowData.apiProductAttributeList;
      return (
        <div>
          <DataTable 
            className="p-datatable-sm"
            value={dataTableList}
            // autoLayout={true}
            sortMode="single" 
            sortField="displayName" 
            sortOrder={1}  
          >
            <Column 
              field="displayName" 
              header="API Product" 
              // bodyStyle={{ verticalAlign: 'top' }}
              style={{width: '30%'}}
              sortable
            />
            <Column 
              field="attributeValue" 
              header="Attribute Value(s)"
              bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} 
            />
          </DataTable>
        </div>
      );
    }

    const renderDataTableHeader = (): JSX.Element => {
      const onInputFilter = (event: React.FormEvent<HTMLInputElement>) => {
        setCombinedApiProductAttributesDataTableGlobalFilter(event.currentTarget.value);
      }
      return (
        <div className="table-header">
          <div>API Products Attributes</div>
          <div>
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText type="search" placeholder='search ...' onInput={onInputFilter} style={{width: '500px'}}/>
            </span>
          </div>  
        </div>
      );
    }
    const createEmptyMessage = (): string => {
      if(!combinedApiProductAttributesDataTableGlobalFilter || combinedApiProductAttributesDataTableGlobalFilter === '') return 'No API Product attributes defined.'
      else return 'No API Product attributes found for search.'
    }

    const valueListBodyTemplate = (rowData: TAPApiProductAttributeValueList): JSX.Element => {
      return (
        <div>
          {rowData.valueList.length > 0 ? rowData.valueList.join(',') : 'No values defined.'}
        </div>
      );
    }


    // main 
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    const dataTableList: TAPApiProductAttributeValueListList = managedObject.consolidatedApiProductAttributeValueListList;
    return (
      <React.Fragment>        
        <DataTable 
          style={{borderWidth: 'thin'}}
          ref={combinedApiProductAttributesDataTableRef}
          dataKey="name"
          className="p-datatable-sm"
          header={renderDataTableHeader()}
          value={dataTableList}
          emptyMessage={createEmptyMessage()}
          globalFilter={combinedApiProductAttributesDataTableGlobalFilter}
          autoLayout={false}
          selectionMode="single"
          selection={selectedCombinedApiProductAttribute}
          onSelectionChange={(e) => setSelectedCombinedApiProductAttribute(transformApiProductAttributeToAttribute(e.value))}
          scrollable 
          // scrollHeight="200px" 
          sortMode='single'
          sortField="name"
          sortOrder={1}          
          expandedRows={expandedApiProductAttributesDataTableRows}
          onRowToggle={(e) => setExpandedApiProductAttributesDataTableRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column expander style={{ width: '3em' }} />  
          <Column field="name" header="Attribute" style={{width: '20em'}} sortable />
          <Column 
            header="Value(s)" 
            filterField='valueList'
            body={valueListBodyTemplate}
            // field="value" 
            bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} 
            />
        </DataTable>
        {/* DEBUG */}
        {/* <p>selectedCombinedApiProductAttribute:</p>
        <pre style={ { fontSize: '8px' }} >
          {JSON.stringify(selectedCombinedApiProductAttribute, null, 2)}
        </pre> */}
      </React.Fragment>
    );
  }

  const renderManageAttributes = (): JSX.Element => {
    const funcName = 'renderManageAttributes';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    const attributeList: TAPConnectorAttributeList = managedObjectFormData.attributeList;
    return (  
      <React.Fragment>
        {renderCombinedApiProductAttributes()}
        <div className='p-mb-6'/>
        <APManageConnectorAttributes
          formId={componentName+'_APManageAttributes'}
          presetAttribute={selectedCombinedApiProductAttribute}
          attributeList={attributeList}
          onChange={onAttributeListUpdate}
        />
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObject) throw new Error(`${logName}: managedObject is undefined`);
    return (
      <div className="card">
        <div className="p-fluid">
          <div className="p-mt-4 p-mb-4">
            <div><b>Status</b>: {managedObject.apiAppResponse.status}</div>
            <div><b>Type</b>: {props.appType}</div>
            <APDisplayOwner 
              label='Owner'
              ownerId={props.appOwnerId}
              ownerType={props.appType === AppListItem.appType.DEVELOPER ? 'apsUser' : 'apsTeam'}
              apsUser={managedObject.apsUser}
              className='xx'
            />
          </div>

          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* placeholder for direct fields */}
          </form>  
          {/* attributes */}
          { renderManageAttributes() }
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }
  
  return (
    <div className="ap-manage-apps">

      <APComponentHeader header={`Edit APP Attributes: ${props.appDisplayName}`} />

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObjectFormData && renderManagedObjectForm() }

    </div>
  );
}
