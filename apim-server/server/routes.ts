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

export default function routes(app: Application, apiBase: string): void {
  const router = Router();

  // Public Routes
  // app.get('/login') ==> re-direct to correct login system
  app.post(`${apiBase}/apsSession/login`, passport.authenticate(APSAuthStrategyService.getApsRegisteredAuthStrategyName()), ApsSessionController.login);
  app.get(`${apiBase}/apsSession/refreshToken`, ApsSessionController.refreshToken);

  // available even if server not operational
  router.use('/apsMonitor', apsMonitorRouter);
  // check that server is ready
  router.use(verifyServerStatus);

  // sessions
  router.use('/apsSession', [APSAuthStrategyService.verifyUser_Internal, APSAuthorizationService.withAuthorization], apsSessionRouter);
  // System Admin routes
  router.use('/apsUsers', apsUsersRouter);

  // TODO: remove when finished with session
  router.use('/apsLogin', apsLoginRouter);

  router.use('/apsConfig/apsConnectors', apsConnectorRouter);
  router.use('/apsConfig/apsAbout', apsAboutRouter);
  router.use('/apsAdministration/apsOrganizations', apsOrganiztionsRouter);
  // Organization Admin routes
  router.use('/apsBusinessGroups', apsBusinessGroupRouter);
  router.use('/apsExternalSystems', apsExternalSystemsRouter);

  app.use(apiBase, router);
}