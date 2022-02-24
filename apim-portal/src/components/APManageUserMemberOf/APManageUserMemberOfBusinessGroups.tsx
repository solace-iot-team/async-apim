
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { TreeSelect } from 'primereact/treeselect';

import { CommonDisplayName, CommonName } from "@solace-iot-team/apim-connector-openapi-browser";
import { 
  APSOrganizationAuthRoleList, 
  APSOrganizationRolesResponse, 
  APSOrganizationRolesResponseList,
  EAPSOrganizationAuthRole, 
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { ConfigHelper, TRoleSelectItemList } from "../ConfigContextProvider/ConfigHelper";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { TAPOrganization, TAPOrganizationList } from "../../utils/APOrganizationsService";
import APEntityIdsService, { TAPEntityId, TAPEntityIdList } from "../../utils/APEntityIdsService";

import "../APComponents.css";
import 'primeflex/primeflex.css';
import APUsersDisplayService, { TAPMemberOfBusinessGroupDisplayList, TAPMemberOfOrganizationGroupsDisplayList } from "../../displayServices/APUsersDisplayService";
import APRbacDisplayService from "../../displayServices/APRbacDisplayService";
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplay, TAPBusinessGroupDisplayList, TAPBusinessGroupTreeNodeDisplayList } from "../../displayServices/APBusinessGroupsDisplayService";
import { ApiCallState, TApiCallState } from "../../utils/ApiCallState";
import { APClientConnectorOpenApi } from "../../utils/APClientConnectorOpenApi";

export interface IAPManageUserMemberOfBusinessGroupsProps {
  formId: string;
  // one org
  organizationEntityId: TAPEntityId;
  completeOrganizationApBusinessGroupDisplayList: TAPBusinessGroupDisplayList;
  // // all orgs
  // availableOrganizationEntityIdList: TAPEntityIdList;
  // existing 
  apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList;

  onChange: (apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList) => void;
  registerTriggerFormValidationFunc: (formValidationFunc: () => void) => void;

}

