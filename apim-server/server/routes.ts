import { Application } from 'express';
import Router from 'express';
import examplesRouter from './api/controllers/examples/router';
import apsUsersRouter from './api/controllers/apsUsers/ApsUsersRouter';
import apsLoginRouter from './api/controllers/apsLogin/ApsLoginRouter';
import apsConnectorRouter from './api/controllers/apsConfig/apsConnectors/ApsConnectorsRouter';
import apsAboutRouter from './api/controllers/apsConfig/apsAbout/ApsAboutRouter';
import apsMonitorRouter from './api/controllers/apsMonitor/ApsMonitorRouter';

export default function routes(app: Application, apiBase: string): void {
  const router = Router();

  router.use('/examples', examplesRouter);
  router.use('/apsUsers', apsUsersRouter);
  router.use('/apsLogin', apsLoginRouter);
  router.use('/apsConfig/apsConnectors', apsConnectorRouter);
  router.use('/apsConfig/apsAbout', apsAboutRouter);
  router.use('/apsMonitor', apsMonitorRouter);

  app.use(apiBase, router);
}
