import { EServerStatusCodes, ServerLogger } from '../../common/ServerLogger';
import { AuthenticateOptions } from 'passport';
import APSUsersService from '../services/APSUsersService/APSUsersService';
import APSOrganizationService from '../services/apsAdministration/APSOrganizationsService';
import passport from 'passport';
import jsonPath from 'jsonpath';
import jwtDecode from 'jwt-decode';
import { APSUserId, APSOrganizationRolesList, EAPSOrganizationAuthRole, APSMemberOfOrganizationGroupsList, APSMemberOfOrganizationGroups, EAPSBusinessGroupAuthRole } from '../../../src/@solace-iot-team/apim-server-openapi-node/index';

var OpenIDConnectStrategy = require('passport-openidconnect');

const ENV_PREFIX_EXTRACTOR = 'AUTH_EXTRACTION'
const ENV_PREFIX_VERIFIER = 'AUTH_VERIFICATION'

// const issuer = process.env[`${ENV_PREFIX_VERIFIER}_ISSUER`];
// const aud = process.env[`${ENV_PREFIX_VERIFIER}_AUD`];

// const userPrincipalPath = process.env[`${ENV_PREFIX_EXTRACTOR}_USER_PRINCIPAL`] || '$.upn';
const groupsPath = process.env[`${ENV_PREFIX_EXTRACTOR}_ORGS`] || '$.organizations'
// const rolesPath = process.env[`${ENV_PREFIX_EXTRACTOR}_ROLES`] || '$.resource_access[\'apim-connector\'].roles';
const logName: string = 'passport-authenticate';
export default class PassportFactory {

  private static authOpts: AuthenticateOptions = {
    session: true,
  }

  private static asArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value;
    } else if (typeof value === 'string' || value instanceof String) {
      return value.split(' ');
    } else {
      return [];
    }
  }

  // private static getKey(): string {
  //   const key: string = process.env[`${ENV_PREFIX_VERIFIER}_KEY`] ? process.env[`${ENV_PREFIX_VERIFIER}_KEY`] as string : '';
  //   try {
  //     let keyFile = fs.readFileSync(key, 'utf8');
  //     return keyFile;
  //   } catch (e) {
  //     ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.PROCESSING_ON_EVENT_DELETED, message: `Error loading JWT Signer Public Key from ${key}`, details: e }));
  //     throw new Error('Key not found');
  //   }
  // }
  public static build(): passport.PassportStatic {


    let opts = {
      issuer: 'http://localhost:9090/realms/async-apim',
      authorizationURL: 'http://localhost:9090/realms/async-apim/protocol/openid-connect/auth',
      tokenURL: 'http://localhost:9090/realms/async-apim/protocol/openid-connect/token',
      userInfoURL: 'http://localhost:9090/realms/async-apim/protocol/openid-connect/userinfo',
      clientID: 'async-apim-server',
      clientSecret: 'hdP2dPFYJMD04HNKrCd1KA2FOdyiGmFM',
      callbackURL: 'http://localhost:6060/cb',
      skipUserProfile: false,
      scope: ['profile', 'email'],

    };
    const oidcStrategy = new OpenIDConnectStrategy(opts,
      async function (issuer: any, profile: any, context: any, idToken: any, accessToken: any, refreshToken: any, done: any) {
        refreshToken;
        idToken;
        profile['token'] = accessToken;
        issuer;
        context;
         //      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: "profile", details: profile }));
        //        ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: "issuer", details: issuer }));
        //      ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: "context", details: context }));
        //    ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: "idToken", details: idToken }));
        //        ServerLogger.error(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: "accessToken", details: accessToken }));
        const userId: APSUserId = profile.id;
        const decoded = jwtDecode(accessToken);
        const orgList = (jsonPath.value(decoded, groupsPath) as string[]).filter(s=> s!=='__HEALTH_CHECK_ORG__');
        
        const memberofOrgs: APSOrganizationRolesList = [];
        const memberOfOrganizationGroups: APSMemberOfOrganizationGroupsList = [];
        orgList.forEach(o => {
          memberofOrgs.push({
            organizationId: o,
            roles: [EAPSOrganizationAuthRole.API_CONSUMER]
          });
          memberOfOrganizationGroups.push({
            organizationId: o,
            memberOfBusinessGroupList: [{
              businessGroupId: o,
              roles: [EAPSBusinessGroupAuthRole.API_CONSUMER]
            }]
          });
        });
        for (const o of orgList) {
          try {
            await APSOrganizationService.byId(o);
          } catch (e) {
            await APSOrganizationService.create({
              displayName: o,
              organizationId: o
            });
          }
        }

        try {
          const user = await APSUsersService.byId(userId);
          
          await APSUsersService.update(userId, {
            memberOfOrganizations: memberofOrgs,
          });
          done(null, profile);
        } catch (e) {
          // new user, create in DB
          const user = await APSUsersService.create({
            isActivated: true,
            password: '',
            profile: {
              email: profile.emails.length > 0 ? profile.emails[0].value : '',
              first: profile.name.givenName,
              last: profile.name.familyName
            },
            userId: profile.id,
            memberOfOrganizations: memberofOrgs,
            memberOfOrganizationGroups: memberOfOrganizationGroups,

          });
          done(null, profile);
        }
        done(null, profile);
      }
    );
    passport.use('oidc', oidcStrategy);
    passport.serializeUser(function (user, done) {
      done(null, user);
    });
    passport.deserializeUser(function (user: any, done) {
      done(null, user);
    });
    return passport;
  }

  public static getAuthenticationOptions(): AuthenticateOptions {
    return PassportFactory.authOpts;

  }
}