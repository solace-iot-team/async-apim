import express from 'express';
import { ControllerUtils } from '../ControllerUtils';
import { ApsSessionController, OrganizationId_Params } from './ApsSessionController';

const get_logout = '/logout';
const post_logoutAll = '/logoutAll';
const post_logoutOrganizationAll = `/:${ControllerUtils.getParamName<OrganizationId_Params>('organization_id')}/logoutAll`;

export default express
  .Router()
  .get(get_logout, ApsSessionController.logout)
  .post(post_logoutAll, ApsSessionController.logoutAll)
  .post(post_logoutOrganizationAll, ApsSessionController.logoutOrganizationAll)

