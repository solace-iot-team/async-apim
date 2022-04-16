
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
  APIParameter,
  ClientOptionsGuaranteedMessaging,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { APConnectorFormValidationRules } from "../../../utils/APConnectorOpenApiFormValidationRules";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { E_CALL_STATE_ACTIONS, TManagedObjectId} from "./deleteme.ManageApiProductsCommon";
import { SelectApis } from "./deleteme.SelectApis";
import { SelectEnvironments } from "./deleteme.SelectEnvironments";
import { APManageApAttributeDisplayList } from "../../../components/APManageAttributes/deleteme.APManageApAttributeDisplayList";
import APAdminPortalApiProductsService, { TAPAdminPortalApiProductDisplay } from "../../utils/deleteme.APAdminPortalApiProductsService";
import APAttributesService, { TAPAttributeDisplay, TAPAttributeDisplayList, TAPConnectorAttribute } from "../../../utils/APAttributes/deleteme.APAttributesService";
import APEnvironmentsService, { TAPEnvironmentDisplay, TAPEnvironmentDisplayList } from "../../../utils/deleteme.APEnvironmentsService";
import APApisService, { TAPApiDisplay, TAPApiDisplayList } from "../../../utils/deleteme.APApisService";
import APEntityIdsService, { TAPEntityIdList } from "../../../utils/APEntityIdsService";
import APProtocolsService, { TAPProtocolDisplayList } from "../../../utils/deleteme.APProtocolsService";

