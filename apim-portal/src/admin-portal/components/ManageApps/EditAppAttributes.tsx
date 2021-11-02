
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel, PanelHeaderTemplateOptions } from 'primereact/panel';
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { classNames } from 'primereact/utils';

import { 
  ApisService, 
  APIInfo, 
  APIProduct, 
  APIProductPatch,
  ApiProductsService,
  APIInfoList,
  EnvironmentsService,
  EnvironmentResponse,
  Protocol,
  APIParameter,
  ClientOptionsGuaranteedMessaging,
  AppListItem,
  AppResponse,
  AppPatch,
  AppsService
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APSUser, ApsUsersService } from "@solace-iot-team/apim-server-openapi-browser";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APConnectorFormValidationRules } from "../../../utils/APConnectorOpenApiFormValidationRules";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { 
  APApiObjectsCommon, 
  APApiProductsCommon, 
  APEnvironmentObjectsCommon, 
  TAPEnvironmentViewManagedObjectList, 
  TApiEnvironmentList, 
  TApiProductList
} from "../../../components/APApiObjectsCommon";
import { 
  APComponentsCommon,
  TApiEntitySelectItemIdList, 
  TApiEntitySelectItemList, 
  TAPOrganizationId 
} from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS } from "./ManageAppsCommon";
import { APManageAttributes } from "../../../components/APManageAttributes/APManageAttributes";
import { TAPAttribute, TAPAttributeList } from "../../../utils/APConnectorApiCalls";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

import { APManageApiParameter } from "../../../components/APApiParameters/APManageApiParameter";
import { TAPApiParameter } from "../../../components/APApiParameters/APApiParametersCommon";
import { APManageApiParameterAttribute, TAPManagedApiParameterAttribute } from "../../../components/APManageApiParameterAttribute/APManageApiParameterAttribute";
import { Globals } from "../../../utils/Globals";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";

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
}