export const APManageUserMemberOfBusinessGroups: React.FC<IAPManageUserMemberOfBusinessGroupsProps> = (props: IAPManageUserMemberOfBusinessGroupsProps) => {
  const ComponentName = 'APManageUserMemberOfBusinessGroups';


  type TBusinessGroupRolesFormData = {
    businessGroupId: string;
    roles: Array<string>;
  }
  type TBusinessGroupRolesFormDataEnvelope = {
    formData: TBusinessGroupRolesFormData;
  }

  // type TOrganizationRolesFormData = APSOrganizationRolesResponse;
  // const emptyManagedOrganizationRoles: APSOrganizationRolesResponse = {
  //   organizationId: '',
  //   organizationDisplayName: '',
  //   roles: []
  // }

  // const [configContext] = React.useContext(ConfigContext); 

  // const transformManagedOrganinzationRolesToFormData = (mor: APSOrganizationRolesResponse): TOrganizationRolesFormData => {
  //   return {
  //     ...mor
  //   }
  // }
  // const transformFormDataToManagedOrganizationRoles = (formData: TOrganizationRolesFormData): APSOrganizationRolesResponse => {
  //   return {
  //     ...formData
  //   }
  // }

  // const createOrganizationSelectItems = (): TAPEntityIdList => {
  //   let selectItems: TAPEntityIdList = [];
  //   if(props.organizationId === undefined && props.organizationDisplayName === undefined) {
  //     props.availableOrganizationList.forEach( (availableOrganization: TAPOrganization) => {
  //       const alreadySelected = selectedOrganizationRolesList.find((apsOrganizationRoles: APSOrganizationRolesResponse) => {
  //         return availableOrganization.name === apsOrganizationRoles.organizationId;
  //       });
  //       if(!alreadySelected) {
  //         selectItems.push({
  //           id: availableOrganization.name,
  //           displayName: availableOrganization.displayName
  //         });
  //       }
  //     });
  //   } else if(props.organizationId !== undefined && props.organizationDisplayName !== undefined) {
  //       selectItems.push({
  //         id: props.organizationId,
  //         displayName: props.organizationDisplayName ? props.organizationDisplayName : props.organizationId
  //       });  
  //   }
  //   return APEntityIdsService.sort_byDisplayName(selectItems);
  // }

  // const organizationRolesSelectItemList: TRoleSelectItemList = ConfigHelper.createOrganizationRolesSelectItems(configContext);
  // const [managedOrganizationRoles, setManagedOrganizationRoles] = React.useState<APSOrganizationRolesResponse>(emptyManagedOrganizationRoles);
  // const [selectedOrganizationRolesList, setSelectedOrganizationRolesList] = React.useState<APSOrganizationRolesResponseList>(props.organizationRolesList);
  // const [isManagedOrganizationRolesListChanged, setIsManagedOrganizationRolesListChanged] = React.useState<boolean>(false);
  // const [organizationRolesFormData, setOrganizationRolesFormData] = React.useState<TOrganizationRolesFormData>();
  // const organizationRolesListDataTableRef = React.useRef<any>(null);

  // const [availableSelectPoolApBusinessGroupDisplayList, setAvailableSelectPoolApBusinessGroupDisplayList] = React.useState<TAPBusinessGroupDisplayList>([]);
  const [apBusinessGroupTreeNodeDisplayList, setApBusinessGroupTreeNodeDisplayList] = React.useState<TAPBusinessGroupTreeNodeDisplayList>([]);
  const businessGroupsUseForm = useForm<TBusinessGroupRolesFormDataEnvelope>();
  

  const APManageUserMemberOfBusinessGroups_triggerFormValidation = (): void => {
    alert('APManageUserMemberOfBusinessGroups_triggerFormValidation: do the form validation');
    // organizationRolesUseForm.trigger();
  }


  const doInitialize = () => {
    const funcName = 'doInitialize';
    const logName = `${ComponentName}.${funcName}()`;

    // generate the tree node
    const apBusinessGroupTreeNodeDisplayList: TAPBusinessGroupTreeNodeDisplayList = APBusinessGroupsDisplayService.generate_ApBusinessGroupTreeNodeDisplayList_From_ApBusinessGroupDisplayList(props.completeOrganizationApBusinessGroupDisplayList);
    setApBusinessGroupTreeNodeDisplayList(apBusinessGroupTreeNodeDisplayList);

    // register with caller
    props.registerTriggerFormValidationFunc(APManageUserMemberOfBusinessGroups_triggerFormValidation);

    // set the form
    // const formDataEnvelope: TBusinessGroupRolesFormDataEnvelope = {
    //   formData: apBusinessGroupTreeNodeDisplayList
    // }
    // businessGroupsUseForm.setValue('formData', managedObjectFormDataEnvelope.formData);


  }

  React.useEffect(() => {
    const funcName = 'useEffect[]';
    const logName = `${ComponentName}.${funcName}()`;
    const validInputCombination: boolean = (props.organizationEntityId !== undefined && props.apMemberOfOrganizationGroupsDisplayList.length > 0) || (props.organizationEntityId === undefined && props.apMemberOfOrganizationGroupsDisplayList.length === 0);
    if(!validInputCombination) {
      throw new Error(`${logName}: invalid input combination: props.organizationEntityId=${JSON.stringify(props.organizationEntityId)}, props.apMemberOfOrganizationGroupsDisplayList=${JSON.stringify(props.apMemberOfOrganizationGroupsDisplayList, null, 2)}`);
    }
    // for now: only supports with organizationId
    if(props.organizationEntityId === undefined) {
      throw new Error(`${logName}: component only supports 1 organization, props.organizationEntityId === undefined`);
    }
    doInitialize();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(simulate1OrgSelection) {
  //     const x: TAPMemberOfOrganizationGroupsDisplayList = props.apMemberOfOrganizationGroupsDisplayList;
  //     for(const y of x) {
  //       for(const z of y.apMemberOfBusinessGroupDisplayList) {
  //         z.apBusinessGroupRoleEntityIdList = [
  //           {
  //             id: EAPSOrganizationAuthRole.ORGANIZATION_ADMIN,
  //             displayName: APRbacDisplayService.get_RoleDisplayName(EAPSOrganizationAuthRole.ORGANIZATION_ADMIN)
  //           }
  //         ];
  //       }
  //     }
  //     props.onChange(x);
  //   }
  // }, [simulate1OrgSelection])

  // React.useEffect(() => {
  //   if(managedOrganizationRoles) setOrganizationRolesFormData(transformManagedOrganinzationRolesToFormData(managedOrganizationRoles));
  // }, [managedOrganizationRoles]) /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(isManagedOrganizationRolesListChanged) {
  //     organizationRolesUseForm.clearErrors();
  //     if(organizationRolesUseForm.getValues('organizationId') !== '') organizationRolesUseForm.trigger();
  //     props.onChange(selectedOrganizationRolesList);
  //   }
  // }, [selectedOrganizationRolesList]) /* eslint-disable-line react-hooks/exhaustive-deps */

  // React.useEffect(() => {
  //   if(organizationRolesFormData) doPopulateOrganizationRolesFormDataValues(organizationRolesFormData);
  // }, [organizationRolesFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  // const doPopulateOrganizationRolesFormDataValues = (organizationRolesFormData: TOrganizationRolesFormData) => {
  //   organizationRolesUseForm.setValue('organizationId', organizationRolesFormData.organizationId);
  //   organizationRolesUseForm.setValue('roles', organizationRolesFormData.roles);
  // }

  // const doAddManagedOrganizationRoles = (mor: APSOrganizationRolesResponse) => {
  //   setManagedOrganizationRoles(emptyManagedOrganizationRoles);
  //   setIsManagedOrganizationRolesListChanged(true);
  //   const _morl = [...selectedOrganizationRolesList];
  //   _morl.push(mor);
  //   setSelectedOrganizationRolesList(_morl);
  //   setIsManagedOrganizationRolesListChanged(true);
  // }
  // const doRemoveManagedOrganizationRoles = (mor: APSOrganizationRolesResponse) => {
  //   const idx = selectedOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRolesResponse) => {
  //     return mor.organizationId === organizationRoles.organizationId;
  //   });
  //   const _morl = [...selectedOrganizationRolesList];
  //   _morl.splice(idx, 1);
  //   setSelectedOrganizationRolesList(_morl);
  //   setIsManagedOrganizationRolesListChanged(true);
  // }
  // const doUpdateManagedOrganizationRoles = (mor: APSOrganizationRolesResponse) => {
  //   const idx = selectedOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRolesResponse) => {
  //     return mor.organizationId === organizationRoles.organizationId;
  //   });
  //   const _morl = [...selectedOrganizationRolesList];
  //   _morl[idx] = mor;
  //   setSelectedOrganizationRolesList(_morl);
  //   setIsManagedOrganizationRolesListChanged(true);
  // }
  // const onSubmitOrganizationRolesForm = (organizationRolesFormData: TOrganizationRolesFormData) => {
  //   // alert(`organizationRolesFormData = ${JSON.stringify(organizationRolesFormData, null, 2)}`);
  //   const found = props.availableOrganizationList.find((x) => {
  //     return x.name === organizationRolesFormData.organizationId;
  //   });
  //   const fd: TOrganizationRolesFormData = {
  //     ...organizationRolesFormData,
  //     organizationDisplayName: found ? found.displayName : organizationRolesFormData.organizationId
  //   }
  //   // alert(`fd = ${JSON.stringify(fd, null, 2)}`);
  //   doAddManagedOrganizationRoles(transformFormDataToManagedOrganizationRoles(fd));
  // }
  // const onInvalidSubmitOrganizationRolesForm = () => {
  //   // placeholder
  // }

  // const onSelectedRolesChanged = (authRoleList: APSOrganizationAuthRoleList) => {
  //   if(props.organizationId !== undefined && props.organizationDisplayName !== undefined) {
  //     doUpdateManagedOrganizationRoles({
  //       organizationId: props.organizationId,
  //       organizationDisplayName: props.organizationDisplayName,
  //       roles: authRoleList
  //     });
  //   }
  // }

  const displayFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }
  const displayFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  }

  // const renderOrganizationRolesListTable = (): JSX.Element => {

  //   const organizationBodyTemplate = (row: APSOrganizationRolesResponse) => {
  //     return row.organizationDisplayName;
  //   }
  //   const rolesBodyTemplate = (row: APSOrganizationRolesResponse) => {
  //     if(row.roles.length > 0) {
  //       return ConfigHelper.getAuthorizedOrgRolesDisplayNameList(configContext, row.roles).join(', ');
  //     } else {
  //       return ('None');
  //     }
  //   }
  //   const actionBodyTemplate = (row: APSOrganizationRolesResponse) => {
  //     return (
  //         <React.Fragment>
  //           <Button 
  //             key={componentName+'remove'+row.organizationId} 
  //             type='button'
  //             icon="pi pi-times" 
  //             className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
  //             onClick={() => doRemoveManagedOrganizationRoles(row)} 
  //           />
  //         </React.Fragment>
  //     );
  //   }  

  //   return (
  //     <React.Fragment>
  //       <DataTable
  //         ref={organizationRolesListDataTableRef}
  //         className="p-datatable-sm"
  //         showGridlines={false}
  //         value={selectedOrganizationRolesList}
  //         emptyMessage='No organizations defined.'
  //         scrollable 
  //         dataKey="organizationId"  
  //         sortMode='single'
  //         sortField="organizationDisplayName"
  //         sortOrder={1}
  //       >
  //         {/* <Column header="Id" field="organizationId" /> */}
  //         <Column header="Organization" headerStyle={{ width: "30em", textAlign: 'left' }} body={organizationBodyTemplate} bodyStyle={{ textAlign: 'left'}} sortField="organizationDisplayName" sortable />
  //         <Column header="Roles" body={rolesBodyTemplate}  bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word', textAlign: 'left' }} />
  //         <Column body={actionBodyTemplate} bodyStyle={{ width: '3em', textAlign: 'end' }} />
  //       </DataTable>
  //     </React.Fragment>        
  //   );
  // }

  const renderRolesField = () => {
    // const width = props.organizationId === undefined ? '75%' : '100%';
    const width = '75%';
    return (
      <div className="p-field" style={{ width: width }} >
        <span className="p-float-label">
          <Controller
            control={businessGroupsUseForm.control}
            name="formData.roles"
            rules={{
              required: "Choose at least 1 Role."
            }}
            render={( { field, fieldState }) => {
                return(
                  <MultiSelect
                    display="chip"
                    value={field.value ? [...field.value] : []} 
                    options={APRbacDisplayService.get_BusinessGroupRolesSelect_EntityIdList()} 
                    onChange={(e) => field.onChange(e.value)}
                    optionLabel={APEntityIdsService.nameOf('displayName')}
                    optionValue={APEntityIdsService.nameOf('id')}
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  />
            )}}
          />
          <label className={classNames({ 'p-error': businessGroupsUseForm.formState.errors.formData?.roles })}>Role(s)*</label>
        </span>
        { displayFormFieldErrorMessage4Array(businessGroupsUseForm.formState.errors.formData?.roles) }
      </div>
    );
  }

  // const renderAllOrgsForm = () => {
  //   return (
  //     <div className="card">
  //       <div className="p-fluid">
  //         <form id={props.formId} onSubmit={organizationRolesUseForm.handleSubmit(onSubmitOrganizationRolesForm, onInvalidSubmitOrganizationRolesForm)} className="p-fluid">           
  //           <div className="p-formgroup-inline">
  //             {/* OrganizationId */}
  //             <div className="p-field" style={{ width: '20%' }} >
  //               <span className="p-float-label p-input-icon-right">
  //                 <i className="pi pi-key" />
  //                 <Controller
  //                   name="organizationId"
  //                   control={organizationRolesUseForm.control}
  //                   rules={{
  //                     required: "Select an Organization.",
  //                   }}
  //                   render={( { field, fieldState }) => {
  //                     return(
  //                       <Dropdown
  //                         id={field.name}
  //                         {...field}
  //                         options={createOrganizationSelectItems()}
  //                         onChange={(e) => field.onChange(e.value) }
  //                         className={classNames({ 'p-invalid': fieldState.invalid })}   
  //                         optionLabel="displayName"
  //                         optionValue="id"  
  //                         // disabled={isDisabled}                                   
  //                       />                        
  //                   )}}
  //                 />
  //                 <label htmlFor="organizationId" className={classNames({ 'p-error': organizationRolesUseForm.formState.errors.organizationId })}>Organization*</label>
  //               </span>
  //               {displayManagedOrganizationRolesFormFieldErrorMessage(organizationRolesUseForm.formState.errors.organizationId)}
  //             </div>
  //             {/* Roles */}
  //             { renderRolesField() }
  //             <div>          
  //               <Button key={componentName+'submit'} form={props.formId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
  //             </div>  
  //           </div>
  //           {renderOrganizationRolesListTable()}
  //           {/* DEBUG */}
  //           {/* <p>selectedOrganizationRolesList:</p>
  //           <pre style={ { fontSize: '10px' }} >
  //             {JSON.stringify(selectedOrganizationRolesList, null, 2)}
  //           </pre> */}
  //         </form>  
  //       </div>
  //     </div>
  //   );  
  // }

  // const renderOneOrgForm = (orgId: CommonName) => {
  //   return (
  //     <div className="card">
  //       <div className="p-fluid">
  //         {/* <form id={props.formId} onSubmit={organizationRolesUseForm.handleSubmit(onSubmitOrganizationRolesForm, onInvalidSubmitOrganizationRolesForm)} className="p-fluid">            */}
  //           { renderRolesField() }
  //           {/* DEBUG */}
  //           {/* <p>selectedOrganizationRolesList:</p>
  //           <pre style={ { fontSize: '10px' }} >
  //             {JSON.stringify(selectedOrganizationRolesList, null, 2)}
  //           </pre> */}
  //         {/* </form>   */}
  //       </div>
  //     </div>
  //   );
  // }

  // const renderForm = () => {
  //   if(props.organizationId === undefined) return renderAllOrgsForm();
  //   else return renderOneOrgForm(props.organizationId);
  // }

  const renderBusinessGroupsRolesListTable = () => {
    return (
      <p><b>renderBusinessGroupsRolesListTable: TODO: render the selected groups/roles tree table</b></p>
    );
  }

  const onSubmitForm = (newMofde: TBusinessGroupRolesFormDataEnvelope) => {
    const funcName = 'onSubmitForm';
    const logName = `${ComponentName}.${funcName}()`;

    alert(`${logName}: newMofde = ${JSON.stringify(newMofde, null, 2)}`);

    // add new group + roles to selected 
    // doAddManagedOrganizationRoles(transformFormDataToManagedOrganizationRoles(fd));
  }
  const onInvalidSubmitForm = () => {
    // placeholder
  }

  const renderForm = () => {
    return (
      <div className="card">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={businessGroupsUseForm.handleSubmit(onSubmitForm, onInvalidSubmitForm)} className="p-fluid">           
            <div className="p-formgroup-inline">
              {/* businessGroupId */}
              <div className="p-field" style={{ width: '20%' }} >
                <span className="p-float-label p-input-icon-right">
                  <i className="pi pi-key" />
                  <Controller
                    control={businessGroupsUseForm.control}
                    name="formData.businessGroupId"
                    rules={{
                      required: "Select a Business Group.",
                    }}
                    render={( { field, fieldState }) => {
                      return(
                        <TreeSelect
                          id={field.name}
                          className={classNames({ 'p-invalid': fieldState.invalid })}   
                          {...field}
                          options={apBusinessGroupTreeNodeDisplayList}
                          onChange={(e) => field.onChange(e.value) }
                          filter
                          // placeholder="Select Business Group"

                        />
                        // <Dropdown
                        //   id={field.name}
                        //   {...field}
                        //   options={createOrganizationSelectItems()}
                        //   onChange={(e) => field.onChange(e.value) }
                        //   className={classNames({ 'p-invalid': fieldState.invalid })}   
                        //   optionLabel="displayName"
                        //   optionValue="id"  
                        //   // disabled={isDisabled}                                   
                        // />                        
                    )}}
                  />
                  <label className={classNames({ 'p-error': businessGroupsUseForm.formState.errors.formData?.businessGroupId })}>Business Group*</label>
                </span>
                {displayFormFieldErrorMessage(businessGroupsUseForm.formState.errors.formData?.businessGroupId)}
              </div>
              {/* Roles */}
              { renderRolesField() }
              <div>          
                <Button key={ComponentName+'submit'} form={props.formId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
              </div>  
            </div>
            {renderBusinessGroupsRolesListTable()}
            {/* DEBUG */}
            {/* <p>selectedOrganizationRolesList:</p>
            <pre style={ { fontSize: '10px' }} >
              {JSON.stringify(selectedOrganizationRolesList, null, 2)}
            </pre> */}
          </form> 
        </div>
      </div>
    );
  }

  return renderForm();

  // return (
  //   <React.Fragment>
  //     <p>{ComponentName}: TODO: implement me</p>
  //     <p>Existing props.apMemberOfOrganizationGroupsDisplayList=</p>
  //     <pre style={ { fontSize: '10px' }} >
  //       {JSON.stringify(props.apMemberOfOrganizationGroupsDisplayList, null, 2)}
  //     </pre>

  //   </React.Fragment>
  // )

}