import '../../../components/APComponents.css';
import "./ManageApiProducts.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewApiProductProps {
  action: EAction;
  organizationId: string;
  apiProductId?: string;
  apiProductDisplayName?: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newId: string, newDisplayName: string) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const EditNewApiProduct: React.FC<IEditNewApiProductProps> = (props: IEditNewApiProductProps) => {
  const componentName = 'EditNewApiProduct';

  type TManagedObject = TAPAdminPortalApiProductDisplay;

  type TManagedObjectFormData = TManagedObject & {
    apiSelectEntityIdList: TAPEntityIdList;
    selected_apiIdList: Array<string>;
    environmentSelectEntityIdList: TAPEntityIdList;
    selected_environmentIdList: Array<string>;
    selected_ApProtocolDisplayList: TAPProtocolDisplayList;
    clientOptionsGuaranteedMessaging: ClientOptionsGuaranteedMessaging;
    managedApAttributeDisplayList: TAPAttributeDisplayList;
  }
  
  const ButtonLabelSelectApis = 'Select API(s)';
  const ButtonLabelSelectEnvironments = 'Select Environment(s)';
  const EmptyManagedObject: TManagedObject = APAdminPortalApiProductsService.create_EmptyObject();

  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<TManagedObjectId>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormData, setManagedObjectFormData] = React.useState<TManagedObjectFormData>();
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const [showSelectApis, setShowSelectApis] = React.useState<boolean>(false);
  const [selected_ApApiDisplayList, setSelected_ApApiDisplayList] = React.useState<TAPApiDisplayList>([]);
  const [showSelectEnvironments, setShowSelectEnvironments] = React.useState<boolean>(false);
  const [selected_ApEnvironmentDisplayList, setSelected_ApEnvironmentDisplayList] = React.useState<TAPEnvironmentDisplayList>([]);
  
  const [selected_ApProtocolDisplayList, setSelected_ApProtocolDisplayList] = React.useState<TAPProtocolDisplayList>([]);
  
  // manage ApiParameterAttribute
  const [manageApiParameterAttributesDataTableGlobalFilter, setManageApiParameterAttributesDataTableGlobalFilter] = React.useState<string>();
  const manageApiParameterAttributesDataTableRef = React.useRef<any>(null);
  const [selected_ApisCombinedApiParameterList, setSelected_ApisCombinedApiParameterList] = React.useState<Array<APIParameter>>([]);
  // selected row in table
  const [selected_ApisCombinedApiParameter, setSelected_ApisCombinedApiParameter] = React.useState<APIParameter>();
  const [presetAttributeDisplay, setPresetAttributeDisplay] = React.useState<TAPAttributeDisplay>();
  // inForm: MultiSelect
  const [inFormCurrentMultiSelectOption_ApiSelectItemList, setInFormCurrentMultiSelectOption_ApiSelectItemList] = React.useState<TAPEntityIdList>([]);
  const [inFormCurrentMultiSelectOption_EnvironmentSelectItemList, setInFormCurrentMultiSelectOption_EnvironmentSelectItemList] = React.useState<TAPEntityIdList>([]);
  const managedObjectUseForm = useForm<TManagedObjectFormData>();
  const formId = componentName;
  const[isFormSubmitted, setIsFormSubmitted] = React.useState<boolean>(false);

  const transformManagedObjectToFormData = (mo: TManagedObject): TManagedObjectFormData => {
    // const funcName = 'transformManagedObjectToFormData';
    // const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: managedObject.apiProduct.accessLevel=${managedObject.apiProduct.accessLevel}`);
    const defaultClientOptionsGuaranteedMessaging: ClientOptionsGuaranteedMessaging = {
      requireQueue: false,
      accessType: ClientOptionsGuaranteedMessaging.accessType.EXCLUSIVE,
      maxMsgSpoolUsage: 500,
      maxTtl: 86400
    } 
    let formDataClientOptionsGuaranteedMessaging: ClientOptionsGuaranteedMessaging;
    if(mo.connectorApiProduct.clientOptions && mo.connectorApiProduct.clientOptions.guaranteedMessaging) {
      formDataClientOptionsGuaranteedMessaging = mo.connectorApiProduct.clientOptions.guaranteedMessaging;
    } else {
      formDataClientOptionsGuaranteedMessaging = defaultClientOptionsGuaranteedMessaging;
    }

    const apiSelectEntityIdList: TAPEntityIdList = APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList<TAPApiDisplay>(mo.apApiDisplayList);
    const environmentSelectEntityIdList: TAPEntityIdList = APEntityIdsService.create_EntityIdList_From_ApDisplayObjectList<TAPEnvironmentDisplay>(mo.apEnvironmentDisplayList);
    const fd: TManagedObjectFormData = {
      ...mo,
      apiSelectEntityIdList: apiSelectEntityIdList,
      selected_apiIdList: APEntityIdsService.create_IdList(apiSelectEntityIdList),
      environmentSelectEntityIdList: environmentSelectEntityIdList,
      selected_environmentIdList: APEntityIdsService.create_IdList(environmentSelectEntityIdList),
      selected_ApProtocolDisplayList: APEnvironmentsService.create_ConsolidatedApProtocolDisplayList(mo.apEnvironmentDisplayList),
      clientOptionsGuaranteedMessaging: JSON.parse(JSON.stringify(formDataClientOptionsGuaranteedMessaging)),
      managedApAttributeDisplayList: JSON.parse(JSON.stringify(mo.apAttributeDisplayList)),
    };
    // console.log(`${logName}: fd = ${JSON.stringify(fd, null, 2)}`);
    // alert(`${logName}: check console for fd ...`)
    return fd;
  }

  const transformFormDataToManagedObject = (mofd: TManagedObjectFormData): TManagedObject => {
    // const funcName = 'transformFormDataToManagedObject';
    // const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: mofd = ${JSON.stringify(mofd, null, 2)}`);
    // alert(`${logName}: check console for mofd, apEntityId=${JSON.stringify(mofd.apEntityId, null, 2)} ...`)
    let mo: TManagedObject = {
      ...mofd,
      connectorApiProduct: {
        ...mofd.connectorApiProduct,
        name: mofd.apEntityId.id,
        displayName: mofd.apEntityId.displayName,
        apis: APEntityIdsService.create_IdList_From_ApDisplayObjectList<TAPApiDisplay>(selected_ApApiDisplayList),        
        attributes: APAttributesService.create_ConnectorAttributeList_From_ApAttributeDisplayList(mofd.managedApAttributeDisplayList),
        environments: APEntityIdsService.create_IdList_From_ApDisplayObjectList<TAPEnvironmentDisplay>(selected_ApEnvironmentDisplayList),
        pubResources: [],
        subResources: [],
        protocols: APProtocolsService.create_ConnectorProtocols_From_ApProtocolDisplayList(mofd.selected_ApProtocolDisplayList),
        clientOptions: {
          guaranteedMessaging: mofd.clientOptionsGuaranteedMessaging
        }
      },
    };
    // console.log(`${logName}: mo = ${JSON.stringify(mo, null, 2)}`);
    // alert(`${logName}: check console for mo ...`)
    return mo;
  }

  // * Api Calls *
  const apiGetManagedObject = async(managedObjectId: TManagedObjectId, managedObjectDisplayName: string): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_PRODUCT, `retrieve details for api product: ${managedObjectDisplayName}`);
    try {
      const object: TAPAdminPortalApiProductDisplay = await APAdminPortalApiProductsService.getAdminPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apiProductId: managedObjectId
      });
      setManagedObject(object);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_API_PRODUCT, `create api product: ${mo.apEntityId.displayName}`);
    try { 
      await APAdminPortalApiProductsService.createAdminPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apAdminPortalApiProductDisplay: mo
      })
      setCreatedManagedObjectId(mo.apEntityId.id);
      setCreatedManagedObjectDisplayName(mo.apEntityId.displayName);      
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiUpdateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiUpdateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_UPDATE_API_PRODUCT, `update api product: ${mo.apEntityId.displayName}`);
    // alert(`${logName}: managedObject.apiProduct.accessLevel = ${managedObject.apiProduct.accessLevel}`);
    try { 
      await APAdminPortalApiProductsService.updateAdminPortalApApiProductDisplay({
        organizationId: props.organizationId,
        apAdminPortalApiProductDisplay: mo
      });
      setUpdatedManagedObjectDisplayName(mo.apEntityId.displayName);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetSelectedApEnvironmentDisplayList = async(envIdList: Array<string>): Promise<TApiCallState> => {
    const funcName = 'apiGetSelectedApEnvironmentDisplayList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ENVIRONMENT_LIST, `retrieve selected environment list`);
    try {
      const apEnvDisplayList: TAPEnvironmentDisplayList = await APEnvironmentsService.listApEnvironmentDisplayForEnvIdList({
        organizationId: props.organizationId,
        envIdList: envIdList
      });
      setSelected_ApEnvironmentDisplayList(apEnvDisplayList);
      setSelected_ApProtocolDisplayList(APEnvironmentsService.create_ConsolidatedApProtocolDisplayList(apEnvDisplayList));
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;  
  }

  const apiGetSelectedApApiDisplayList = async(apiIdList: Array<string>): Promise<TApiCallState> => {
    const funcName = 'apiGetSelectedApApiDisplayList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_API_INFO_LIST, `retrieve selected api info list`);
    try {
      const apApiDisplayList: TAPApiDisplayList = await APApisService.listApApiDisplayForApiIdList({
        organizationId: props.organizationId,
        apiIdList: apiIdList
      });
      setSelected_ApApiDisplayList(apApiDisplayList);
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
      setManagedObject(EmptyManagedObject);
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
    setSelected_ApisCombinedApiParameterList(APApisService.create_CombinedApiParameterList(selected_ApApiDisplayList));
  }, [selected_ApApiDisplayList]);
  
  React.useEffect(() => {
    if(selected_ApisCombinedApiParameter) {
      const connectorAttribute: TAPConnectorAttribute = {
        name: selected_ApisCombinedApiParameter.name,
        value: selected_ApisCombinedApiParameter.enum ? selected_ApisCombinedApiParameter.enum.join(',') : ''
      };
      setPresetAttributeDisplay(APAttributesService.create_ApAttributeDisplay_From_ConnnectorAttribute(connectorAttribute));
    }
  }, [selected_ApisCombinedApiParameter]);
  
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

  const onManagedObjectFormSelectApisSuccess = (apiCallState: TApiCallState, modifiedSelectedApiEntityIdList: TAPEntityIdList) => {
    const funcName = 'onManagedObjectFormSelectApisSuccess';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: modifiedSelectedApiEntityList=${JSON.stringify(modifiedSelectedApiEntityList, null, 2)}`);
    if(!apiCallState.success) throw new Error(`${logName}: apiCallState.success is false, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);
    setInFormCurrentMultiSelectOption_ApiSelectItemList(modifiedSelectedApiEntityIdList);
    const modifiedIdList: Array<string> = APEntityIdsService.create_IdList(modifiedSelectedApiEntityIdList);
    managedObjectUseForm.setValue('selected_apiIdList', modifiedIdList);
    managedObjectUseForm.trigger('selected_apiIdList');
    setShowSelectApis(false);
    onApisSelect(modifiedIdList);
  }

  const onManagedObjectFormSelectApisCancel = () => {
    setShowSelectApis(false);
  }

  const doUpdateSelectedApApiDisplayList = async(apiIdList: Array<string>) => {
    await apiGetSelectedApApiDisplayList(apiIdList);
  }

  const onApisSelect = (apiIdList: Array<string>) => {
    doUpdateSelectedApApiDisplayList(apiIdList);
  }

  // * Search + Select Environments & Protocols *
  const onSearchEnvironments = () => {
    setShowSelectEnvironments(true);
  }

  const onManagedObjectFormSelectEnvironmentsSuccess = (apiCallState: TApiCallState, modifiedSelectedEnvEntityIdList: TAPEntityIdList) => {
    const funcName = 'onManagedObjectFormSelectEnvironmentsSuccess';
    const logName = `${componentName}.${funcName}()`;
    // console.log(`${logName}: modifiedSelectedApiEntityList=${JSON.stringify(modifiedSelectedApiEntityList, null, 2)}`);
    if(!apiCallState.success) throw new Error(`${logName}: apiCallState.success is false, apiCallState=${JSON.stringify(apiCallState, null, 2)}`);

    setInFormCurrentMultiSelectOption_EnvironmentSelectItemList(modifiedSelectedEnvEntityIdList);

    const modifiedIdList: Array<string> = APEntityIdsService.create_IdList(modifiedSelectedEnvEntityIdList);
    managedObjectUseForm.setValue('selected_environmentIdList', modifiedIdList);
    managedObjectUseForm.trigger('selected_environmentIdList');

    setShowSelectEnvironments(false);
    onEnvironmentsSelect(modifiedIdList);
  }

  const onManagedObjectFormSelectEnvironmentsCancel = () => {
    setShowSelectEnvironments(false);
  }

  const doUpdateAvailableProtocolList = async(envIdList: Array<string>) => {
    await apiGetSelectedApEnvironmentDisplayList(envIdList);
    // await apiGetSelectedEnvironmentList(envIdList);
  }
  const onEnvironmentsSelect = (envIdList: Array<string>) => {
    doUpdateAvailableProtocolList(envIdList);
  }

  // * Attributes *
  const onAttributeListUpdate = (newApAttributeDisplayList: TAPAttributeDisplayList) => {
    const funcName = 'onAttributeListUpdate';
    const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: newApAttributeDisplayList=${JSON.stringify(newApAttributeDisplayList, null, 2)}`);

    // must not change FormData field that is used in form ==> would update values in form
    // instead: update separate field

    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    managedObjectFormData.managedApAttributeDisplayList = newApAttributeDisplayList;
  }

  // * Form *
  const doPopulateManagedObjectFormDataValues = (mofd: TManagedObjectFormData) => {
    // const funcName = 'doPopulateManagedObjectFormDataValues';
    // const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: mofd.apEntityId=${JSON.stringify(mofd.apEntityId, null, 2)}`);

    managedObjectUseForm.setValue('apEntityId', mofd.apEntityId);
    managedObjectUseForm.setValue('connectorApiProduct.description', mofd.connectorApiProduct.description);
    managedObjectUseForm.setValue('connectorApiProduct.approvalType', mofd.connectorApiProduct.approvalType);
    managedObjectUseForm.setValue('connectorApiProduct.accessLevel', mofd.connectorApiProduct.accessLevel);
    // client options: guaranteed messaging
    managedObjectUseForm.setValue('clientOptionsGuaranteedMessaging.requireQueue', mofd.clientOptionsGuaranteedMessaging.requireQueue);    
    managedObjectUseForm.setValue('clientOptionsGuaranteedMessaging.accessType', mofd.clientOptionsGuaranteedMessaging.accessType);    
    managedObjectUseForm.setValue('clientOptionsGuaranteedMessaging.maxTtl', mofd.clientOptionsGuaranteedMessaging.maxTtl);    
    managedObjectUseForm.setValue('clientOptionsGuaranteedMessaging.maxMsgSpoolUsage', mofd.clientOptionsGuaranteedMessaging.maxMsgSpoolUsage);
    // apis
    managedObjectUseForm.setValue('selected_apiIdList', mofd.selected_apiIdList);
    setInFormCurrentMultiSelectOption_ApiSelectItemList(mofd.apiSelectEntityIdList);
    setSelected_ApApiDisplayList(mofd.apApiDisplayList);
    // environments
    managedObjectUseForm.setValue('selected_environmentIdList', mofd.selected_environmentIdList);
    setInFormCurrentMultiSelectOption_EnvironmentSelectItemList(mofd.environmentSelectEntityIdList);
    setSelected_ApEnvironmentDisplayList(mofd.apEnvironmentDisplayList);
    // protocols
    setSelected_ApProtocolDisplayList(mofd.selected_ApProtocolDisplayList);
  }

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(mo);
    else await apiUpdateManagedObject(mo);
    props.onLoadingChange(false);
  }

  const isSelectedProtocolListValid = (): boolean => {
    return selected_ApProtocolDisplayList.length > 0;
  }

  const onSubmitManagedObjectForm = (newMofd: TManagedObjectFormData) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    setIsFormSubmitted(true);
    if(!isSelectedProtocolListValid()) return false;
    const mofd: TManagedObjectFormData = {
      ...newMofd,
      managedApAttributeDisplayList: managedObjectFormData.managedApAttributeDisplayList,
      selected_ApProtocolDisplayList: selected_ApProtocolDisplayList,
    }
    doSubmitManagedObject(transformFormDataToManagedObject(mofd));
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
    if(selected_ApEnvironmentDisplayList.length === 0) return (<></>);
    const exposedProtocolList: TAPProtocolDisplayList = APEnvironmentsService.create_ConsolidatedApProtocolDisplayList(selected_ApEnvironmentDisplayList);
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
            value={exposedProtocolList}
            // autoLayout={true}
            selection={selected_ApProtocolDisplayList}
            onSelectionChange={(e) => setSelected_ApProtocolDisplayList(e.value)}
            // sorting
            sortMode='single'
            sortField="connectorProtocol.name"
            sortOrder={1}          
            dataKey="apEntityId.id"
          >
            <Column selectionMode="multiple" style={{width:'3em'}} />
            <Column field="connectorProtocol.name" header="Protocol" style={{width: '20em'}} />
            <Column field="connectorProtocol.version" header="Version" />
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
          value={selected_ApisCombinedApiParameterList}
          emptyMessage='No API Parameters available.'
          globalFilter={manageApiParameterAttributesDataTableGlobalFilter}
          autoLayout={false}
          selectionMode="single"
          // onRowClick={onManagedObjectSelect}
          // onRowDoubleClick={(e) => onManagedObjectOpen(e)}
          selection={selected_ApisCombinedApiParameter}
          onSelectionChange={(e) => setSelected_ApisCombinedApiParameter(e.value)}
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
    const apAttributeDisplayList = managedObjectFormData.apAttributeDisplayList;
    return (  
      <React.Fragment>
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable={true}
          collapsed={apAttributeDisplayList.length === 0}
        >
          <React.Fragment>
            {renderManageApiParameterAttributes()}
            <div className='p-mb-6'/>
            <APManageApAttributeDisplayList
              formId={componentName+'_APManageAttributes'}
              presetApAttributeDisplay={presetAttributeDisplay}
              apAttributeDisplayList={apAttributeDisplayList}
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
                        options={APAdminPortalApiProductsService.create_SelectList_From_QueueAccessType()} 
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
                  name="apEntityId.id"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.CommonName()}
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
                <label htmlFor="apEntityId.id" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apEntityId?.id })}>Id*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apEntityId?.id)}
            </div>
            {/* Display Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="apEntityId.displayName"
                  control={managedObjectUseForm.control}
                  rules={APConnectorFormValidationRules.CommonDisplayName()}
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
                <label htmlFor="apEntityId.displayName" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apEntityId?.displayName })}>Display Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.apEntityId?.displayName)}
            </div>
            {/* description */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="connectorApiProduct.description"
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
                <label htmlFor="connectorApiProduct.description" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorApiProduct?.description })}>Description*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorApiProduct?.description)}
            </div>
            {/* approvalType */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="connectorApiProduct.approvalType"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select approval type.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={APAdminPortalApiProductsService.create_SelectList_From_ApprovalType()} 
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                      )}}
                />
                <label htmlFor="connectorApiProduct.approvalType" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorApiProduct?.approvalType })}>Approval Type*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorApiProduct?.approvalType)}
            </div>
            {/* accessLevel */}
            {/* <div className="p-m-6">TODO: change access level to attribute - filter all reserved attribute names</div> */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="connectorApiProduct.accessLevel"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Select access level.",
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={APAdminPortalApiProductsService.create_SelectList_From_AccessLevel()} 
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />                        
                      )}}
                />
                <label htmlFor="connectorApiProduct.accessLevel" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.connectorApiProduct?.accessLevel })}>Access Level*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.connectorApiProduct?.accessLevel)}
            </div>
            {/* apis */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="selected_apiIdList"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 API."
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={inFormCurrentMultiSelectOption_ApiSelectItemList} 
                          onChange={(e) => { field.onChange(e.value); onApisSelect(e.value); }}
                          optionLabel="displayName"
                          optionValue="id"
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="selected_apiIdList" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.selected_apiIdList })}>API(s)*</label>
              </span>
              { displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.selected_apiIdList) }
              { renderApisToolbar() }
            </div>
            {/* environments */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="selected_environmentIdList"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Choose at least 1 Environment."
                  }}
                  render={( { field, fieldState }) => {
                      return(
                        <MultiSelect
                          display="chip"
                          value={field.value ? [...field.value] : []} 
                          options={inFormCurrentMultiSelectOption_EnvironmentSelectItemList} 
                          onChange={(e) => { field.onChange(e.value); onEnvironmentsSelect(e.value); }}
                          optionLabel="displayName"
                          optionValue="id"
                          // style={{width: '500px'}} 
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                <label htmlFor="selected_environmentIdList" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.selected_environmentIdList })}>Environment(s)*</label>
              </span>
              { displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.selected_environmentIdList) }
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
    if(mo.apAppReferenceEntityIdList.length === 0) return 'Not used by any Apps.';
    return `Used by ${mo.apAppReferenceEntityIdList.length} Apps.`;
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
          currentSelectedApiEntityIdList={inFormCurrentMultiSelectOption_ApiSelectItemList}
          onSave={onManagedObjectFormSelectApisSuccess}
          onError={props.onError}          
          onCancel={onManagedObjectFormSelectApisCancel}
          onLoadingChange={props.onLoadingChange}
        />
      } 

      {showSelectEnvironments &&
        <SelectEnvironments
          organizationId={props.organizationId}
          currentSelectedEnvironmentEntityIdList={inFormCurrentMultiSelectOption_EnvironmentSelectItemList}
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
