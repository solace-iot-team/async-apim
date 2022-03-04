
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { Password } from "primereact/password";
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { MenuItem } from "primereact/api";
import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";

import { 
  APSOrganizationRolesResponseList,
  APSSystemAuthRoleList,
} from "../../../_generated/@solace-iot-team/apim-server-openapi-browser";

import { APComponentHeader } from "../../../components/APComponentHeader/APComponentHeader";
import { APOrganizationsService } from "../../../utils/APOrganizationsService";
import { ApiCallState, TApiCallState } from "../../../utils/ApiCallState";
import { APSClientOpenApi } from "../../../utils/APSClientOpenApi";
import { APSOpenApiFormValidationRules } from "../../../utils/APSOpenApiFormValidationRules";
import { EAPSCombinedAuthRole } from "../../../utils/APRbac";
import { APClientConnectorOpenApi } from "../../../utils/APClientConnectorOpenApi";
import { ApiCallStatusError } from "../../../components/ApiCallStatusError/ApiCallStatusError";
import { E_CALL_STATE_ACTIONS } from "./ManageUsersCommon";
import { APManageUserOrganizations } from "../../../components/APManageUserMemberOf/APManageUserOrganizations";
import APUsersDisplayService, { 
  TAPMemberOfBusinessGroupDisplayList, 
  TAPMemberOfOrganizationGroupsDisplayList, 
  TAPUserDisplay 
} from "../../../displayServices/old.APUsersDisplayService";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../../utils/APEntityIdsService";
import APRbacDisplayService from "../../../displayServices/APRbacDisplayService";
import { APManageUserMemberOfBusinessGroups } from "../../../components/APManageUserMemberOf/APManageUserMemberOfBusinessGroups";
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplayList } from "../../../displayServices/APBusinessGroupsDisplayService";

import '../../../components/APComponents.css';
import "./ManageUsers.css";

export enum EAction {
  EDIT = 'EDIT',
  NEW = 'NEW'
}
export interface IEditNewUserProps {
  action: EAction,
  userEntityId?: TAPEntityId;
  organizationId?: string;
  onError: (apiCallState: TApiCallState) => void;
  onNewSuccess: (apiCallState: TApiCallState, newUserEntityId: TAPEntityId) => void;
  onEditSuccess: (apiCallState: TApiCallState, updatedDisplayName?: string) => void;
  onCancel: () => void;
  onLoadingChange: (isLoading: boolean) => void;
  setBreadCrumbItemList: (itemList: Array<MenuItem>) => void;
}

