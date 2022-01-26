
import React from "react";
import { useForm, Controller, FieldError } from 'react-hook-form';

import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";

import { CommonName, Organization } from "@solace-iot-team/apim-connector-openapi-browser";
import { APSOrganizationAuthRoleList, APSOrganizationRoles, APSOrganizationRolesList, EAPSOrganizationAuthRole } from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { ConfigHelper } from "../ConfigContextProvider/ConfigHelper";
import { ConfigContext } from "../ConfigContextProvider/ConfigContextProvider";
import { EAPRbacRoleScope, TAPRbacRole, TAPRbacRoleList } from "../../utils/APRbac";

import "../APComponents.css";
import 'primeflex/primeflex.css';

export interface IAPManageUserOrganizationsProps {
  formId: string;
  availableOrganizationList: Array<Organization>;
  organizationRolesList: APSOrganizationRolesList;
  organizationId?: CommonName;
  onChange: (organizationRolesList: APSOrganizationRolesList) => void;
}

export const APManageUserOrganizations: React.FC<IAPManageUserOrganizationsProps> = (props: IAPManageUserOrganizationsProps) => {
  const componentName = 'APManageUserOrganizations';

  type TOrganizationRolesFormData = APSOrganizationRoles;
  const emptyManagedOrganizationRoles: APSOrganizationRoles = {
    organizationId: '',
    roles: []
  }
  type TOrganizationSelectItem = { label: string, value: string };
  type TOrganizationSelectItemList = Array<TOrganizationSelectItem>;
  type TRoleSelectItem = { label: string, value: EAPSOrganizationAuthRole };
  type TRoleSelectItemList = Array<TRoleSelectItem>;

  const [configContext] = React.useContext(ConfigContext); 

  const transformManagedOrganinzationRolesToFormData = (mor: APSOrganizationRoles): TOrganizationRolesFormData => {
    return {
      ...mor
    };
  }
  const transformFormDataToManagedOrganizationRoles = (formData: TOrganizationRolesFormData): APSOrganizationRoles => {
    return {
      ...formData
    }
  }

  const createOrganizationSelectItems = (): TOrganizationSelectItemList => {
    let selectItems: TOrganizationSelectItemList = [];
    if(props.organizationId === undefined) {
      props.availableOrganizationList.forEach( (availableOrganization: Organization) => {
        const alreadySelected = selectedOrganizationRolesList.find((apsOrganizationRoles: APSOrganizationRoles) => {
          return availableOrganization.name === apsOrganizationRoles.organizationId;
        });
        if(!alreadySelected) {
          selectItems.push({
            label: availableOrganization.name,
            value: availableOrganization.name
          });
        }
      });
    } else {
      selectItems.push({
        label: props.organizationId,
        value: props.organizationId
      });  
    }
    return selectItems.sort( (e1: TOrganizationSelectItem, e2: TOrganizationSelectItem) => {
      if(e1.label.toLowerCase() < e2.label.toLowerCase()) return -1;
      if(e1.label.toLowerCase() > e2.label.toLowerCase()) return 1;
      return 0;
    });
  }

  const createOrganizationRolesSelectItems = (): TRoleSelectItemList => {
    const rbacScopeList: Array<EAPRbacRoleScope> = [EAPRbacRoleScope.ORG];
    const rbacRoleList: TAPRbacRoleList = ConfigHelper.getSortedAndScopedRbacRoleList(configContext, rbacScopeList);
    const selectItems: TRoleSelectItemList = [];
    rbacRoleList.forEach( (rbacRole: TAPRbacRole) => {
      selectItems.push({
        label: rbacRole.displayName,
        value: rbacRole.id as EAPSOrganizationAuthRole
      });
    });
    return selectItems; 
  }

  const organizationRolesSelectItemList: TRoleSelectItemList = createOrganizationRolesSelectItems();
  const organizationRolesUseForm = useForm<TOrganizationRolesFormData>();
  const [managedOrganizationRoles, setManagedOrganizationRoles] = React.useState<APSOrganizationRoles>(emptyManagedOrganizationRoles);
  const [selectedOrganizationRolesList, setSelectedOrganizationRolesList] = React.useState<APSOrganizationRolesList>(props.organizationRolesList);
  const [isManagedOrganizationRolesListChanged, setIsManagedOrganizationRolesListChanged] = React.useState<boolean>(false);
  const [organizationRolesFormData, setOrganizationRolesFormData] = React.useState<TOrganizationRolesFormData>();
  const organizationRolesListDataTableRef = React.useRef<any>(null);

  React.useEffect(() => {
    const funcName = 'useEffect[]';
    const logName = `${componentName}.${funcName}()`;
    // alert(`${componentName}: mounting ... ${JSON.stringify(props.organizationRolesList, null, 2)}`);
    // alert(`${componentName}: mounting:  props.availableOrganizationList=${JSON.stringify(props.availableOrganizationList, null, 2)}`);
    if(props.organizationId !== undefined) {
      const initialOrganizationRoles = props.organizationRolesList.find( (apsOrganizationRoles: APSOrganizationRoles) => {
        return apsOrganizationRoles.organizationId === props.organizationId;
      });
      if(!initialOrganizationRoles) throw new Error(`${logName}: initialOrganizationRoles is undefined`);
      setManagedOrganizationRoles(initialOrganizationRoles);
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(managedOrganizationRoles) setOrganizationRolesFormData(transformManagedOrganinzationRolesToFormData(managedOrganizationRoles));
  }, [managedOrganizationRoles]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(isManagedOrganizationRolesListChanged) {
      organizationRolesUseForm.clearErrors();
      if(organizationRolesUseForm.getValues('organizationId') !== '') organizationRolesUseForm.trigger();
      props.onChange(selectedOrganizationRolesList);
    }
  }, [selectedOrganizationRolesList]) /* eslint-disable-line react-hooks/exhaustive-deps */

  React.useEffect(() => {
    if(organizationRolesFormData) doPopulateOrganizationRolesFormDataValues(organizationRolesFormData);
  }, [organizationRolesFormData]) /* eslint-disable-line react-hooks/exhaustive-deps */

  const doPopulateOrganizationRolesFormDataValues = (organizationRolesFormData: TOrganizationRolesFormData) => {
    organizationRolesUseForm.setValue('organizationId', organizationRolesFormData.organizationId);
    organizationRolesUseForm.setValue('roles', organizationRolesFormData.roles);
  }

  const doAddManagedOrganizationRoles = (mor: APSOrganizationRoles) => {
    setManagedOrganizationRoles(emptyManagedOrganizationRoles);
    setIsManagedOrganizationRolesListChanged(true);
    const _morl = [...selectedOrganizationRolesList];
    _morl.push(mor);
    setSelectedOrganizationRolesList(_morl);
    setIsManagedOrganizationRolesListChanged(true);
  }
  const doRemoveManagedOrganizationRoles = (mor: APSOrganizationRoles) => {
    const idx = selectedOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRoles) => {
      return mor.organizationId === organizationRoles.organizationId;
    });
    const _morl = [...selectedOrganizationRolesList];
    _morl.splice(idx, 1);
    setSelectedOrganizationRolesList(_morl);
    setIsManagedOrganizationRolesListChanged(true);
  }
  const doUpdateManagedOrganizationRoles = (mor: APSOrganizationRoles) => {
    const idx = selectedOrganizationRolesList.findIndex((organizationRoles: APSOrganizationRoles) => {
      return mor.organizationId === organizationRoles.organizationId;
    });
    const _morl = [...selectedOrganizationRolesList];
    _morl[idx] = mor;
    setSelectedOrganizationRolesList(_morl);
    setIsManagedOrganizationRolesListChanged(true);
  }
  const onSubmitOrganizationRolesForm = (organizationRolesFormData: TOrganizationRolesFormData) => {
    doAddManagedOrganizationRoles(transformFormDataToManagedOrganizationRoles(organizationRolesFormData));
  }
  const onInvalidSubmitOrganizationRolesForm = () => {
    // placeholder
  }

  const onSelectedRolesChanged = (authRoleList: APSOrganizationAuthRoleList) => {
    if(props.organizationId !== undefined) doUpdateManagedOrganizationRoles({
      organizationId: props.organizationId,
      roles: authRoleList
    });
  }

  const displayManagedOrganizationRolesFormFieldErrorMessage = (fieldError: FieldError | undefined) => {
    return fieldError && <small className="p-error">{fieldError.message}</small>    
  }
  const displayManagedOrganizationRolesFormFieldErrorMessage4Array = (fieldErrorList: Array<FieldError | undefined> | undefined) => {
    let _fieldError: any = fieldErrorList;
    return _fieldError && <small className="p-error">{_fieldError.message}</small>;
  }

  const renderOrganizationRolesListTable = (): JSX.Element => {

    const rolesBodyTemplate = (row: APSOrganizationRoles) => {
      if(row.roles.length > 0) {
        return ConfigHelper.getAuthorizedOrgRolesDisplayNameList(configContext, row.roles).join(', ');
      } else {
        return ('None');
      }
    }
    const actionBodyTemplate = (row: APSOrganizationRoles) => {
      return (
          <React.Fragment>
            <Button 
              key={componentName+'remove'+row.organizationId} 
              type='button'
              icon="pi pi-times" 
              className="p-button-rounded p-button-outlined p-button-secondary p-mr-2" 
              onClick={() => doRemoveManagedOrganizationRoles(row)} 
            />
          </React.Fragment>
      );
    }  
    return (
      <React.Fragment>
        <DataTable
          ref={organizationRolesListDataTableRef}
          className="p-datatable-sm"
          showGridlines={false}
          value={selectedOrganizationRolesList}
          emptyMessage='No organizations defined.'
          scrollable 
          dataKey="organizationId"  
          sortMode='single'
          sortField="organizationId"
          sortOrder={1}
        >
          <Column header="Organization" field="organizationId" sortable style={{ width: "30em"}}/>
          <Column header="Roles" body={rolesBodyTemplate}  bodyStyle={{ overflowWrap: 'break-word', wordWrap: 'break-word' }} />
          <Column body={actionBodyTemplate} bodyStyle={{ width: '3em', textAlign: 'end' }} />
        </DataTable>
      </React.Fragment>        
    );
  }

  const renderRolesField = () => {
    const width = props.organizationId === undefined ? '75%' : '100%';
    return (
      <div className="p-field" style={{ width: width }} >
        <span className="p-float-label">
          <Controller
            name="roles"
            control={organizationRolesUseForm.control}
            rules={{
              required: "Choose at least 1 Role."
            }}
            render={( { field, fieldState }) => {
                return(
                  <MultiSelect
                    display="chip"
                    value={field.value ? [...field.value] : []} 
                    options={organizationRolesSelectItemList} 
                    onChange={(e) => { field.onChange(e.value); onSelectedRolesChanged(e.value); }}
                    optionLabel="label"
                    optionValue="value"
                    className={classNames({ 'p-invalid': fieldState.invalid })}                       
                  />
            )}}
          />
          <label htmlFor="roles" className={classNames({ 'p-error': organizationRolesUseForm.formState.errors.roles })}>Role(s)*</label>
        </span>
        { displayManagedOrganizationRolesFormFieldErrorMessage4Array(organizationRolesUseForm.formState.errors.roles) }
      </div>
    );
  }

  const renderAllOrgsForm = () => {
    return (
      <div className="card">
        <div className="p-fluid">
          <form id={props.formId} onSubmit={organizationRolesUseForm.handleSubmit(onSubmitOrganizationRolesForm, onInvalidSubmitOrganizationRolesForm)} className="p-fluid">           
            <div className="p-formgroup-inline">
              {/* OrganizationId */}
              <div className="p-field" style={{ width: '20%' }} >
                <span className="p-float-label p-input-icon-right">
                  <i className="pi pi-key" />
                  <Controller
                    name="organizationId"
                    control={organizationRolesUseForm.control}
                    rules={{
                      required: "Select an Organization.",
                    }}
                    render={( { field, fieldState }) => {
                      return(
                        <Dropdown
                          id={field.name}
                          {...field}
                          options={createOrganizationSelectItems()}
                          onChange={(e) => field.onChange(e.value)}
                          className={classNames({ 'p-invalid': fieldState.invalid })}     
                          // disabled={isDisabled}                                   
                        />                        
                    )}}
                  />
                  <label htmlFor="organizationId" className={classNames({ 'p-error': organizationRolesUseForm.formState.errors.organizationId })}>Organization*</label>
                </span>
                {displayManagedOrganizationRolesFormFieldErrorMessage(organizationRolesUseForm.formState.errors.organizationId)}
              </div>
              {/* Roles */}
              { renderRolesField() }
              <div>          
                <Button key={componentName+'submit'} form={props.formId} type="submit" icon="pi pi-plus" className="p-button-text p-button-plain p-button-outlined" />
              </div>  
            </div>
            {renderOrganizationRolesListTable()}
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

  const renderOneOrgForm = (orgId: CommonName) => {
    return (
      <div className="card">
        <div className="p-fluid">
          {/* <form id={props.formId} onSubmit={organizationRolesUseForm.handleSubmit(onSubmitOrganizationRolesForm, onInvalidSubmitOrganizationRolesForm)} className="p-fluid">            */}
            { renderRolesField() }
            {/* DEBUG */}
            {/* <p>selectedOrganizationRolesList:</p>
            <pre style={ { fontSize: '10px' }} >
              {JSON.stringify(selectedOrganizationRolesList, null, 2)}
            </pre> */}
          {/* </form>   */}
        </div>
      </div>
    );
  }

  const renderForm = () => {
    if(props.organizationId === undefined) return renderAllOrgsForm();
    else return renderOneOrgForm(props.organizationId);
  }

  return renderForm();
}
