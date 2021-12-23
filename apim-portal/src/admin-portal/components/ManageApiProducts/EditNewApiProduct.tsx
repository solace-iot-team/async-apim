
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
  CommonEntityNameList
} from '@solace-iot-team/apim-connector-openapi-browser';
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
  TApiEnvironmentList 
} from "../../../components/APApiObjectsCommon";
import { 
  APComponentsCommon,
  TApiEntitySelectItemIdList, 
  TApiEntitySelectItemList, 
  TAPOrganizationId 
} from "../../../components/APComponentsCommon";
import { E_CALL_STATE_ACTIONS, TManagedObjectId} from "./ManageApiProductsCommon";
import { SelectApis } from "./SelectApis";
import { SelectEnvironments } from "./SelectEnvironments";
import { APManageAttributes } from "../../../components/APManageAttributes/APManageAttributes";
import { TAPAttribute, TAPAttributeList } from "../../../utils/APConnectorApiCalls";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewApiProductProps {
  action: EAction,
  organizationId: TAPOrganizationId,
  apiProductId?: TManagedObjectId;
  apiProductDisplayName?: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newId: TManagedObjectId, newDisplayName: string) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewApiProduct: React.FC<IEditNewApiProductProps> = (props: IEditNewApiProductProps) => {
  const componentName = 'EditNewApiProduct';

  type TViewProtocol = Protocol & {
    // environmentList: TApiEntitySelectItemIdList
  }
  type TViewProtocolList = Array<TViewProtocol>;
  type TUpdateApiObject = APIProductPatch;
  type TCreateApiObject = APIProduct;
  type TManagedObject = {
    apiProduct: APIProduct;
    apiInfoList: APIInfoList;
    apiEnvironmentList: TApiEnvironmentList;
    environmentList: TAPEnvironmentViewManagedObjectList;
    apiUsedBy_AppEntityNameList: CommonEntityNameList;
  }
  type TManagedObjectFormData = TManagedObject & {
    apiSelectItemIdList: TApiEntitySelectItemIdList, 
    environmentSelectItemIdList: TApiEntitySelectItemIdList,
    selectedProtocolList: TViewProtocolList,
    clientOptionsGuaranteedMessaging: ClientOptionsGuaranteedMessaging,
    attributeList: TAPAttributeList
  }
  
  const ButtonLabelSelectApis = 'Select API(s)';
  const ButtonLabelSelectEnvironments = 'Select Environment(s)';
  const emptyManagedObject: TManagedObject = {
    apiProduct: {
      apis: [],
      attributes: [],
      name: '',
      displayName: '',
      description: '',
      pubResources: [],
      subResources: []
    },
    apiInfoList: [],
    apiEnvironmentList: [],
    environmentList: [],
    apiUsedBy_AppEntityNameList: []
  };

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showSelectApis, setShowSelectApis] = React.useState<boolean>(false);
  const [selectedApiInfoList, setSelectedApiInfoList] = React.useState<APIInfoList>([]);
  const [showSelectEnvironments, setShowSelectEnvironments] = React.useState<boolean>(false);
  const [selectedEnvironmentList, setSelectedEnvironmentList] = React.useState<TApiEnvironmentList>([]);
  const [selectedProtocolList, setSelectedProtocolList] = React.useState<TViewProtocolList>([]);
  // manage ApiParameterAttribute
  const [manageApiParameterAttributesDataTableGlobalFilter, setManageApiParameterAttributesDataTableGlobalFilter] = React.useState<string>();
  const manageApiParameterAttributesDataTableRef = React.useRef<any>(null);
  const [selectedApisCombinedApiParameterList, setSelectedApisCombinedApiParameterList] = React.useState<Array<APIParameter>>([]);
  const [selectedApisCombinedApiParameter, setSelectedApisCombinedApiParameter] = React.useState<APIParameter>();
  const [presetAttribute, setPresetAttribute] = React.useState<TAPAttribute>();
  // inForm: MultiSelect
  const [inFormCurrentMultiSelectOptionApiSelectItemList, setInFormCurrentMultiSelectOptionApiSelectItemList] = React.useState<TApiEntitySelectItemList>([]);
  const [inFormCurrentMultiSelectOptionEnvironmentSelectItemList, setInFormCurrentMultiSelectOptionEnvironmentSelectItemList] = React.useState<TApiEntitySelectItemList>([]);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);

  const transformGetApiObjectsToManagedObject = (
    apiProduct: APIProduct, 
    apiInfoList: APIInfoList, 
    apiEnvironmentList: TApiEnvironmentList, 
    environmentList: TAPEnvironmentViewManagedObjectList,
    apiUsedBy_AppEntityNameList: CommonEntityNameList
  ): TManagedObject => {
    return {
      apiProduct: {
        ...apiProduct,
        approvalType: apiProduct.approvalType ? apiProduct.approvalType : APIProduct.approvalType.AUTO
      },
      apiInfoList: apiInfoList,
      apiEnvironmentList: apiEnvironmentList,
      environmentList: environmentList,
      apiUsedBy_AppEntityNameList: apiUsedBy_AppEntityNameList
    }
  }
  const transformManagedObjectToCreateApiObject = (managedObject: TManagedObject): TCreateApiObject => {
    return managedObject.apiProduct;
  }
  const transformManagedObjectToUpdateApiObject = (managedObject: TManagedObject): TUpdateApiObject => {
    const apiProduct = managedObject.apiProduct;
    return {
      displayName: apiProduct.displayName,
      description: apiProduct.description,
      approvalType: apiProduct.approvalType,
      attributes: apiProduct.attributes,
      clientOptions: apiProduct.clientOptions,
      environments: apiProduct.environments,
      protocols: apiProduct.protocols,
      pubResources: apiProduct.pubResources,
      subResources: apiProduct.subResources,
      apis: apiProduct.apis
    }
  }
  const transformApiEnvironmentListToViewProtocolList = (environmentList: TApiEnvironmentList): TViewProtocolList => {
    // const funcName = 'transformApiEnvironmentListToViewProtocolList';
    // const logName = `${componentName}.${funcName}()`;
    let viewProtocolList: TViewProtocolList = [];
    for(const environment of environmentList) {
      const exposedProtocols: Array<Protocol> = environment.exposedProtocols ? environment.exposedProtocols : [];
      viewProtocolList.push(...exposedProtocols);
    }
    const unique = new Map<string, number>();
    let distinct = [];
    for(let i=0; i < viewProtocolList.length; i++) {      
      if(!unique.has(viewProtocolList[i].name)) {
        distinct.push(viewProtocolList[i]);
        unique.set(viewProtocolList[i].name, 1);
      } 
    }
    return distinct;
  }
  const transformViewEnvironmentListToViewProtocolList = (environmentList: TAPEnvironmentViewManagedObjectList): TViewProtocolList => {
    // const funcName = 'transformApiEnvironmentListToViewProtocolList';
    // const logName = `${componentName}.${funcName}()`;
    let apiEnvironmentList: TApiEnvironmentList = [];
    for(const env of environmentList) {
      apiEnvironmentList.push(env.apiEnvironment);
    }
    return transformApiEnvironmentListToViewProtocolList(apiEnvironmentList);
  }

  const createCombinedApiParameterList = (selectedApiInfoList: APIInfoList): Array<APIParameter> => {
    const funcName = 'createCombinedApiParameterList';
    const logName = `${componentName}.${funcName}()`;
    const mergeEnumLists = (one: Array<string> | undefined, two: Array<string> | undefined): Array<string> | undefined => {
      let mergedList: Array<string> = [];
      if(!one && !two) return undefined;
      if(one) {
        if(two) mergedList = one.concat(two);
        else mergedList = one;
      } else if(two) {
        mergedList = two;
      }
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
    let apiParameterList: Array<APIParameter> = [];
    for(const apiInfo of selectedApiInfoList) {
      if(apiInfo.apiParameters) {
        for(const newApiParameter of apiInfo.apiParameters) {
          // console.log(`${logName}: start: apiParameterList=${JSON.stringify(apiParameterList)}`);
          const found: APIParameter | undefined = apiParameterList.find( (exsistingApiParameter: APIParameter) => {
            if(exsistingApiParameter.name === newApiParameter.name) {
              if(exsistingApiParameter.type !== newApiParameter.type) {
                console.warn(`${logName}: how to handle mismatching api parameter types: name:${newApiParameter.name}, api:${apiInfo.name}, type:${newApiParameter.type}, previous type=${exsistingApiParameter.type}`)
              }
              return true;
            }  
            return false;
          });
          if(found) {
            // merge the two enums if they have them
            // console.log(`${logName}: found.enum=${JSON.stringify(found.enum)}`)
            // console.log(`${logName}: newApiParameter.enum=${JSON.stringify(newApiParameter.enum)}`)
            const newEnumList: Array<string> | undefined = mergeEnumLists(found.enum, newApiParameter.enum);
            // console.log(`${logName}: newEnumList=${JSON.stringify(newEnumList)}`);
            if(newEnumList) {
              const idx = apiParameterList.findIndex( (elem: APIParameter) => {
                return elem.name === found.name;
              });
              apiParameterList[idx].enum = newEnumList;
            }
          } else apiParameterList.push(newApiParameter);
        }
      }
    }
    return apiParameterList;
  }
  const transformManagedObjectToFormData = (managedObject: TManagedObject): TManagedObjectFormData => {
    const defaultClientOptionsGuaranteedMessaging: ClientOptionsGuaranteedMessaging = {
      requireQueue: false,
      accessType: ClientOptionsGuaranteedMessaging.accessType.EXCLUSIVE,
      maxMsgSpoolUsage: 500,
      maxTtl: 86400
    } 
    let formDataClientOptionsGuaranteedMessaging: ClientOptionsGuaranteedMessaging;
    if(managedObject.apiProduct.clientOptions && managedObject.apiProduct.clientOptions.guaranteedMessaging) {
      formDataClientOptionsGuaranteedMessaging = managedObject.apiProduct.clientOptions.guaranteedMessaging;
    } else {
      formDataClientOptionsGuaranteedMessaging = defaultClientOptionsGuaranteedMessaging;
    }
    let fd: TManagedObjectFormData = {
      ...managedObject,
      apiSelectItemIdList: APApiObjectsCommon.transformApiInfoListToSelectItemIdList(managedObject.apiInfoList),
      environmentSelectItemIdList: APEnvironmentObjectsCommon.transformEnvironmentListToSelectItemIdList(managedObject.environmentList),
      selectedProtocolList: managedObject.apiProduct.protocols ? managedObject.apiProduct.protocols : transformViewEnvironmentListToViewProtocolList(managedObject.environmentList),
      clientOptionsGuaranteedMessaging: JSON.parse(JSON.stringify(formDataClientOptionsGuaranteedMessaging)),
      attributeList: managedObject.apiProduct.attributes
    }
    return fd;
  }
  const transformFormDataToManagedObject = (formData: TManagedObjectFormData): TManagedObject => {
    let mo: TManagedObject = {
      apiProduct: {
        ...formData.apiProduct,
        apis: formData.apiSelectItemIdList,
        attributes: formData.attributeList,
        environments: formData.environmentSelectItemIdList,
        pubResources: [],
        subResources: [],
        protocols: formData.selectedProtocolList,
        clientOptions: {
          guaranteedMessaging: formData.clientOptionsGuaranteedMessaging
        }
      },
      apiInfoList: [],
      apiEnvironmentList: [],
      environmentList: [],
      apiUsedBy_AppEntityNameList: []
    };
    return mo;
  }

  // * Api Calls *
  const apiGetManagedObject = async(managedObjectId: TManagedObjectId, managedObjectDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${managedObjectDisplayName}`);
    try {
      const apiProduct: APIProduct = await ApiProductsService.getApiProduct({
        organizationName: props.organizationId,
        apiProductName: managedObjectId
      });
      const apiAppEntityNameList: CommonEntityNameList = await ApiProductsService.listAppReferencesToApiProducts({
        organizationName: props.organizationId,
        apiProductName: apiProduct.name
      });
      // get all api infos
      let apiInfoList: APIInfoList = [];
      for(const apiId of apiProduct.apis) {
        const apiInfo: APIInfo = await ApisService.getApiInfo({
          organizationName: props.organizationId,
          apiName: apiId
        });
        apiInfoList.push(apiInfo);
      }
      // get environment 
      let environmentList: TAPEnvironmentViewManagedObjectList = [];
      let apiEnvironmentList: TApiEnvironmentList = [];
      if(apiProduct.environments) {
        for(const environmentName of apiProduct.environments) {
          const envResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({
            organizationName: props.organizationId,
            envName: environmentName
          });
          environmentList.push(APEnvironmentObjectsCommon.transformEnvironmentResponseToEnvironmentViewManagedObject(envResponse));
          apiEnvironmentList.push(envResponse);
        }
      }
      setManagedObject(transformGetApiObjectsToManagedObject(apiProduct, apiInfoList, apiEnvironmentList, environmentList, apiAppEntityNameList));
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(managedObject: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_API_PRODUCT, `create api product: ${managedObject.apiProduct.displayName}`);
    try { 
      await ApiProductsService.createApiProduct({
        organizationName: props.organizationId,
        requestBody: transformManagedObjectToCreateApiObject(managedObject)
      });
      setCreatedManagedObjectId(managedObject.apiProduct.name);
      setCreatedManagedObjectDisplayName(managedObject.apiProduct.displayName);      
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
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_API_PRODUCT, `update api product: ${managedObject.apiProduct.displayName}`);
    try { 
      await ApiProductsService.updateApiProduct({
        organizationName: props.organizationId,
        apiProductName: managedObject.apiProduct.name,
        requestBody: transformManagedObjectToUpdateApiObject(managedObject)
      });  
      setUpdatedManagedObjectDisplayName(managedObject.apiProduct.displayName);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetSelectedEnvironmentList = async(envIdList: TApiEntitySelectItemIdList): Promise<TApiCallState> => {
    const funcName = 'apiGetSelectedEnvironmentList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ENVIRONMENT_LIST, `retrieve selected environment list`);
    try {
      let apiEnvList: TApiEnvironmentList = [];
      for(const envId of envIdList) {
        const apiEnvironmentResponse: EnvironmentResponse = await EnvironmentsService.getEnvironment({
          organizationName: props.organizationId,
          envName: envId
        });
        apiEnvList.push(apiEnvironmentResponse);
      }
      setSelectedEnvironmentList(apiEnvList);
      setSelectedProtocolList(transformApiEnvironmentListToViewProtocolList(apiEnvList));
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;  
  }

  const apiGetSelectedApiInfoList = async(apiIdList: TApiEntitySelectItemIdList): Promise<TApiCallState> => {
    const funcName = 'apiGetSelectedApiInfoList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_INFO_LIST, `retrieve selected api info list`);
    try {
      let apiInfoList: APIInfoList = [];
      for(const apiId of apiIdList) {
        const apiInfo: APIInfo = await ApisService.getApiInfo({
          organizationName: props.organizationId,
          apiName: apiId
        });
        apiInfoList.push(apiInfo);
      }
      setSelectedApiInfoList(apiInfoList);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;  
  }

  // * useEffect Hooks *
  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.EDIT) {
      if(!props.apiProductId) throw new Error(`${logName}: props.action=${props.action}: props.apiProductId is undefined`);
      if(!props.apiProductDisplayName) throw new Error(`${logName}: props.action=${props.action}: props.apiDisplayName is undefined`);
      await apiGetManagedObject(props.apiProductId, props.apiProductDisplayName);
    } else {
      setManagedObject(emptyManagedObject);
    }
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
    setSelectedApisCombinedApiParameterList(createCombinedApiParameterList(selectedApiInfoList));
  }, [selectedApiInfoList]);
  
  React.useEffect(() => {
    if(selectedApisCombinedApiParameter) {
      const attribute: TAPAttribute = {
        name: selectedApisCombinedApiParameter.name,
        value: selectedApisCombinedApiParameter.enum ? selectedApisCombinedApiParameter.enum.join(',') : ''
      }
      setPresetAttribute(attribute);
    }
  }, [selectedApisCombinedApiParameter]);
  

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_API_PRODUCT) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onNewSuccess(apiCallStatus, createdManagedObjectId, createdManagedObjectDisplayName);
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_UPDATE_API_PRODUCT) {
        props.onEditSuccess(apiCallStatus, updatedManagedObjectDisplayName);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  // * Search + Select APIs *
  const onSearchApis = () => {
    setShowSelectApis(true);
  }

  const onManagedObjectFormSelectApisSuccess = (apiCallState: TApiCallState, modifiedSelectedApiEntityList: TApiEntitySelectItemList) => {
    const funcName = 'onManagedObjectFormSelectApisSuccess';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: modifiedSelectedApiEntityList=${JSON.stringify(modifiedSelectedApiEntityList, null, 2)}`);
    if(!apiCallState.success) throw new Error(`${logName}: apiCallState.success is false, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);
    setInFormCurrentMultiSelectOptionApiSelectItemList(modifiedSelectedApiEntityList);
    const modifiedIdList: TApiEntitySelectItemIdList = APComponentsCommon.transformSelectItemListToSelectItemIdList(modifiedSelectedApiEntityList);
    managedObjectUseForm.setValue('apiSelectItemIdList', modifiedIdList);
    managedObjectUseForm.trigger('apiSelectItemIdList');
    setShowSelectApis(false);
    onApisSelect(modifiedIdList);
  }

  const onManagedObjectFormSelectApisCancel = () => {
    setShowSelectApis(false);
  }

  const doUpdateSelectedApiInfoList = async(apiIdList: TApiEntitySelectItemIdList) => {
    await apiGetSelectedApiInfoList(apiIdList);
  }

  const onApisSelect = (apiIdList: TApiEntitySelectItemIdList) => {
    doUpdateSelectedApiInfoList(apiIdList);
  }

  // * Search + Select Environments & Protocols *
  const onSearchEnvironments = () => {
    setShowSelectEnvironments(true);
  }

  const onManagedObjectFormSelectEnvironmentsSuccess = (apiCallState: TApiCallState, modifiedSelectedEnvEntityList: TApiEntitySelectItemList) => {
    const funcName = 'onManagedObjectFormSelectEnvironmentsSuccess';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: modifiedSelectedApiEntityList=${JSON.stringify(modifiedSelectedApiEntityList, null, 2)}`);
    if(!apiCallState.success) throw new Error(`${logName}: apiCallState.success is false, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);
    setInFormCurrentMultiSelectOptionEnvironmentSelectItemList(modifiedSelectedEnvEntityList);
    const modifiedIdList: TApiEntitySelectItemIdList = APComponentsCommon.transformSelectItemListToSelectItemIdList(modifiedSelectedEnvEntityList);
    managedObjectUseForm.setValue('environmentSelectItemIdList', modifiedIdList);
    managedObjectUseForm.trigger('environmentSelectItemIdList');
    setShowSelectEnvironments(false);
    onEnvironmentsSelect(modifiedIdList);
  }

  const onManagedObjectFormSelectEnvironmentsCancel = () => {
    setShowSelectEnvironments(false);
  }

  const doUpdateAvailableProtocolList = async(envIdList: TApiEntitySelectItemIdList) => {
    await apiGetSelectedEnvironmentList(envIdList);
  }
  const onEnvironmentsSelect = (envIdList: TApiEntitySelectItemIdList) => {
    doUpdateAvailableProtocolList(envIdList);
  }

  // * Attributes *
  const onAttributeListUpdate = (attributeList: TAPAttributeList) => {
    const funcName = 'onAttributeListUpdate';
    const logName = `${componentName}.${funcName}()`;

    // must not change FormData, which updates values in form
    // instead: update separate state
    // onSubmit: merge into formData

    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    managedObjectFormData.attributeList = attributeList;
  }

  // * Form *
  const doPopulateManagedObjectFormDataValues = (managedObjectFormData: TManagedObjectFormData) => {
    // const funcName = 'doPopulateManagedObjectFormDataValues';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: managedObjectFormData=${JSON.stringify(managedObjectFormData, null, 2)}`);
    managedObjectUseForm.setValue('apiProduct.name', managedObjectFormData.apiProduct.name);
    managedObjectUseForm.setValue('apiProduct.displayName', managedObjectFormData.apiProduct.displayName);
    managedObjectUseForm.setValue('apiProduct.description', managedObjectFormData.apiProduct.description);
    managedObjectUseForm.setValue('apiProduct.approvalType', managedObjectFormData.apiProduct.approvalType);
    managedObjectUseForm.setValue('apiProduct.attributes', managedObjectFormData.apiProduct.attributes);
    // client options: guaranteed messaging
    managedObjectUseForm.setValue('clientOptionsGuaranteedMessaging.requireQueue', managedObjectFormData.clientOptionsGuaranteedMessaging.requireQueue);    
    managedObjectUseForm.setValue('clientOptionsGuaranteedMessaging.accessType', managedObjectFormData.clientOptionsGuaranteedMessaging.accessType);    
    managedObjectUseForm.setValue('clientOptionsGuaranteedMessaging.maxTtl', managedObjectFormData.clientOptionsGuaranteedMessaging.maxTtl);    
    managedObjectUseForm.setValue('clientOptionsGuaranteedMessaging.maxMsgSpoolUsage', managedObjectFormData.clientOptionsGuaranteedMessaging.maxMsgSpoolUsage);    
    managedObjectUseForm.setValue('apiSelectItemIdList', managedObjectFormData.apiSelectItemIdList);
    setInFormCurrentMultiSelectOptionApiSelectItemList(APApiObjectsCommon.transformApiInfoListToSelectItemList(managedObjectFormData.apiInfoList));
    setSelectedApiInfoList(managedObjectFormData.apiInfoList);
    managedObjectUseForm.setValue('environmentSelectItemIdList', managedObjectFormData.environmentSelectItemIdList);
    setInFormCurrentMultiSelectOptionEnvironmentSelectItemList(APEnvironmentObjectsCommon.transformEnvironmentListToSelectItemList(managedObjectFormData.environmentList));
    setSelectedEnvironmentList(managedObjectFormData.apiEnvironmentList);
    setSelectedProtocolList(managedObjectFormData.selectedProtocolList);
  }

  const doSubmitManagedObject = async (managedObject: TManagedObject) => {
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(managedObject);
    else await apiUpdateManagedObject(managedObject);
    props.onLoadingChange(false);
  }

  const isSelectedProtocolListValid = (): boolean => {
    return selectedProtocolList.length > 0;
  }

  const onSubmitManagedObjectForm = (newManagedObjectFormData: TManagedObjectFormData) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    setIsFormSubmitted(true);
    if(!isSelectedProtocolListValid()) return false;
    const _managedObjectFormData: TManagedObjectFormData = {
      ...newManagedObjectFormData,
      attributeList: managedObjectFormData.attributeList,
      selectedProtocolList: selectedProtocolList
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
    return (
      <React.Fragment>        
        <DataTable 
          style={{borderWidth: 'thin'}}
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
          <Column 
            header="API Value(s)" 
            filterField='enum'
            body={apiParameterValueBodyTemplate}
            bodyStyle={{
              overflowWrap: 'break-word',
              wordWrap: 'break-word'
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
    // const funcName = 'renderManagedObjectForm';
    // const logName = `${componentName}.${funcName}()`;
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

  const getEditNotes = (mo: TManagedObject): string => {
    if(mo.apiUsedBy_AppEntityNameList.length === 0) return 'Not used by any Apps.';
    return `Used by ${mo.apiUsedBy_AppEntityNameList.length} Apps.`;
  }
  
  return (
    <div className="manage-api-products">

      {managedObject && props.action === EAction.NEW && 
        <APComponentHeader header='Create API Product:' />
      }

      {managedObject && props.action === EAction.EDIT && 
        <APComponentHeader header={`Edit API Product: ${props.apiProductDisplayName}`} notes={getEditNotes(managedObject)}/>
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
