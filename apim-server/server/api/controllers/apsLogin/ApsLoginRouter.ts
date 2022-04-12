import express from 'express';
import { ControllerUtils } from '../ControllerUtils';
import { ApsLoginController, OrganizationId_Params, UserId_Params } from './ApsLoginController';

const post_logout = `/:${ControllerUtils.getParamName<UserId_Params>('user_id')}/logout`;
const post_logoutAll = '/logoutAll';
const post_logoutOrganizationAll = `/:${ControllerUtils.getParamName<OrganizationId_Params>('organization_id')}/logoutAll`;
const post_login = '/login';
const post_loginAs = '/loginAs';

export default express
  .Router()
  .post(post_login, ApsLoginController.login)
  .post(post_loginAs, ApsLoginController.loginAs)
  .post(post_logout, ApsLoginController.logout)
  .post(post_logoutAll, ApsLoginController.logoutAll)
  .post(post_logoutOrganizationAll, ApsLoginController.logoutOrganizationAll)