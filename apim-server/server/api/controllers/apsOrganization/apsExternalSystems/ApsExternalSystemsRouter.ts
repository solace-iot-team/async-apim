import express from 'express';
import { ControllerUtils } from '../../ControllerUtils';
import { 
  ApsExternalSystemsController, 
  All_Params, 
  ById_Params,
  Create_Params,
  Delete_Params,
  Update_Params
} from './ApsExternalSystemsController';

const get_all = `/:${ControllerUtils.getParamName<All_Params>('organization_id')}`;
const get_byId = `/:${ControllerUtils.getParamName<ById_Params>('organization_id')}/:${ControllerUtils.getParamName<ById_Params>('external_system_id')}`;
const post_create = `/:${ControllerUtils.getParamName<Create_Params>('organization_id')}`;
const patch_update = `/:${ControllerUtils.getParamName<Update_Params>('organization_id')}/:${ControllerUtils.getParamName<Update_Params>('external_system_id')}`;
const delete_delete = `/:${ControllerUtils.getParamName<Delete_Params>('organization_id')}/:${ControllerUtils.getParamName<Delete_Params>('external_system_id')}`;

export default express
  .Router()
  .get(get_all, ApsExternalSystemsController.all)
  .get(get_byId, ApsExternalSystemsController.byId)
  .post(post_create, ApsExternalSystemsController.create)
  .patch(patch_update, ApsExternalSystemsController.update)
  .delete(delete_delete, ApsExternalSystemsController.delete)
