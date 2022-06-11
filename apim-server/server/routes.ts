import { Application } from 'express';
import Router from 'express';
import apsUsersRouter from './api/controllers/apsUsers/ApsUsersRouter';
import apsLoginRouter from './api/controllers/apsLogin/ApsLoginRouter';
import apsConnectorRouter from './api/controllers/apsConfig/apsConnectors/ApsConnectorsRouter';
import apsAboutRouter from './api/controllers/apsConfig/apsAbout/ApsAboutRouter';
import apsMonitorRouter from './api/controllers/apsMonitor/ApsMonitorRouter';
import apsOrganiztionsRouter from './api/controllers/apsAdministration/apsOrganizations/ApsOrganizationsRouter';
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

export default function routes(app: Application, apiBase: string): void {
  const router = Router();

  // Public Routes
  // app.get('/login') ==> re-direct to correct login system
  if(ServerConfig.getAuthConfig().type !== EAuthConfigType.NONE) {
    app.get(`${apiBase}/apsSession/login`, ApsSessionController.getLogin);
    app.post(`${apiBase}/apsSession/login`, passport.authenticate(APSAuthStrategyService.getApsRegisteredAuthStrategyName()), ApsSessionController.login);
    app.get(`${apiBase}/apsSession/refreshToken`, ApsSessionController.refreshToken);
    // app.get(`${apiBase}/apsSession/refreshToken`, passport.session, ApsSessionController.refreshToken);
  }

  // available even if server not operational
  router.use('/apsMonitor', apsMonitorRouter);
  // check that server is ready
  router.use(verifyServerStatus);

  // secure routes
  if(ServerConfig.getAuthConfig().type !== EAuthConfigType.NONE) {
    router.use('/apsSecureTests', [APSAuthStrategyService.verifyUser_Internal, APSAuthorizationService.withAuthorization], ApsSecureTestsRouter);
    router.use('/apsSession', [APSAuthStrategyService.verifyUser_Internal, APSAuthorizationService.withAuthorization], apsSessionRouter);
    router.use('/apsAdministration/apsOrganizations', [APSAuthStrategyService.verifyUser_Internal, APSAuthorizationService.withAuthorization], apsOrganiztionsRouter);
    router.use('/apsBusinessGroups', [APSAuthStrategyService.verifyUser_Internal, APSAuthorizationService.withAuthorization], apsBusinessGroupRouter);
    router.use('/apsConfig/apsConnectors', [APSAuthStrategyService.verifyUser_Internal, APSAuthorizationService.withAuthorization], apsConnectorRouter);
    router.use('/apsExternalSystems', [APSAuthStrategyService.verifyUser_Internal, APSAuthorizationService.withAuthorization], apsExternalSystemsRouter);
    // router.use('/apsUsers', [APSAuthStrategyService.verifyUser_Internal, APSAuthorizationService.withAuthorization], apsUsersRouter);
  }
  // System Admin routes
  router.use('/apsUsers', apsUsersRouter);

  // TODO: remove when finished with session
  router.use('/apsLogin', apsLoginRouter);

  // router.use('/apsConfig/apsConnectors', apsConnectorRouter);
  router.use('/apsConfig/apsAbout', apsAboutRouter);
  // Organization Admin routes
  // router.use('/apsAdministration/apsOrganizations', apsOrganiztionsRouter);
  // router.use('/apsBusinessGroups', apsBusinessGroupRouter);
  // router.use('/apsExternalSystems', apsExternalSystemsRouter);

  app.use(apiBase, router);
}