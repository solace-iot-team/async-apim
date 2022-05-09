import express from 'express';
import { ApsSessionController } from './ApsSessionController';

// const post_logout = `/:${ControllerUtils.getParamName<UserId_Params>('user_id')}/logout`;
// const post_logoutAll = '/logoutAll';
// const post_logoutOrganizationAll = `/:${ControllerUtils.getParamName<OrganizationId_Params>('organization_id')}/logoutAll`;
// const post_login = '/login';
// const post_loginAs = '/loginAs';
const get_logout = '/logout';
const get_test = '/test';

export default express
  .Router()
  // .post(post_login, ApsSessionController.login)
  // .post(post_login, passport.authenticate('internal'), ApsSessionController.login)
  // .post(post_login, passport.authenticate(APSAuthStrategyService.getApsStrategyName()), ApsSessionController.login)
  .get(get_logout, ApsSessionController.logout)
  // test Jwt protected route
  .get(get_test, ApsSessionController.test)
  // app.get(`${apiBase}/apsSession/test`, [APSAuthStrategyService.verifyUser_Internal, APSAuthorizationService.withAuthorization], ApsSessionController.test);