export const EditAppAttributes: React.FC<IEditAppAttributesProps> = (props: IEditAppAttributesProps) => {
  const componentName = 'EditAppAttributes';

  type TUpdateApiObject = AppPatch;
  type TManagedObject = {
    apiAppResponse: AppResponse;
    apiProductList: TApiProductList;
    apsUser: APSUser;
    consolidatedApiProductAttributeList: TAPAttributeList;
    modifiedAppAttributeList: TAPAttributeList
  }
  type TManagedObjectFormData = TManagedObject & {
    attributeList: TAPAttributeList
  }
  
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  // manage ApiParameterAttribute
  const [manageApiParameterAttributesDataTableGlobalFilter, setManageApiParameterAttributesDataTableGlobalFilter] = React.useState<string>();
  const manageApiParameterAttributesDataTableRef = React.useRef<any>(null);
  const [selectedApisCombinedApiParameterList, setSelectedApisCombinedApiParameterList] = React.useState<Array<APIParameter>>([]);
  const [selectedApisCombinedApiParameter, setSelectedApisCombinedApiParameter] = React.useState<APIParameter>();
  const [presetAttribute, setPresetAttribute] = React.useState<TAPAttribute>();
  
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);

  const transformGetApiObjectsToManagedObject = (apiAppResponse: AppResponse, apiProductList: TApiProductList, apsUser: APSUser): TManagedObject => {
    const createConsolidatedApiProductAttributeList = (): TAPAttributeList => {
      alert(`createConsolidatedApiProductAttributeList - create consolidatedApiProductAttributeList`);
      return [{
        name: 'hello', value: 'world'
      }];
    }
    const _managedObject: TManagedObject = {
      apiAppResponse: apiAppResponse,
      apiProductList: apiProductList,
      apsUser: apsUser,
      consolidatedApiProductAttributeList: createConsolidatedApiProductAttributeList(),
      modifiedAppAttributeList: []
    }
    return _managedObject;
  }
  // const transformManagedObjectToUpdateApiObject = (managedObject: TManagedObject): TUpdateApiObject => {
  //   const apiProduct = managedObject.apiProduct;
  //   return {
  //     displayName: apiProduct.displayName,
  //     description: apiProduct.description,
  //     approvalType: apiProduct.approvalType,
  //     attributes: apiProduct.attributes,
  //     clientOptions: apiProduct.clientOptions,
  //     environments: apiProduct.environments,
  //     protocols: apiProduct.protocols,
  //     pubResources: apiProduct.pubResources,
  //     subResources: apiProduct.subResources,
  //     apis: apiProduct.apis
  //   }
  // }

  // const createCombinedApiParameterList = (selectedApiInfoList: APIInfoList): Array<APIParameter> => {
  //   const funcName = 'createCombinedApiParameterList';
  //   const logName = `${componentName}.${funcName}()`;
  //   const mergeEnumLists = (one: Array<string> | undefined, two: Array<string> | undefined): Array<string> | undefined => {
  //     let mergedList: Array<string> = [];
  //     if(!one && !two) return undefined;
  //     if(one) {
  //       if(two) mergedList = one.concat(two);
  //       else mergedList = one;
  //     } else if(two) {
  //       mergedList = two;
  //     }
  //     // dedup mergedList
  //     const unique = new Map<string, number>();
  //     let distinct = [];
  //     for(let i=0; i < mergedList.length; i++) {
  //       if(!unique.has(mergedList[i])) {
  //         distinct.push(mergedList[i]);
  //         unique.set(mergedList[i], 1);
  //       }
  //     }
  //     return distinct;
  //   }
  //   let apiParameterList: Array<APIParameter> = [];
  //   for(const apiInfo of selectedApiInfoList) {
  //     if(apiInfo.apiParameters) {
  //       for(const newApiParameter of apiInfo.apiParameters) {
  //         // console.log(`${logName}: start: apiParameterList=${JSON.stringify(apiParameterList)}`);
  //         const found: APIParameter | undefined = apiParameterList.find( (exsistingApiParameter: APIParameter) => {
  //           if(exsistingApiParameter.name === newApiParameter.name) {
  //             if(exsistingApiParameter.type !== newApiParameter.type) {
  //               console.warn(`${logName}: how to handle mismatching api parameter types: name:${newApiParameter.name}, api:${apiInfo.name}, type:${newApiParameter.type}, previous type=${exsistingApiParameter.type}`)
  //               // alert(`${logName}: TODO: handle mismatching api parameter types, name:${newApiParameter.name}, api:${apiInfo.name}, type:${newApiParameter.type}, previous type=${exsistingApiParameter.type}`);  
  //               // throw new Error(`${logName}: TODO: handle mismatching api parameter types, name:${newApiParameter.name}, api:${apiInfo.name}, type:${newApiParameter.type}, previous type=${exsistingApiParameter.type}`);  
  //             }
  //             return true;
  //           }  
  //         });
  //         if(found) {
  //           // merge the two enums if they have them
  //           // console.log(`${logName}: found.enum=${JSON.stringify(found.enum)}`)
  //           // console.log(`${logName}: newApiParameter.enum=${JSON.stringify(newApiParameter.enum)}`)
  //           const newEnumList: Array<string> | undefined = mergeEnumLists(found.enum, newApiParameter.enum);
  //           // console.log(`${logName}: newEnumList=${JSON.stringify(newEnumList)}`);
  //           if(newEnumList) {
  //             const idx = apiParameterList.findIndex( (elem: APIParameter) => {
  //               return elem.name === found.name;
  //             });
  //             apiParameterList[idx].enum = newEnumList;
  //           }
  //         } else apiParameterList.push(newApiParameter);
  //       }
  //     }
  //   }
  //   return apiParameterList;
  // }
  const transformManagedObjectToFormData = (managedObject: TManagedObject): TManagedObjectFormData => {
    const fd: TManagedObjectFormData = {
      ...managedObject,
      attributeList: managedObject.apiAppResponse.attributes ? managedObject.apiAppResponse.attributes : []
    }
    return fd;
  }
  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    // const funcName = 'transformFormDataToManagedObject';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: formData=${JSON.stringify(formData, null, 2)}`);
    const mo: TManagedObject = {
      ...formData,
      modifiedAppAttributeList: formData.attributeList
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
        case AppListItem.appType.DEVELOPER: {
          _apiAppResponse = await AppsService.getDeveloperApp({
            organizationName: props.organizationId, 
            developerUsername: props.appOwnerId, 
            appName: props.appId
          });    
        }
        break;
        case AppListItem.appType.TEAM: {
          _apiAppResponse = await AppsService.getTeamApp({
            organizationName: props.organizationId, 
            teamName: props.appOwnerId,
            appName: props.appId
          });
        }
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
      let _apsUser: APSUser | undefined = undefined;
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
    alert(`${logName}: implement me`);
    return callState;
    // try { 
    //   switch(props.appType) {
    //     case AppListItem.appType.DEVELOPER: {
    //       _apiAppResponse = await AppsService.getDeveloperApp({
    //         organizationName: props.organizationId, 
    //         developerUsername: props.appOwnerId, 
    //         appName: props.appId
    //       });    
    //     }
    //     break;
    //     case AppListItem.appType.TEAM: {
    //       _apiAppResponse = await AppsService.getTeamApp({
    //         organizationName: props.organizationId, 
    //         teamName: props.appOwnerId,
    //         appName: props.appId
    //       });
    //     }
    //     break;
    //     default:
    //       Globals.assertNever(logName, props.appType);
    //   }

    //   await ApiProductsService.updateApiProduct({
    //     organizationName: props.organizationId,
    //     apiProductName: managedObject.apiProduct.name,
    //     requestBody: transformManagedObjectToUpdateApiObject(managedObject)
    //   });  
    //   setUpdatedManagedObjectDisplayName(managedObject.apiProduct.displayName);
    // } catch(e: any) {
    //   APClientConnectorOpenApi.logError(logName, e);
    //   callState = ApiCallState.addErrorToApiCallState(e, callState);
    // }
    // setApiCallStatus(callState);
    // return callState;
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    // const funcName = 'doInitialize';
    // const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    await apiGetManagedObject();
    props.onLoadingChange(false);
  }

  React.useEffect(() => {
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
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_APP) {
        props.onEditSuccess(apiCallStatus);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Attributes *
  const onAttributeListUpdate = (attributeList: TAPAttributeList) => {
    const funcName = 'onAttributeListUpdate';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    managedObjectFormData.attributeList = attributeList;
  }

  // * Form *
  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    const funcName = 'doPopulateManagedObjectFormDataValues';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: managedObjectFormData=${JSON.stringify(managedObjectFormData, null, 2)}`);
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    // const funcName = 'doSubmitManagedObject';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: managedObject=${JSON.stringify(managedObject, null, 2)}`);
    props.onLoadingChange(true);
    await apiUpdateManagedObject(managedObject);
    props.onLoadingChange(false);
  }

  const onSubmitManagedObjectForm = (newManagedObjectFormData: TManagedObjectFormData) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    // console.log(`${logName}: managedObjectFormData=${JSON.stringify(managedObjectFormData, null, 2)}`);
    // alert(`${logName}: managedObjectFormData.attributeList = ${JSON.stringify(managedObjectFormData.attributeList)}`);
    setIsFormSubmitted(true);
    const _managedObjectFormData: TManagedObjectFormData = {
      ...newManagedObjectFormData,
      attributeList: managedObjectFormData.attributeList
    }
    doSubmitManagedObject(transformFormDataToManagedObject(_managedObjectFormData));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    setIsFormSubmitted(true);
  }

  const displayManagedObjectFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const displayManagedObjectFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  }

  const displaySelectedProtocolsErrorMessage = () => {
    if(isFormSubmitted && !isSelectedProtocolListValid()) return <p className="p-error">Select at least 1 protocol.</p>;
  }

  const managedObjectFormFooterRightToolbarTemplate = () => {
    const getSubmitButtonLabel = (): string => {
      if (props.action === EAction.NEW) return 'Create';
      else return 'Save';
    }
    return (
      <React.Fragment>
        <Button type="button" label="Cancel" className="p-button-text p-button-plain" onClick={onCancelManagedObjectForm} />
        <Button key={componentName+getSubmitButtonLabel()} form={formId} type="submit" label={getSubmitButtonLabel()} icon="pi pi-save" className="p-button-text p-button-plain p-button-outlined" />
      </React.Fragment>
    );
  }

  const renderManagedObjectFormFooter = (): JSX.Element => {
    return (
      <Toolbar className="p-mb-4" right={managedObjectFormFooterRightToolbarTemplate} />
    )
  }

  const renderApisToolbar = () => {
    let jsxButtonList: Array<JSX.Element> = [
      <Button style={ { width: '20rem' } } type="button" label={ButtonLabelSelectApis} className="p-button-text p-button-plain p-button-outlined" onClick={() => onSearchApis()} />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none' } } left={jsxButtonList} />      
    );
  }

  const renderEnvironmentsToolbar = () => {
    let jsxButtonList: Array<JSX.Element> = [
      <Button style={ { width: '20rem' } } type="button" label={ButtonLabelSelectEnvironments} className="p-button-text p-button-plain p-button-outlined" onClick={() => onSearchEnvironments()} />,
    ];
    return (
      <Toolbar className="p-mb-4" style={ { 'background': 'none', 'border': 'none' } } left={jsxButtonList} />      
    );
  }

  const [expandedApiPermissionRow, setExpandedApiPermissionRow] = React.useState<any>(null);

  const renderManageApiParametersTable = (): JSX.Element => {
    const isRowSelected = (rowData: APIParameter): boolean => {
      const found = selectedApiParameterList.find(element => element.name === rowData.name);
      return (found !== undefined);
    }
    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            API Parameters - Example with picklist
          </span>
        </div>
      );
    }
    const renderApiParameterRowExpansionTemplate = (row: APIInfo) => {
      const funcName = 'renderApiParameterRowExpansionTemplate';
      const logName = `${componentName}.${funcName}()`;

      const apiParameterValueBodyTemplate = (rowData: APIParameter): JSX.Element => {
        return (
          <div>
            {/* {rowData.enum && rowData.enum.join(',')} */}
            {rowData.enum ? rowData.enum.join(',') : 'No values defined.'}
          </div>
        );
      }
      const apiParameterBodyTemplate = (rowData: APIParameter): JSX.Element => {
        const onSave = (apApiParameter: TAPApiParameter) => {
          alert(`${logName}: apiParameterBodyTemplate.onSucces(): apApiParameter=${JSON.stringify(apApiParameter, null, 2)}`);
        }
        const onCancel = () => {
          alert(`${logName}: apiParameterBodyTemplate.onCancel()`);
        }

        return (
          <APManageApiParameter
            apiParameter={rowData} 
            isEditEnabled={isRowSelected(rowData)}
            onSave={onSave}
            onCancel={onCancel}
          />
        )
      }

      const apiProductValuesBodyTemplate = (rowData: APIParameter): JSX.Element => {
        const onSaveApiProductAttribute = (apManagedApiParameterAttribute: TAPManagedApiParameterAttribute) => {
          alert(`${logName}: apiProductValuesBodyTemplate.onSaveApiProductAttribute(): apApiParameter=${JSON.stringify(apManagedApiParameterAttribute, null, 2)}`);
        }
        const onDeleteApiProductAttribute = (apManagedApiParameterAttribute: TAPManagedApiParameterAttribute) => {
          alert(`${logName}: apiProductValuesBodyTemplate.onDeleteApiProductAttribute(): apApiParameter=${JSON.stringify(apManagedApiParameterAttribute, null, 2)}`);
        }
        const apManagedApiParameterAttribute: TAPManagedApiParameterAttribute = {
          apiParameter: rowData,
          // apiAttribute: ??
        }
        
        return (
          <APManageApiParameterAttribute
            apManagedApiParameterAttribute={apManagedApiParameterAttribute}
            options={{
              mode: 'apiProductValues'
            }}
            onSave={onSaveApiProductAttribute}
            onDelete={onDeleteApiProductAttribute}
          />
        );
      }

      const dataTableList = row.apiParameters;
      // console.log(`${logName}: dataTableList=${JSON.stringify(dataTableList, null, 2)}`);
      return (
        <div className="sub-table">
          <p>Select parameters & values to control.</p>
          <DataTable 
            dataKey="name"  
            className="p-datatable-sm"
            value={dataTableList}
            // autoLayout={true}
            selectionMode="checkbox"
            selection={selectedApiParameterList}
            onSelectionChange={(e) => setSelectedApiParameterList(e.value)}
            // sorting
            sortMode='single'
            sortField="name"
            sortOrder={1}          

          >
            <Column selectionMode="multiple" style={{width:'3em'}} />
            <Column field="name" header="Parameter" style={{width: '10em'}} />
            {/* <Column field="type" header="Type" /> */}
            {/* <Column field="enum" header="API Values" /> */}
            <Column body={apiParameterValueBodyTemplate} header="API Values" bodyStyle={{textAlign: 'left', overflow: 'scroll'}}/>
            <Column body={apiProductValuesBodyTemplate} header="API Product Values" bodyStyle={{textAlign: 'left', overflow: 'scroll'}}/>

            {/* <Column body={apiParameterBodyTemplate} header="OLD API Product Values" bodyStyle={{textAlign: 'left', overflow: 'scroll'}}/> */}

            {/* <Column field="transformedServiceClassDisplayedAttributes.highAvailability" header="Availability" /> */}
          </DataTable>
          {/* DEBUG */}
          <p>selectedApiParameterList:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(selectedApiParameterList, null, 2)}
          </pre>
        </div>
      );
    }
    if(selectedApiInfoList.length === 0) return (<></>);
    return (
      <React.Fragment>        
        {/* {displaySelectedProtocolsErrorMessage()} */}
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable
          collapsed={true}
        >
          <DataTable 
            // ref={dt}
            dataKey="name"
            className="p-datatable-sm"
            // header="Select protocols:"
            value={selectedApiInfoList}
            autoLayout={true}
            // selection={selectedProtocolList}
            // onSelectionChange={(e) => setSelectedProtocolList(e.value)}
            // sorting
            sortMode='single'
            sortField="name"
            sortOrder={1}          
            // row expansion
            expandedRows={expandedApiPermissionRow}
            onRowToggle={(e) => setExpandedApiPermissionRow(e.data)}
            rowExpansionTemplate={renderApiParameterRowExpansionTemplate}
          >
            {/* <Column selectionMode="multiple" style={{width:'3em'}} /> */}
            <Column expander style={{ width: '3em' }} />  
            <Column field="name" header="API" style={{width: '20em'}} />
            <Column field="version" header="Version" style={{width: '5em'}} />
            <Column field="description" header="Description" />
          </DataTable>
        </Panel>
      </React.Fragment>
    )
  }

  const renderProtocolsSelectionTable = (): JSX.Element => {
    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            Protocols
          </span>
        </div>
      );
    }
    if(selectedEnvironmentList.length === 0) return (<></>);
    const exposedProtocolList: TViewProtocolList = transformApiEnvironmentListToViewProtocolList(selectedEnvironmentList);
    return (  
      <React.Fragment>
        {displaySelectedProtocolsErrorMessage()}
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable
          collapsed
        >
          {displaySelectedProtocolsErrorMessage()}
          <DataTable 
            className="p-datatable-sm"
            // header="Select protocols:"
            value={exposedProtocolList}
            // autoLayout={true}
            selection={selectedProtocolList}
            onSelectionChange={(e) => setSelectedProtocolList(e.value)}
            // sorting
            sortMode='single'
            sortField="name"
            sortOrder={1}          
          >
            <Column selectionMode="multiple" style={{width:'3em'}} />
            <Column field="name" header="Protocol" style={{width: '20em'}} />
            <Column field="version" header="Version" />
          </DataTable>
        </Panel>
      </React.Fragment>
    );
  }

  const renderManageApiParameterAttributes = (): JSX.Element => {
    // const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
    //   const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
    //   const className = `${options.className} p-jc-start`;
    //   const titleClassName = `${options.titleClassName} p-pl-1`;
    //   return (
    //     <div className={className} style={{ justifyContent: 'left'}} >
    //       <button className={options.togglerClassName} onClick={options.onTogglerClick}>
    //         <span className={toggleIcon}></span>
    //       </button>
    //       <span className={titleClassName}>
    //         API Parameters
    //       </span>
    //     </div>
    //   );
    // }
    const apiParameterValueBodyTemplate = (rowData: APIParameter): JSX.Element => {
      return (
        <div>
          {rowData.enum ? rowData.enum.join(',') : 'No values defined.'}
        </div>
      );
    }
    const renderDataTableHeader = (): JSX.Element => {
      const onInputFilter = (event: React.FormEvent<HTMLInputElement>) => {
        setManageApiParameterAttributesDataTableGlobalFilter(event.currentTarget.value);
      }
      return (
        <div className="table-header">
          <div>API Parameters</div>
          <div>
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText type="search" placeholder='search ...' onInput={onInputFilter} style={{width: '500px'}}/>
            </span>
          </div>  
        </div>
      );
    }  
    // main
    // if(selectedApisCombinedApiParameterList.length === 0) return (
    //   <>
    //   <p>No API Parameters available.</p>
    //   </>
    // );
    return (
      <React.Fragment>        
        {/* <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable
          collapsed={false}
        > */}
          <DataTable 
            style={{'border-width': 'thin'}}
            ref={manageApiParameterAttributesDataTableRef}
            dataKey="name"
            className="p-datatable-sm"
            header={renderDataTableHeader()}
            value={selectedApisCombinedApiParameterList}
            emptyMessage='No API Parameters available.'
            globalFilter={manageApiParameterAttributesDataTableGlobalFilter}
            autoLayout={false}
            selectionMode="single"
            // onRowClick={onManagedObjectSelect}
            // onRowDoubleClick={(e) => onManagedObjectOpen(e)}
            selection={selectedApisCombinedApiParameter}
            onSelectionChange={(e) => setSelectedApisCombinedApiParameter(e.value)}
            scrollable 
            scrollHeight="200px" 
            sortMode='single'
            sortField="name"
            sortOrder={1}          
          >
            <Column field="name" header="API Parameter" style={{width: '20em'}} sortable />
            {/* <Column field="type" header="Type" style={{width: '5em'}} /> */}
            <Column 
              header="API Value(s)" 
              filterField='enum'
              body={apiParameterValueBodyTemplate}
              bodyStyle={{
                'overflow-wrap': 'break-word',
                'word-wrap': 'break-word'
              }} 
            />
          </DataTable>
          {/* DEBUG */}
          {/* <p>selectedApisCombinedApiParameter:</p>
          <pre style={ { fontSize: '8px' }} >
            {JSON.stringify(selectedApisCombinedApiParameter)}
          </pre> */}
          {/* <p>presetAttribute:</p>
          <pre style={ { fontSize: '8px' }} >
            {JSON.stringify(presetAttribute)}
          </pre> */}
        {/* </Panel> */}
      </React.Fragment>
    );
  }

  const renderManageAttributes = (): JSX.Element => {
    const funcName = 'renderManageAttributes';
    const logName = `${componentName}.${funcName}()`;

    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            Attributes
          </span>
        </div>
      );
    }
    // main
    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    const attributeList: TAPAttributeList = managedObjectFormData.attributeList;
    return (  
      <React.Fragment>
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable={true}
          collapsed={attributeList.length === 0}
        >
          <React.Fragment>
            {renderManageApiParameterAttributes()}
            <div className='p-mb-6'/>
            <APManageAttributes
              formId={componentName+'_APManageAttributes'}
              presetAttribute={presetAttribute}
              attributeList={attributeList}
              onChange={onAttributeListUpdate}
            />
          </React.Fragment>
        </Panel>
      </React.Fragment>
    );
  }

  const renderManageClientOptions = () => {
    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions) => {
      const toggleIcon = options.collapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down';
      const className = `${options.className} p-jc-start`;
      const titleClassName = `${options.titleClassName} p-pl-1`;
      return (
        <div className={className} style={{ justifyContent: 'left'}} >
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
          </button>
          <span className={titleClassName}>
            Client Options
          </span>
        </div>
      );
    }
    const renderManageClientOptionsGuaranteedMessaging = () => {
      // const isDisabled: boolean = !(managedObjectUseForm.watch(['clientOptionsGuaranteedMessaging.requireQueue'])[0]);
      // console.log(`managedObjectUseForm.formState = ${JSON.stringify(managedObjectUseForm.formState, null, 2)}`);

      // TODO: custom validation if unchecked => rewrite rules with validate function
      // const validateMaxTTL = (maxTTL: number): any => {
      //   return true;
      //   if(isDisabled) return true;
      //   // could call validation function for maxTTL
      //   return `isDisabled = ${isDisabled}, maxTTL=${maxTTL}`;
      // }
      return (
        <div className='card'>
          <div className="p-text-bold">Guaranteed Messaging:</div>
          <div className="p-ml-3 p-mt-3">
          {/* requireQueue */}
          <div className="p-field p-field-checkbox">
            <Controller
              control={managedObjectUseForm.control}
              name="clientOptionsGuaranteedMessaging.requireQueue"
              render={( { field, fieldState }) => {
                return(
                  <Checkbox
                    inputId={field.name}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.checked)}                                  
                    className={classNames({ 'p-invalid': fieldState.invalid })}                                       
                  />
              )}}
            />
            <label htmlFor="clientOptionsGuaranteedMessaging.requireQueue" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.clientOptionsGuaranteedMessaging?.requireQueue })}> Enabled</label>
            {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.clientOptionsGuaranteedMessaging?.requireQueue)}
          </div>
          {/* Access Type */}
          <div className="p-field">
            <span className="p-float-label">
              <Controller
                name="clientOptionsGuaranteedMessaging.accessType"
                control={managedObjectUseForm.control}
                rules={{
                  required: "Select access type.",
                }}
                render={( { field, fieldState }) => {
                    return(
                      <Dropdown
                        id={field.name}
                        {...field}
                        options={APApiProductsCommon.getQueueAccessTypeSelectList()} 
                        onChange={(e) => field.onChange(e.value)}
                        className={classNames({ 'p-invalid': fieldState.invalid })}     
                        // disabled={isDisabled}                                   
                      />                        
                    )}}
              />
              <label htmlFor="clientOptionsGuaranteedMessaging.accessType" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.clientOptionsGuaranteedMessaging?.accessType })}>Access Type*</label>
              <small id="clientOptionsGuaranteedMessaging.accessType-help">
                Queue access type.
              </small>              
            </span>
            {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.clientOptionsGuaranteedMessaging?.accessType)}
          </div>
          {/* Max TTL */}
          <div className="p-field">
            <span className="p-float-label">
              <Controller
                control={managedObjectUseForm.control}
                name="clientOptionsGuaranteedMessaging.maxTtl"
                rules={APConnectorFormValidationRules.ClientOptionsGuaranteedMessaging_MaxTTL()}
                // custom, isDisabled dependent function
                // rules={{
                //   validate: validateMaxTTL
                // }}
                render={( { field, fieldState }) => {
                  return(
                    <InputNumber
                      id={field.name}
                      {...field}
                      onChange={(e) => field.onChange(e.value)}
                      mode="decimal" 
                      useGrouping={false}
                      className={classNames({ 'p-invalid': fieldState.invalid })}      
                      // disabled={isDisabled}      
                      />
                )}}
              />
              <label htmlFor="clientOptionsGuaranteedMessaging.maxTtl" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.clientOptionsGuaranteedMessaging?.maxTtl })}>Max TTL (seconds) *</label>
              <small id="clientOptionsGuaranteedMessaging.maxTtl-help">Max Time-to-Live. Retention policy for message on the queue in seconds. Set to 0 if messages are to be kept indefinitely.</small>              
            </span>
            {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.clientOptionsGuaranteedMessaging?.maxTtl)}
          </div>
          {/* Max Spool Usage */}
          <div className="p-field">
            <span className="p-float-label">
              <Controller
                control={managedObjectUseForm.control}
                name="clientOptionsGuaranteedMessaging.maxMsgSpoolUsage"
                rules={APConnectorFormValidationRules.ClientOptionsGuaranteedMessaging_MaxSpoolUsage()}
                render={( { field, fieldState }) => {
                  return(
                    <InputNumber
                      id={field.name}
                      {...field}
                      onChange={(e) => field.onChange(e.value)}
                      mode="decimal" 
                      useGrouping={false}
                      className={classNames({ 'p-invalid': fieldState.invalid })}      
                      // disabled={isDisabled}                 
                    />
                )}}
              />
              <label htmlFor="clientOptionsGuaranteedMessaging.maxMsgSpoolUsage" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.clientOptionsGuaranteedMessaging?.maxMsgSpoolUsage })}>Max Spool Usage (MB) *</label>
              <small id="clientOptionsGuaranteedMessaging.maxMsgSpoolUsage-help">
                Maximum message spool usage allowed by the Queue, in megabytes (MB). 
                A value of 0 only allows spooling of the last message received and disables quota checking.
              </small>              
            </span>
            {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.clientOptionsGuaranteedMessaging?.maxMsgSpoolUsage)}
          </div>
          </div>
        </div>
      );
    }
    return (  
      <React.Fragment>
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable={true}
          collapsed={true}
        >
          { renderManageClientOptionsGuaranteedMessaging() }
        </Panel>
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {
    const funcName = 'renderManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    const isNewObject: boolean = (props.action === EAction.NEW);
    return (
      <div className="card">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* Id */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-key" />
                <Controller
                  name="apiProduct.name"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.Name()}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={isNewObject}
                          disabled={!isNewObject}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiProduct.name" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiProduct?.name })}>Name/Id*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiProduct?.name)}
            </div>
            {/* Display Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apiProduct.displayName"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.DisplayName()}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={!isNewObject}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiProduct.displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiProduct?.displayName })}>Display Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiProduct?.displayName)}
            </div>
            {/* description */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apiProduct.description"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter description.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <InputTextarea
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                      )}}
                />
                <label htmlFor="apiProduct.description" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiProduct?.description })}>Description*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiProduct?.description)}
            </div>
            {/* approvalType */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apiProduct.approvalType"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select approval type.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={APApiProductsCommon.getApprovalTypeSelectList()} 
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                      )}}
                />
                <label htmlFor="apiProduct.approvalType" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiProduct?.approvalType })}>Approval Type*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apiProduct?.approvalType)}
            </div>
            {/* apis */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apiSelectItemIdList"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 API."
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={inFormCurrentMultiSelectOptionApiSelectItemList} 
                          onChange={(e) => { field.onChange(e.value); onApisSelect(e.value); }}
                          optionLabel="displayName"
                          optionValue="id"
                          // style={{width: '500px'}} 
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="apiSelectItemIdList" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apiSelectItemIdList })}>API(s)*</label>
              </span>
              { displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.apiSelectItemIdList) }
              { renderApisToolbar() }
            </div>
            {/* environments */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="environmentSelectItemIdList"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 Environment."
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={inFormCurrentMultiSelectOptionEnvironmentSelectItemList} 
                          onChange={(e) => { field.onChange(e.value); onEnvironmentsSelect(e.value); }}
                          optionLabel="displayName"
                          optionValue="id"
                          // style={{width: '500px'}} 
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="environmentSelectItemIdList" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.environmentSelectItemIdList })}>Environment(s)*</label>
              </span>
              { displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.environmentSelectItemIdList) }
              { renderEnvironmentsToolbar() }
              { renderProtocolsSelectionTable() } 
            </div>
          </form>  
          {/* apiParameters */}
          <div className="p-field">
            { renderManageApiParametersTable() } 
          </div>
          {/* attributes */}
          <div className="p-field">
          { renderManageAttributes() }
          </div>
          {/* client options */}
          <div className="p-field">
          { renderManageClientOptions() }
          </div>
          {/* footer */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }
  
  return (
    <div className="manage-api-products">

      {props.action === EAction.NEW && 
        <APComponentHeader header='Create API Product:' />
      }

      {props.action === EAction.EDIT && 
        <APComponentHeader header={`Edit API Product: ${props.apiProductDisplayName}`} />
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObjectFormData && 
        renderManagedObjectForm()
      }

      {showSelectApis &&
        <SelectApis 
          organizationId={props.organizationId}
          currentSelectedApiItemList={inFormCurrentMultiSelectOptionApiSelectItemList}
          onSave={onManagedObjectFormSelectApisSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectApisCancel}
          onLoadingChange={props.onLoadingChange}
        />
      } 

      {showSelectEnvironments &&
        <SelectEnvironments
          organizationId={props.organizationId}
          currentSelectedEnvironmentItemList={inFormCurrentMultiSelectOptionEnvironmentSelectItemList}
          onSave={onManagedObjectFormSelectEnvironmentsSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectEnvironmentsCancel}
          onLoadingChange={props.onLoadingChange}
        />
      } 

      {/* DEBUG */}
      {/* {managedObject && 
        <React.Fragment>
          <p>managedObject:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObject.asyncApiSpec, null, 2)}
          </pre>
        </React.Fragment>
      } */}
      {managedObjectFormData && 
        <React.Fragment>
          {/* <p>selectedEnvironmentList:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(selectedEnvironmentList, null, 2)}
          </pre> */}
          {/* <p>selectedProtocolList:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(selectedProtocolList, null, 2)}
          </pre> */}
          {/* <p>managedObjectFormData.selectedProtocolList:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectFormData.selectedProtocolList, null, 2)}
          </pre> */}
          {/* <p>managedObject:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObject, null, 2)}
          </pre> */}
          {/* <p>managedObjectUseForm:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectUseForm.getValues(), null, 2)}
          </pre> */}

          {/* <p>managedObjectFormData:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectFormData, null, 2)}
          </pre> */}

          {/* <p>managedObjectFormData.apiProduct:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectFormData.apiProduct, null, 2)}
          </pre> */}

          {/* <p>managedObjectFormData.apiProduct.attributes:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectFormData.apiProduct.attributes, null, 2)}
          </pre> */}

          {/* <p>managedObjectFormData.clientOptionsGuaranteedMessaging:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectFormData.clientOptionsGuaranteedMessaging, null, 2)}
          </pre> */}

          {/* <p>selectedApisCombinedApiParameterList:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(selectedApisCombinedApiParameterList, null, 2)}
          </pre> */}

          {/* <p>managedObjectFormData.apiSelectItemIdList:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectFormData.apiSelectItemIdList, null, 2)}
          </pre> */}

          {/* <p>selectedApiInfoList:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(selectedApiInfoList, null, 2)}
          </pre> */}

          {/* <p>managedObjectFormData.apiInfoList:</p>
          <pre style={ { fontSize: '10px' }} >
            {JSON.stringify(managedObjectFormData.apiInfoList, null, 2)}
          </pre> */}
        </React.Fragment>
      }
    </div>
  );
}
