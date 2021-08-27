import { Application } from 'express';
import Router from 'express';
import examplesRouter from './api/controllers/examples/router';
import apsUsersRouter from './api/controllers/apsUsers/ApsUsersRouter';
import apsLoginRouter from './api/controllers/apsLogin/ApsLoginRouter';
import apsConnectorRouter from './api/controllers/apsConfig/apsConnectors/ApsConnectorsRouter';

export default function routes(app: Application, apiBase: string): void {
  const router = Router();

  router.use('/examples', examplesRouter);
  router.use('/apsUsers', apsUsersRouter);
  router.use('/apsLogin', apsLoginRouter);
  router.use('/apsConfig/apsConnectors', apsConnectorRouter);

  app.use(apiBase, router);
}