export const EditNewUser: React.FC<IEditNewUserProps> = (props: IEditNewUserProps) => {
  const componentName = 'EditNewUser';

  type TManagedObject = TAPUserDisplay;
  // type TManagedObjectFormData = TManagedObject & {
  //   formSystemRoleList: APSSystemAuthRoleList;
  // };
  type TManagedObjectFormData = {
    email: string;
    first: string;
    last: string;
    password: string;
    systemRoleIdList: APSSystemAuthRoleList;
    isActivated: boolean;
  };
  type TManagedObjectFormDataEnvelope = {
    formData: TManagedObjectFormData;
  }
  type TExternalManagedBusinessGroupsFormData = TAPMemberOfOrganizationGroupsDisplayList;

  // type TReplaceApiObject = APSUserReplace;
  // type TCreateApiObject = APSUser;
  // type TGetApiObject = APSUserResponse;
  // type TManagedObject = APSUserResponse;
  // type TManagedObjectFormData = APSUserResponse;
  type TExternalManagedObjectFormData = {
    memberOfOrganizations: APSOrganizationRolesResponseList | undefined;
  }
  type TExternalManagedObjectTriggerFormValidationFunc = () => void;
  type TRoleSelectItem = { label: string, value: EAPSCombinedAuthRole };
  // type TManagedObjectFormDataRoleSelectItems = Array<TRoleSelectItem>;


  // const [configContext] = React.useContext(ConfigContext);

  // const transformGetApiObjectToManagedObject = (getApiObject: TGetApiObject): TManagedObject => {
  //   return getApiObject;
  // }

  // const transformManagedObjectToReplaceApiObject = (mo: TManagedObject): TReplaceApiObject => {
  //   return {
  //     isActivated: mo.isActivated,
  //     password: mo.password,
  //     profile: mo.profile,
  //     memberOfOrganizations: ManageUsersCommon.transformAPSOrganizationRolesResponseListToAPSOrganizationRolesList(mo.memberOfOrganizations),
  //     systemRoles: mo.systemRoles,
  //   }
  // }

  // const transformManagedObjectToCreateApiObject = (mo: TManagedObject): TCreateApiObject => {
  //   return {
  //     userId: mo.userId,
  //     isActivated: mo.isActivated,
  //     password: mo.password,
  //     profile: mo.profile,
  //     memberOfOrganizations: ManageUsersCommon.transformAPSOrganizationRolesResponseListToAPSOrganizationRolesList(mo.memberOfOrganizations),
  //     systemRoles: mo.systemRoles,
  //   }
  // }

  // const createManagedObjectFormDataSystemRoleSelectItems = (): TManagedObjectFormDataRoleSelectItems => {
  //   const rbacScopeList: Array<EAPRbacRoleScope> = [EAPRbacRoleScope.SYSTEM];
  //   const rbacRoleList: TAPRbacRoleList = ConfigHelper.getSortedAndScopedRbacRoleList(configContext, rbacScopeList);
  //   const selectItems: TManagedObjectFormDataRoleSelectItems = [];
  //   rbacRoleList.forEach( (rbacRole: TAPRbacRole) => {
  //     selectItems.push({
  //       label: rbacRole.displayName,
  //       value: rbacRole.id
  //     });
  //   });
  //   return selectItems; 
  // }

  const transform_ManagedObject_To_FormDataEnvelope = (mo: TManagedObject): TManagedObjectFormDataEnvelope => {
    const fd: TManagedObjectFormData = {
        email: mo.apsUserResponse.profile.email,
        first: mo.apsUserResponse.profile.first,
        last: mo.apsUserResponse.profile.last,
        password: mo.apsUserResponse.password,
        isActivated: mo.apsUserResponse.isActivated,
        systemRoleIdList: APEntityIdsService.create_IdList(mo.apSystemRoleEntityIdList) as APSSystemAuthRoleList
    };
    return {
      formData: fd
    };
  }

  const transform_ManagedObject_To_ExternalFormData = (mo: TManagedObject): TExternalManagedObjectFormData => {
    const efd: TExternalManagedObjectFormData = {
      memberOfOrganizations: mo.apsUserResponse.memberOfOrganizations
    }
    return efd;
  }

  const transform_ManagedObject_To_ExternalBusinessGroupsFormData = (mo: TManagedObject): TExternalManagedBusinessGroupsFormData => {
    return [...mo.apMemberOfOrganizationGroupsDisplayList];
  }

  const create_ManagedObject_From_FormEntities = ({orginalManagedObject, formDataEnvelope, externalManagedBusinessGroupsFormData, externalFormData}: {
    orginalManagedObject: TManagedObject;
    formDataEnvelope: TManagedObjectFormDataEnvelope;
    externalManagedBusinessGroupsFormData: TExternalManagedBusinessGroupsFormData;
    externalFormData: TExternalManagedObjectFormData;
  }): TManagedObject => {

    const funcName = 'create_ManagedObject_From_FormEntities';
    const logName = `${componentName}.${funcName}()`;

    // alert(`${logName}: formData.apSystemRoleEntityIdList = ${JSON.stringify(formData.apSystemRoleEntityIdList, null, 2)}`);
    // alert(`${logName}: formData.formSystemRoleList = ${JSON.stringify(formData.formSystemRoleList, null, 2)}`);
    console.log(`${logName}: receiving formData = ${JSON.stringify(formDataEnvelope.formData, null, 2)}`);

    const mo: TManagedObject = orginalManagedObject;
    const fd: TManagedObjectFormData = formDataEnvelope.formData;
    mo.apSystemRoleEntityIdList = APEntityIdsService.create_EntityIdList_FilteredBy_IdList({ 
      apEntityIdList: mo.apSystemRoleEntityIdList,
      idList: fd.systemRoleIdList
    });
    mo.apMemberOfOrganizationGroupsDisplayList = externalManagedBusinessGroupsFormData;
    mo.apsUserResponse = {
      ...orginalManagedObject.apsUserResponse,
      memberOfOrganizations: externalFormData.memberOfOrganizations ? externalFormData.memberOfOrganizations : []
    };
    mo.apsUserResponse.profile = {
      email: fd.email,
      first: fd.first,
      last: fd.last
    }
    mo.apEntityId = {
      id: fd.email,
      displayName: APUsersDisplayService.create_UserDisplayName(mo.apsUserResponse.profile)
    }
    mo.apsUserResponse.userId = fd.email;
    mo.apsUserResponse.password = fd.password;
    if(props.action === EAction.NEW && props.organizationId !== undefined) {
      mo.apsUserResponse.isActivated = true;
    }
    return mo;
  }
  // const transformFormDataToManagedObject = (formData: TManagedObjectFormData, externalFormData: TExternalManagedObjectFormData): TManagedObject => {
  //   const mo: TManagedObject = {
  //     ...formData,
  //     userId: formData.profile.email,
  //     memberOfOrganizations: externalFormData.memberOfOrganizations
  //   }
  //   if(props.action === EAction.NEW && props.organizationId !== undefined) {
  //     mo.isActivated = true;
  //   }
  //   return mo;
  // }

  // const createEmptyManagedObject = (): TManagedObject => {
  //   const emptyManagedObject: TManagedObject = {
  //     userId: '',
  //     isActivated: false,
  //     password: '',
  //     profile: {
  //       first: '',
  //       last: '',
  //       email: ''
  //     },
  //     systemRoles: [],
  //     memberOfOrganizations: []
  //   }
  //   if(props.action === EAction.NEW) {
  //     if(props.organizationId !== undefined) {
  //       emptyManagedObject.memberOfOrganizations = [
  //         {
  //           organizationId: props.organizationId,
  //           organizationDisplayName: '',
  //           roles: []
  //         }
  //       ];
  //     }
  //   }
  //   return emptyManagedObject;
  // }
  
  let exterrnalManagedObjectTriggerFormValidationFunc: TExternalManagedObjectTriggerFormValidationFunc = () => void {};
  let exterrnalManaged_UserMemberOfBusinessGroups_TriggerFormValidationFunc: TExternalManagedObjectTriggerFormValidationFunc = () => void {};
  // const systemRolesSelectItemList = createManagedObjectFormDataSystemRoleSelectItems();
  
  const [createdManagedObjectId, setCreatedManagedObjectId] = React.useState<string>();
  const [createdManagedObjectDisplayName, setCreatedManagedObjectDisplayName] = React.useState<string>();
  const [updatedManagedObjectDisplayName, setUpdatedManagedObjectDisplayName] = React.useState<string>();
  const [managedObject, setManagedObject] = React.useState<TManagedObject>();  
  const [managedObjectFormDataEnvelope, setManagedObjectFormDataEnvelope] = React.useState<TManagedObjectFormDataEnvelope>();
  const [externalManagedObjectFormData, setExternalManagedObjectFormData] = React.useState<TExternalManagedObjectFormData>();
  const [externalManagedBusinessGroupsFormData, setExternalManagedBusinessGroupsFormData] = React.useState<TExternalManagedBusinessGroupsFormData>();
  const [availableOrganizationEntityIdList, setAvailableOrganizationEntityIdList] = React.useState<TAPEntityIdList>([]);
  const [currentOrganizationEntityId, setCurrentOrganizationEntityId] = React.useState<TAPEntityId>();
  const [completeOrganizationApBusinessGroupDisplayList, setCompleteOrganizationApBusinessGroupDisplayList] = React.useState<TAPBusinessGroupDisplayList>([]);
  const [apiCallStatus, setApiCallStatus] = React.useState<TApiCallState | null>(null);
  const managedObjectUseForm = useForm<TManagedObjectFormDataEnvelope>();
  const formId = componentName;

  // * Api Calls *
  const apiGetManagedObject = async(userEntityId: TAPEntityId): Promise<TApiCallState> => {
    const funcName = 'apiGetManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_USER, `retrieve details for user: ${userEntityId.displayName}`);
    try { 
      const object: TAPUserDisplay = await APUsersDisplayService.apsGet_ApUserDisplay({
        userId: userEntityId.id
      });
      setManagedObject(object);
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiReplaceManagedObject = async(moId: string, mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiReplaceManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_REPLACE_USER, `update user: ${moId}`);
    try { 
      await APUsersDisplayService.deprecated_apsReplace_ApUserDisplay({
        userId: moId,
        apUserDisplay: mo
      });
      setUpdatedManagedObjectDisplayName(mo.apEntityId.displayName);
      // await ApsUsersService.replaceApsUser({
      //   userId: managedObjectId, 
      //   requestBody: transformManagedObjectToReplaceApiObject(managedObject)
      // });
      // setUpdatedManagedObjectDisplayName(managedObject.userId);      
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiCreateManagedObject = async(mo: TManagedObject): Promise<TApiCallState> => {
    const funcName = 'apiCreateManagedObject';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_CREATE_USER, `create user: ${mo.apEntityId.id}`);

    // console.log(`${logName}: mo = ${JSON.stringify(mo, null, 2)}`);
    // alert(`${logName}: check console for managedObject to create....`);
    // return callState;

    try { 
      await APUsersDisplayService.apsCreate_ApUserDisplay({
        apUserDisplay: mo
      });
      setCreatedManagedObjectId(mo.apEntityId.id);
      setCreatedManagedObjectDisplayName(mo.apEntityId.displayName);      
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetAvailableOrganizations = async(): Promise<TApiCallState> => {
    const funcName = 'apiGetAvailableOrganizations';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_AVAILABE_ORGANIZATIONS, 'retrieve list of organizations');
    try { 
      const organizationEntityIdList: TAPEntityIdList = await APOrganizationsService.listOrganizationEntityIdList();
      setAvailableOrganizationEntityIdList(organizationEntityIdList);
      // if(!configContext.connector) {
      //   setAvailableOrganizationList([]);  
      //   // TODO: create user message or warning to pop up and render in page
      //   throw new Error('cannot get list of organizations (no active connector config)');
      // } else {
      //   const apOrganizationList: TAPOrganizationList = await APOrganizationsService.listOrganizations({});
      //   setAvailableOrganizationList(APOrganizationsService.sortAPOrganizationList_byDisplayName(apOrganizationList));
      // }
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetOrganization = async(organizationId: string): Promise<TApiCallState> => {
    const funcName = 'apiGetOrganization';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_ORGANIZATION, `retrieve organization: ${props.organizationId}`);
    try {
      const organzationEntityId: TAPEntityId = await APOrganizationsService.getOrganizationEntityId(organizationId);
      setAvailableOrganizationEntityIdList([organzationEntityId]);
      setCurrentOrganizationEntityId(organzationEntityId);

      // const apOrganization: TAPOrganization = await APOrganizationsService.getOrganization(organizationId);
      // setAvailableOrganizationList([apOrganization]);
      // setCurrentOrganization(apOrganization);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const apiGetAllApBusinessGroupDisplayList = async(organizationId: string): Promise<TApiCallState> => {
    const funcName = 'apiGetAllApBusinessGroupDisplayList';
    const logName = `${componentName}.${funcName}()`;
    let callState: TApiCallState = ApiCallState.getInitialCallState(E_CALL_STATE_ACTIONS.API_GET_BUSINESS_GROUP_LIST, 'retrieve list of business groups');
    try {
      const list: TAPBusinessGroupDisplayList = await APBusinessGroupsDisplayService.apsGetList_ApBusinessGroupSystemDisplayList({
        organizationId: organizationId
      });
      setCompleteOrganizationApBusinessGroupDisplayList(list);
    } catch(e: any) {
      APClientConnectorOpenApi.logError(logName, e);
      callState = ApiCallState.addErrorToApiCallState(e, callState);
    }
    setApiCallStatus(callState);
    return callState;
  }

  const doInitialize = async () => {
    const funcName = 'doInitialize';
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(!props.organizationId) await apiGetAvailableOrganizations();
    else {
      await apiGetOrganization(props.organizationId);
      await apiGetAllApBusinessGroupDisplayList(props.organizationId);
    }
    if(props.action === EAction.EDIT) {
      if(props.userEntityId === undefined) throw new Error(`${logName}: props.userEntityId === undefined`);
      await apiGetManagedObject(props.userEntityId);
    } else {
      setManagedObject(await APUsersDisplayService.create_EmptyObject({ organizationId: props.organizationId }));
    }
    props.onLoadingChange(false);
  }

  // * useEffect Hooks *

  React.useEffect(() => {
    props.setBreadCrumbItemList([{
      label: (props.action === EAction.EDIT ? 'Edit' : 'Create New User')
    }]);
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObject) {
      setManagedObjectFormDataEnvelope(transform_ManagedObject_To_FormDataEnvelope(managedObject));
      setExternalManagedObjectFormData(transform_ManagedObject_To_ExternalFormData(managedObject));
      setExternalManagedBusinessGroupsFormData(transform_ManagedObject_To_ExternalBusinessGroupsFormData(managedObject));
    }
  }, [managedObject]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedObjectFormDataEnvelope) managedObjectUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);
    // doPopulateManagedObjectFormDataValues(managedObjectFormDataEnvelope);
  }, [managedObjectFormDataEnvelope]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    const funcName = 'useEffect[apiCallStatus]';
    const logName = `${componentName}.${funcName}()`;
    if (apiCallStatus !== null) {
      if(!apiCallStatus.success) props.onError(apiCallStatus);
      else if(props.action === EAction.NEW && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_CREATE_USER) {
        if(!createdManagedObjectId) throw new Error(`${logName}: createdManagedObjectId is undefined`);
        if(!createdManagedObjectDisplayName) throw new Error(`${logName}: createdManagedObjectDisplayName is undefined`);
        props.onNewSuccess(apiCallStatus, { id: createdManagedObjectId, displayName: createdManagedObjectDisplayName });
      }  
      else if(props.action === EAction.EDIT && apiCallStatus.context.action === E_CALL_STATE_ACTIONS.API_REPLACE_USER) {
        props.onEditSuccess(apiCallStatus, updatedManagedObjectDisplayName);
      }
    }
  }, [apiCallStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onOrganizationRolesListUpdate = (updatedMemberOfOrganizations: APSOrganizationRolesResponseList) => {
    const funcName = 'onOrganizationRolesListUpdate';
    const logName = `${componentName}.${funcName}()`;
    // alert(`${logName}: updatedMemberOfOrganizations=${JSON.stringify(updatedMemberOfOrganizations, null, 2)}`);
    if(!externalManagedObjectFormData) throw new Error(`${logName}: externalManagedObjectFormData is undefined`);
    const _efd: TExternalManagedObjectFormData = {
      memberOfOrganizations: updatedMemberOfOrganizations
    }
    setExternalManagedObjectFormData(_efd);
  }

  const register_APManageUserOrganizations_FormValidation_Func = (triggerFormValidationFunc: TExternalManagedObjectTriggerFormValidationFunc) => {
    exterrnalManagedObjectTriggerFormValidationFunc = triggerFormValidationFunc;
  }


  const onMemberOfBusinessGroupsUpdate = (updatedApMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList) => {
    const funcName = 'onMemberOfBusinessGroupsUpdate';
    const logName = `${componentName}.${funcName}()`;
    if(externalManagedBusinessGroupsFormData === undefined) throw new Error(`${logName}: externalManagedBusinessGroupsFormData === undefined`);
    setExternalManagedBusinessGroupsFormData(updatedApMemberOfOrganizationGroupsDisplayList);
  }

  const register_APManageUserMemberOfBusinessGroups_FormValidation_Func = (triggerFormValidationFunc: TExternalManagedObjectTriggerFormValidationFunc) => {
    exterrnalManaged_UserMemberOfBusinessGroups_TriggerFormValidationFunc = triggerFormValidationFunc;
  }



  // const doPopulateManagedObjectFormDataValues = (mofde: TManagedObjectFormDataEnvelope) => {
  //   managedObjectUseForm.setValue('formData', mofde.formData);
  // }

  const doSubmitManagedObject = async (mo: TManagedObject) => {
    const funcName = 'doSubmitManagedObject';
    const logName = `${componentName}.${funcName}()`;
    props.onLoadingChange(true);
    if(props.action === EAction.NEW) await apiCreateManagedObject(mo);
    else {
      if(props.userEntityId === undefined) throw new Error(`${logName}: props.userEntityId === undefined`);
      await apiReplaceManagedObject(props.userEntityId.id, mo);
    }
    props.onLoadingChange(false);
  }

  const isMemberOfOrganizationsValid = (memberOfOrganizations: APSOrganizationRolesResponseList | undefined): boolean => {
    // alert(`isMemberOfOrganizationsValid: validating ...`)
    exterrnalManagedObjectTriggerFormValidationFunc();
    if(!memberOfOrganizations) return false;
    for(const apsOrganizationRoles of memberOfOrganizations) {
      if(apsOrganizationRoles.roles.length === 0) return false;
    }
    // alert(`isMemberOfOrganizationsValid: it is valid`)
    return true;
  }
  const isMemberOfBusinessGroupsValid = (apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList | undefined): boolean => {
    const funcName = 'isMemberOfBusinessGroupsValid';
    const logName = `${componentName}.${funcName}()`;
    exterrnalManaged_UserMemberOfBusinessGroups_TriggerFormValidationFunc();
    // do more validation here
    if(apMemberOfOrganizationGroupsDisplayList === undefined) return false;
    for(const apMemberOfOrganizationGroupsDisplay of apMemberOfOrganizationGroupsDisplayList) {
      if(apMemberOfOrganizationGroupsDisplay.apMemberOfBusinessGroupDisplayList.length === 0) return false;
      for(const apMemberOfBusinessGroupDisplay of apMemberOfOrganizationGroupsDisplay.apMemberOfBusinessGroupDisplayList) {
        if(apMemberOfBusinessGroupDisplay.apConfiguredBusinessGroupRoleEntityIdList.length === 0) return false;
      }
    }
    return true;
  }
  const onSubmitManagedObjectForm = (newMofde: TManagedObjectFormDataEnvelope) => {
    const funcName = 'onSubmitManagedObjectForm';
    const logName = `${componentName}.${funcName}()`;
    if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);
    // if(!managedObjectFormData) throw new Error(`${logName}: managedObjectFormData is undefined`);
    if(!externalManagedObjectFormData) throw new Error(`${logName}: externalManagedObjectFormData is undefined`);
    if(!externalManagedBusinessGroupsFormData) throw new Error(`${logName}: externalManagedBusinessGroupsFormData is undefined`);
    // validate externally controlled memberOfOrganizations
    if(!isMemberOfOrganizationsValid(externalManagedObjectFormData.memberOfOrganizations)) return false;
    if(!isMemberOfBusinessGroupsValid(externalManagedBusinessGroupsFormData)) {
      alert(`${logName}: isMemberOfBusinessGroupsValid returned false`)
      return false;
    }
    doSubmitManagedObject(create_ManagedObject_From_FormEntities({
      orginalManagedObject: managedObject,
      formDataEnvelope: newMofde,
      externalFormData: externalManagedObjectFormData,
      externalManagedBusinessGroupsFormData: externalManagedBusinessGroupsFormData, 
    }));
  }

  const onCancelManagedObjectForm = () => {
    props.onCancel();
  }

  const onInvalidSubmitManagedObjectForm = () => {
    exterrnalManagedObjectTriggerFormValidationFunc();
  }

  const displayManagedObjectFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }

  const displayManagedObjectFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
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

  const renderManageOrganzationsRoles = (): JSX.Element => {
    const funcName = 'renderManageOrganzationsRoles';
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
            Organizations
          </span>
        </div>
      );
    }

    const renderContent = () => {
      if(!externalManagedObjectFormData) throw new Error(`${logName}: externalManagedObjectFormData is undefined`);
      return (
        <React.Fragment>
          <p><b>TODO: leave in here until removed in Server - backwards compatibility</b></p>
          <APManageUserOrganizations
            formId={componentName+'_APManageUserOrganizations'}
            availableOrganizationEntityIdList={availableOrganizationEntityIdList}
            organizationRolesList={externalManagedObjectFormData.memberOfOrganizations ? externalManagedObjectFormData.memberOfOrganizations : []}
            organizationEntityId={currentOrganizationEntityId}
            // organizationId={props.organizationId}
            // organizationDisplayName={currentOrganization?.displayName}
            onChange={onOrganizationRolesListUpdate}
            registerTriggerFormValidationFunc={register_APManageUserOrganizations_FormValidation_Func}
          />
        </React.Fragment>
      );
    }
    // main
    if(props.organizationId !== undefined) return renderContent();

    return (  
      <React.Fragment>
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable={true}
          // collapsed={memberOfOrganizations.length === 0}
          collapsed={false}
        >
          <React.Fragment>
            <div className='p-mb-6'/>
            {renderContent()}
          </React.Fragment>
        </Panel>
      </React.Fragment>
    );
  }

  const renderManageMemberOfBusinessGroups = (): JSX.Element => {
    const funcName = 'renderManageMemberOfBusinessGroups';
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
            Business Groups
          </span>
        </div>
      );
    }

    const renderContent = (organizationEntityId: TAPEntityId) => {
      if(externalManagedBusinessGroupsFormData === undefined) throw new Error(`${logName}: externalManagedBusinessGroupsFormData === undefined`);
      if(managedObject === undefined) throw new Error(`${logName}: managedObject === undefined`);

      const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = APUsersDisplayService.find_ApMemberOfBusinessGroupDisplayList({
        organizationId: organizationEntityId.id,
        apUserDisplay: managedObject
      });
      return (
        <React.Fragment>
          {/* <p><b>TODO: Business Groups</b></p> */}
          <APManageUserMemberOfBusinessGroups
            formId={componentName+'_APManageUserMemberOfBusinessGroups'}
            organizationEntityId={organizationEntityId}
            completeOrganizationApBusinessGroupDisplayList={completeOrganizationApBusinessGroupDisplayList}
            existingOrganizationApMemberOfBusinessGroupDisplayList={apMemberOfBusinessGroupDisplayList}     
            onChange={onMemberOfBusinessGroupsUpdate}       
            registerTriggerFormValidationFunc={register_APManageUserMemberOfBusinessGroups_FormValidation_Func}
          />
        </React.Fragment>
      );
    }
    // main
    // if(props.organizationId !== undefined) {
    //   if(currentOrganizationEntityId === undefined) throw new Error(`${logName}: currentOrganizationEntityId === undefined`);
    //   return renderContent(currentOrganizationEntityId);
    // }

    // only supports 1 organization
    if(currentOrganizationEntityId === undefined) throw new Error(`${logName}: currentOrganizationEntityId === undefined`);

    return (  
      <React.Fragment>
        <Panel 
          headerTemplate={panelHeaderTemplate} 
          toggleable={true}
          // collapsed={memberOfOrganizations.length === 0}
          collapsed={false}
        >
          <React.Fragment>
            {/* <div className='p-mb-6'/> */}
            {renderContent(currentOrganizationEntityId)}
          </React.Fragment>
        </Panel>
      </React.Fragment>
    );
  }

  const renderManagedObjectForm = () => {
    const isNewUser: boolean = (props.action === EAction.NEW);

    // testing 
    // if(managedObject !== undefined) {
    //   const apEntity = APUsersDisplayService.getPropertyNameString(managedObject, (x) => x.apEntityId);
    // }



    return (
      <div className="card p-mt-4">
        <div className="p-fluid">
          <form id={formId} onSubmit={managedObjectUseForm.handleSubmit(onSubmitManagedObjectForm, onInvalidSubmitManagedObjectForm)} className="p-fluid">           
            {/* E-mail */}
            <div className="p-field">
              <span className="p-float-label p-input-icon-right">
                <i className="pi pi-envelope" />
                <Controller
                  name="formData.email"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSEmail("Enter E-Mail.", true)}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={isNewUser}
                          disabled={!isNewUser}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                {/* <label htmlFor={APUsersDisplayService.nameOf_ApsUserResponse_ApsProfile('email')} className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apsUserResponse?.profile?.email })}>E-Mail*</label> */}
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.email })}>E-Mail*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.email)}
            </div>
            {/* Password */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="formData.password"
                  control={managedObjectUseForm.control}
                  rules={{
                    required: "Enter Password.",
                    validate: {
                      trim: v => v.trim().length === v.length ? true : 'Enter Password without leading/trailing spaces.',
                    }
                  }}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <Password
                          id={field.name}
                          toggleMask={true}
                          feedback={false}        
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                {/* <label htmlFor={APUsersDisplayService.nameOf_ApsUserResponse('password')} className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apsUserResponse?.password })}>Password*</label> */}
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.password })}>Password*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.password)}
            </div>
            {/* First Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="formData.first"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSUserName("Enter First Name.", true)}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          autoFocus={!isNewUser}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                {/* <label htmlFor={APUsersDisplayService.nameOf_ApsUserResponse_ApsProfile('first')} className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apsUserResponse?.profile?.first })}>First Name*</label> */}
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.first })}>First Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.first)}
            </div>
            {/* Last Name */}
            <div className="p-field">
              <span className="p-float-label">
                <Controller
                  name="formData.last"
                  control={managedObjectUseForm.control}
                  rules={APSOpenApiFormValidationRules.APSUserName("Enter Last Name.", true)}
                  render={( { field, fieldState }) => {
                      // console.log(`field=${field.name}, fieldState=${JSON.stringify(fieldState)}`);
                      return(
                        <InputText
                          id={field.name}
                          {...field}
                          className={classNames({ 'p-invalid': fieldState.invalid })}                       
                        />
                  )}}
                />
                {/* <label htmlFor={APUsersDisplayService.nameOf_ApsUserResponse_ApsProfile('last')} className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apsUserResponse?.profile?.last })}>Last Name*</label> */}
                <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.last })}>Last Name*</label>
              </span>
              {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.last)}
            </div>
            {/* System Roles */}
            {props.organizationId === undefined &&
              <div className="p-field">
                <span className="p-float-label">
                  <Controller
                    name="formData.systemRoleIdList"
                    control={managedObjectUseForm.control}
                    render={( { field, fieldState }) => {
                        // console.log(`${logName}: field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                        return(
                          <MultiSelect
                            display="chip"
                            value={field.value ? [...field.value] : []} 
                            options={APRbacDisplayService.create_SystemRoles_SelectEntityIdList()} 
                            onChange={(e) => field.onChange(e.value)}
                            optionLabel={APEntityIdsService.nameOf('displayName')}
                            optionValue={APEntityIdsService.nameOf('id')}
                            // style={{width: '500px'}} 
                            className={classNames({ 'p-invalid': fieldState.invalid })}                       
                          />
                    )}}
                  />
                  {/* <label htmlFor={APDisplayUtils.nameOf<TManagedObjectFormData>('formSystemRoleList')} className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formSystemRoleList })}>System Role(s)</label> */}
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.systemRoleIdList })}>System Role(s)</label>
                </span>
                {displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.formData?.systemRoleIdList)}
              </div>
            }
            {/* {props.organizationId === undefined &&
              <div className="p-field">
                <span className="p-float-label">
                  <Controller
                    name="systemRoles"
                    control={managedObjectUseForm.control}
                    render={( { field, fieldState }) => {
                        // console.log(`${logName}: field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                        return(
                          <MultiSelect
                            display="chip"
                            value={field.value ? [...field.value] : []} 
                            options={systemRolesSelectItemList} 
                            onChange={(e) => field.onChange(e.value)}
                            optionLabel="label"
                            optionValue="value"
                            // style={{width: '500px'}} 
                            className={classNames({ 'p-invalid': fieldState.invalid })}                       
                          />
                    )}}
                  />
                  <label htmlFor="systemRoles" className={classNames({ 'p-error': managedObjectUseForm.formState.errors.systemRoles })}>System Role(s)</label>
                </span>
                {displayManagedObjectFormFieldErrorMessage4Array(managedObjectUseForm.formState.errors.systemRoles)}
              </div>
            } */}
            {/* isActivated */}
            {props.organizationId === undefined &&
              <div className="p-field-checkbox">
                <span>
                  <Controller
                    name="formData.isActivated"
                    control={managedObjectUseForm.control}
                    render={( { field, fieldState }) => {
                        // console.log(`field=${JSON.stringify(field)}, fieldState=${JSON.stringify(fieldState)}`);
                        return(
                          <Checkbox
                            inputId={field.name}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.checked)}                                  
                            className={classNames({ 'p-invalid': fieldState.invalid })}                       
                          />
                    )}}
                  />
                  {/* <label htmlFor={APUsersDisplayService.nameOf_ApsUserResponse('isActivated')} className={classNames({ 'p-error': managedObjectUseForm.formState.errors.apsUserResponse?.isActivated })}> Activate User</label> */}
                  <label className={classNames({ 'p-error': managedObjectUseForm.formState.errors.formData?.isActivated })}> Activate User</label>
                </span>
                {displayManagedObjectFormFieldErrorMessage(managedObjectUseForm.formState.errors.formData?.isActivated)}
              </div>
            }
          </form>  
          {/* OLD Organizations & Roles */}
          <div className="p-field">
            { renderManageOrganzationsRoles() }
          </div>
          {/* Organization Groups & Roles */}
          <div className="p-field">
            { renderManageMemberOfBusinessGroups() }
          </div>
          {/* footer */}
          {/* <Divider /> */}
          { renderManagedObjectFormFooter() }
        </div>
      </div>
    );
  }
  
  return (
    <div className="manage-users">

      {props.action === EAction.NEW && 
        <APComponentHeader header='Create User' />
      }

      {props.action === EAction.EDIT && 
        <APComponentHeader header={`Edit User: ${props.userEntityId?.displayName}`} />
      }

      <ApiCallStatusError apiCallStatus={apiCallStatus} />

      {managedObject && availableOrganizationEntityIdList.length > 0 && managedObjectFormDataEnvelope &&
        renderManagedObjectForm()
      }
    </div>
  );
}
