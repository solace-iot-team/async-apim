import { Application } from 'express';
import Router from 'express';
import apsUsersRouter from './api/controllers/apsUsers/ApsUsersRouter';
import apsUserInfoRouter from './api/controllers/apsUserInfo/ApsUserInfoRouter';
import apsConnectorRouter from './api/controllers/apsConfig/apsConnectors/ApsConnectorsRouter';
import apsAboutRouter from './api/controllers/apsConfig/apsAbout/ApsAboutRouter';
import apsMonitorRouter from './api/controllers/apsMonitor/ApsMonitorRouter';
import apsOrganiztionsRouter from './api/controllers/apsAdministration/apsOrganizations/ApsOrganizationsRouter';
import apsBusinessGroupRouter from './api/controllers/apsOrganization/apsBusinessGroups/ApsBusinessGroupsRouter';
import apsExternalSystemsRouter from './api/controllers/apsOrganization/apsExternalSystems/ApsExternalSystemsRouter';
import PassportFactory from './api/middlewares/passport.authentication';
import verifyServerStatus from './api/middlewares/verifyServerStatus';

import ConnectEnsureLoggedIn from 'connect-ensure-login';
import httpProxy, { ProxyReqCallback, ServerOptions } from 'http-proxy';
import queryString from 'querystring';
import * as http from "http";

const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:9095/v1',
  //changeOrigin: true,
});

const callback: ProxyReqCallback = function (proxyReq: http.ClientRequest,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  options: ServerOptions) {
  const theRequest = req as any;
  res;
  options;
  if (!theRequest.body || !Object.keys(theRequest.body).length) {
    return;
  }

  var contentType = proxyReq.getHeader('Content-Type');
  var bodyData;

  if (contentType === 'application/json') {
    bodyData = JSON.stringify(theRequest.body);
  }

  if (contentType === 'text/plain') {
    bodyData = theRequest.body;
  }
  if (contentType === 'application/x-www-form-urlencoded') {
    bodyData = queryString.stringify(theRequest.body);
  }

  if (bodyData) {
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }



};
proxy.on('proxyReq', callback);
export default function routes(app: Application, apiBase: string): void {
  const router = Router();
  const passport = PassportFactory.build();
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    '/v1', ConnectEnsureLoggedIn.ensureLoggedIn(),
    function (req, res) {
      req.headers.authorization = `Bearer ${(req.user as any).token}`
      proxy.web(req, res, undefined, function (err) {
        console.log(err);
      });
    }
  );
  // Public Routes
  app.get(`/login`, passport.authenticate('oidc', {
    authInfo: true,
    passReqToCallback: false,
    failureMessage: true,
    failWithError: true,
    session: true,

  }));

  app.get('/logout', function (req, res) {
    const logOutURL = `http://localhost:9090/realms/async-apim/protocol/openid-connect/logout?${(req.user as any).token}&post_logout_redirect_uri=http://localhost:3001/`;
    req.logout();
    res.redirect(logOutURL);
  });

  app.get('/cb',
    passport.authenticate('oidc', {
      authInfo: true,
      passReqToCallback: false,
      failureMessage: true,
      failWithError: true,
      session: true,

    }), function (req, res) {
      req.body;
      res.redirect(`http://localhost:3001/`);
    });

  // available even if server not operational
  router.use('/apsMonitor', ConnectEnsureLoggedIn.ensureLoggedIn(), apsMonitorRouter);
  // check that server is ready
  router.use(verifyServerStatus);
  // System Admin routes
  router.use('/apsUsers', ConnectEnsureLoggedIn.ensureLoggedIn(), apsUsersRouter);
  router.use('/apsUserInfo', ConnectEnsureLoggedIn.ensureLoggedIn(), apsUserInfoRouter);
  router.use('/apsConfig/apsConnectors', ConnectEnsureLoggedIn.ensureLoggedIn(), apsConnectorRouter);
  router.use('/apsConfig/apsAbout', ConnectEnsureLoggedIn.ensureLoggedIn(), apsAboutRouter);
  router.use('/apsAdministration/apsOrganizations', ConnectEnsureLoggedIn.ensureLoggedIn(), apsOrganiztionsRouter);
  // Organization Admin routes
  router.use('/apsBusinessGroups', ConnectEnsureLoggedIn.ensureLoggedIn(), apsBusinessGroupRouter);
  router.use('/apsExternalSystems', ConnectEnsureLoggedIn.ensureLoggedIn(), apsExternalSystemsRouter);


  app.use(apiBase, router);
}