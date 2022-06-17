import { Application } from 'express';
import Router from 'express';
import apsUsersRouter from './api/controllers/apsUsers/ApsUsersRouter';
import apsConnectorRouter from './api/controllers/apsConfig/apsConnectors/ApsConnectorsRouter';
import apsAboutRouter from './api/controllers/apsConfig/apsAbout/ApsAboutRouter';
import apsMonitorRouter from './api/controllers/apsMonitor/ApsMonitorRouter';
import apsOrganiztionsRouter from './api/controllers/apsAdministration/apsOrganizations/ApsOrganizationsRouter';
import apsServiceAccountsRouter from './api/controllers/apsAdministration/apsServiceAccounts/ApsServiceAccountsRouter';
import apsBusinessGroupRouter from './api/controllers/apsOrganization/apsBusinessGroups/ApsBusinessGroupsRouter';
import apsExternalSystemsRouter from './api/controllers/apsOrganization/apsExternalSystems/ApsExternalSystemsRouter';
import apsSessionRouter from './api/controllers/apsSession/ApsSessionRouter';
import verifyServerStatus from './api/middlewares/verifyServerStatus';
import passport from 'passport';
import { ApsSessionController } from './api/controllers/apsSession/ApsSessionController';
import APSAuthStrategyService from './common/authstrategies/APSAuthStrategyService';
import { APSAuthorizationService } from './common/authstrategies/APSAuthorizationService';
import ServerConfig, { EAuthConfigType } from './common/ServerConfig';
import ApsSecureTestsRouter from './api/controllers/apsSecureTests/ApsSecureTestsRouter';
import { ApsConnectorsController } from './api/controllers/apsConfig/apsConnectors/ApsConnectorsController';
import { ApsConnectorProxyController } from './api/controllers/ApsConnectorProxyController';

export default function routes(app: Application, apiBase: string): void {
  const router = Router();

  // proxy the connector
  app.use(
    `${apiBase}/connectorProxy/v1`, 
    APSAuthStrategyService.verify_Internal,
    ApsConnectorProxyController.all
  );

  // Public Routes
  // app.get('/login') ==> re-direct to correct login system
  if(ServerConfig.getAuthConfig().type === EAuthConfigType.INTERNAL) {
    app.get(`${apiBase}/apsSession/login`, ApsSessionController.getLogin);
    app.post(`${apiBase}/apsSession/login`, passport.authenticate(APSAuthStrategyService.getApsRegisteredAuthStrategyName()), ApsSessionController.login);
    app.get(`${apiBase}/apsSession/refreshToken`, ApsSessionController.refreshToken);
  }

  // available even if server not operational
  router.use('/apsMonitor', apsMonitorRouter);
  // check that server is ready
  router.use(verifyServerStatus);
  // public routes
  app.get(`${apiBase}/apsConfig/apsConnectors/active`, ApsConnectorsController.byActive);
  router.use('/apsConfig/apsAbout', apsAboutRouter);

  // secure routes
  if(ServerConfig.getAuthConfig().type === EAuthConfigType.INTERNAL) {
    router.use('/apsSecureTests', [APSAuthStrategyService.verify_Internal, APSAuthorizationService.withAuthorization], ApsSecureTestsRouter);
    router.use('/apsSession', [APSAuthStrategyService.verify_Internal, APSAuthorizationService.withAuthorization], apsSessionRouter);
    router.use('/apsAdministration/apsServiceAccounts', [APSAuthStrategyService.verify_Internal, APSAuthorizationService.withAuthorization], apsServiceAccountsRouter);
    router.use('/apsAdministration/apsOrganizations', [APSAuthStrategyService.verify_Internal, APSAuthorizationService.withAuthorization], apsOrganiztionsRouter);
    router.use('/apsBusinessGroups', [APSAuthStrategyService.verify_Internal, APSAuthorizationService.withAuthorization], apsBusinessGroupRouter);
    router.use('/apsConfig/apsConnectors', [APSAuthStrategyService.verify_Internal, APSAuthorizationService.withAuthorization], apsConnectorRouter);
    router.use('/apsExternalSystems', [APSAuthStrategyService.verify_Internal, APSAuthorizationService.withAuthorization], apsExternalSystemsRouter);
    router.use('/apsUsers', [APSAuthStrategyService.verify_Internal, APSAuthorizationService.withAuthorization], apsUsersRouter);
  }
  // router.use('/apsAdministration/apsOrganizations', apsOrganiztionsRouter);
  // router.use('/apsBusinessGroups', apsBusinessGroupRouter);
  // router.use('/apsConfig/apsConnectors', apsConnectorRouter);
  // router.use('/apsExternalSystems', apsExternalSystemsRouter);
  // router.use('/apsUsers', apsUsersRouter);

  app.use(apiBase, router);
}