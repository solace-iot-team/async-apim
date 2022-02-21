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

import verifyServerStatus from './api/middlewares/verifyServerStatus';

export default function routes(app: Application, apiBase: string): void {
  const router = Router();
  // Public Routes
  // available even if server not operational
  router.use('/apsMonitor', apsMonitorRouter);
  // check that server is ready
  router.use(verifyServerStatus);
  // System Admin routes
  router.use('/apsUsers', apsUsersRouter);
  router.use('/apsLogin', apsLoginRouter);
  router.use('/apsConfig/apsConnectors', apsConnectorRouter);
  router.use('/apsConfig/apsAbout', apsAboutRouter);
  router.use('/apsAdministration/apsOrganizations', apsOrganiztionsRouter);
  // Organization Admin routes
  router.use('/apsBusinessGroups', apsBusinessGroupRouter);
  router.use('/apsExternalSystems', apsExternalSystemsRouter);


  // TODO: Test passport
  // const passport = PassportFactory.build();
  // router.use(passport.initialize());
  // router.use('/*', passport.authenticate(['provider', 'basic'], PassportFactory.getAuthenticationOptions()));
  // router.use('/apsApps')

  app.use(apiBase, router);
}