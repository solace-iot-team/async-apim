import { Application } from 'express';
import Router from 'express';
import apsUsersRouter from './api/controllers/apsUsers/ApsUsersRouter';
import apsLoginRouter from './api/controllers/apsLogin/ApsLoginRouter';
import apsConnectorRouter from './api/controllers/apsConfig/apsConnectors/ApsConnectorsRouter';
import apsAboutRouter from './api/controllers/apsConfig/apsAbout/ApsAboutRouter';
import apsMonitorRouter from './api/controllers/apsMonitor/ApsMonitorRouter';
import verifyServerStatus from './api/middlewares/verifyServerStatus';
import audit from 'express-requests-logger';
import { AuditLogger } from './common/ServerLogger';

export default function routes(app: Application, apiBase: string): void {
  const router = Router();

  // available even if server not operational
  router.use('/apsMonitor', apsMonitorRouter);
  // check that server is ready
  router.use(verifyServerStatus);
  router.use('/apsUsers', apsUsersRouter);
  router.use('/apsLogin', apsLoginRouter);
  router.use('/apsConfig/apsConnectors', apsConnectorRouter);
  router.use('/apsConfig/apsAbout', apsAboutRouter);

  app.use(apiBase, router);
}
