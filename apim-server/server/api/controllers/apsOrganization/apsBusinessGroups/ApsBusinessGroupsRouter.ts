import express from 'express';
import { ControllerUtils } from '../../ControllerUtils';
import { 
  AllByExternalSystemId_Params, 
  All_Params, 
  ApsBusinessGroupsController, 
  ByExternalReferenceId_Params, 
  ById_Params,
  Create_Params,
  Delete_Params,
  Update_Params
} from './ApsBusinessGroupsController';

const get_all = `/:${ControllerUtils.getParamName<All_Params>('organization_id')}`;
const get_byId = `/:${ControllerUtils.getParamName<ById_Params>('organization_id')}/:${ControllerUtils.getParamName<ById_Params>('businessgroup_id')}`;
const post_create = `/:${ControllerUtils.getParamName<Create_Params>('organization_id')}`;
const patch_update = `/:${ControllerUtils.getParamName<Update_Params>('organization_id')}/:${ControllerUtils.getParamName<Update_Params>('businessgroup_id')}`;
const delete_delete = `/:${ControllerUtils.getParamName<Delete_Params>('organization_id')}/:${ControllerUtils.getParamName<Delete_Params>('businessgroup_id')}`;
const get_allByExternalSystemId = `/:${ControllerUtils.getParamName<AllByExternalSystemId_Params>('organization_id')}/externalSystem/:${ControllerUtils.getParamName<AllByExternalSystemId_Params>('external_system_id')}`;
const get_byExternalReferenceId = `/:${ControllerUtils.getParamName<ByExternalReferenceId_Params>('organization_id')}/externalReference/:${ControllerUtils.getParamName<ByExternalReferenceId_Params>('external_reference_id')}`;

export default express
  .Router()
  .get(get_all, ApsBusinessGroupsController.all)
  .get(get_byId, ApsBusinessGroupsController.byId)
  .post(post_create, ApsBusinessGroupsController.create)
  .patch(patch_update, ApsBusinessGroupsController.update)
  .delete(delete_delete, ApsBusinessGroupsController.delete)
  .get(get_allByExternalSystemId, ApsBusinessGroupsController.allByExternalSystemId)
  .get(get_byExternalReferenceId, ApsBusinessGroupsController.byExternalReferenceId)
