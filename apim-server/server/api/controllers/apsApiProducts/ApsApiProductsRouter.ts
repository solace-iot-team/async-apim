import express from 'express';
import { ControllerUtils } from '../ControllerUtils';
import { All_Path_Params, ApsApiProductsController } from './ApsApiProductsController';

const get_all = `/:${ControllerUtils.getParamName<All_Path_Params>('organization_id')}`;
// const get_byId = `/:${ControllerUtils.getParamName<ById_Params>('organization_id')}/:${ControllerUtils.getParamName<ById_Params>('businessgroup_id')}`;

export default express
  .Router()
  .get(get_all, ApsApiProductsController.all)
  // .get(get_byId, ApsApiProductsController.byId)


