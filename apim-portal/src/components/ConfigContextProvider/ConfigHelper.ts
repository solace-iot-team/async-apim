import { ConfigContextAction, TAPConfigContext  } from './ConfigContextProvider';
import { APRbac, EAPRbacRoleScope, TAPRbacRole, TAPRbacRoleList } from '../../utils/APRbac';
import { ApiCallState, TApiCallState } from '../../utils/ApiCallState';
import { 
  ApsConfigService,
  APSConnector, 
  ApiError as APSApiError,
  EAPSSystemAuthRole,
  APSUserResponse,
  APSSystemAuthRoleList,
  APSOrganizationAuthRoleList,
  APSOrganizationRoles,
  EAPSOrganizationAuthRole,
  ApsMonitorService,
  APSConnectorStatus,
} from "../../_generated/@solace-iot-team/apim-server-openapi-browser";
import { APSClientOpenApi } from '../../utils/APSClientOpenApi';
import { TAPPortalAppInfo } from '../../utils/Globals';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import { APortalAppApiCalls, E_APORTAL_APP_CALL_STATE_ACTIONS } from '../../utils/APortalApiCalls';
import { About } from '@solace-iot-team/apim-connector-openapi-browser';

export type TRoleSelectItem = { label: string, value: EAPSOrganizationAuthRole };
export type TRoleSelectItemList = Array<TRoleSelectItem>;

export class ConfigHelper {

  public static createOrganizationRolesSelectItems = (configContext: TAPConfigContext): TRoleSelectItemList => {
    const rbacScopeList: Array<EAPRbacRoleScope> = [EAPRbacRoleScope.ORGANIZATION];
    const rbacRoleList: TAPRbacRoleList = ConfigHelper.getSortedAndScopedRbacRoleList(configContext, rbacScopeList);
    const selectItems: TRoleSelectItemList = [];
    rbacRoleList.forEach( (rbacRole: TAPRbacRole) => {
      selectItems.push({
        label: rbacRole.displayName,
        value: rbacRole.id as EAPSOrganizationAuthRole
      });
    });
    return selectItems; 
  }

  public static getSortedAndScopedRbacRoleList = (configContext: TAPConfigContext, rbacScopeList: Array<EAPRbacRoleScope>): TAPRbacRoleList => {
    let rbacRoleList: TAPRbacRoleList = [];
    for(const rbacRole of configContext.rbacRoleList) {
      if(!rbacRole.scopeList.includes(EAPRbacRoleScope.NEVER)) {
        for(const scope of rbacScopeList) {
          const exists = rbacRoleList.find( (role: TAPRbacRole) => {
            return role.id === rbacRole.id;
          });
          if(!exists && rbacRole.scopeList.includes(scope)) rbacRoleList.push(rbacRole);
        }
      } 
    }
    return rbacRoleList.sort( (e1: TAPRbacRole, e2: TAPRbacRole) => {
      if(e1.displayName < e2.displayName) return -1;
      if(e1.displayName > e2.displayName) return 1;
      return 0;
    });
  }

  public static getSortedRbacRoleList = (configContext: TAPConfigContext): TAPRbacRoleList => {
    let rbacRoleList: TAPRbacRoleList = [];
    configContext.rbacRoleList.forEach( (rbacRole: TAPRbacRole) => {
      // if(rbacRole.id !== EAPSSystemAuthRole.ROOT) rbacRoleList.push(rbacRole);
      if(!rbacRole.scopeList.includes(EAPRbacRoleScope.NEVER)) rbacRoleList.push(rbacRole);
    });
    return rbacRoleList.sort( (e1: TAPRbacRole, e2: TAPRbacRole) => {
      if(e1.displayName < e2.displayName) return -1;
      if(e1.displayName > e2.displayName) return 1;
      return 0;
    });
  }

  public static getAuthorizedSystemRolesDisplayNameList = (configContext: TAPConfigContext, systemRoles?: APSSystemAuthRoleList): Array<string> => {
    const funcName = 'getAuthorizedSystemRolesDisplayNameList';
    const logName = `${ConfigHelper.name}.${funcName}()`;

    const systemRolesDisplayNameList: Array<string> = [];
    const rbacRoleList: TAPRbacRoleList = ConfigHelper.getSortedRbacRoleList(configContext);
    systemRoles?.forEach((apsSystemAuthRole: EAPSSystemAuthRole) => {
      const rbacRole: TAPRbacRole | undefined = rbacRoleList.find((rbacRole: TAPRbacRole) => {
        return (rbacRole.id === apsSystemAuthRole)
      });
      if(rbacRole) systemRolesDisplayNameList.push(rbacRole.displayName);
      else throw new Error(`${logName}: cannot find configured role for authorized role=${apsSystemAuthRole}`);
    });
    return systemRolesDisplayNameList;
  }

  public static getAuthorizedOrgRolesDisplayNameList = (configContext: TAPConfigContext, orgRoles?: APSOrganizationAuthRoleList): Array<string> => {
    const funcName = 'getAuthorizedOrgRolesDisplayNameList';
    const logName = `${ConfigHelper.name}.${funcName}()`;

    const orgRolesDisplayNameList: Array<string> = [];
    const rbacRoleList: TAPRbacRoleList = ConfigHelper.getSortedRbacRoleList(configContext);
    orgRoles?.forEach((apsOrgAuthRole: EAPSOrganizationAuthRole) => {
      const rbacRole: TAPRbacRole | undefined = rbacRoleList.find((rbacRole: TAPRbacRole) => {
        return (rbacRole.id === apsOrgAuthRole)
      });
      if(rbacRole) orgRolesDisplayNameList.push(rbacRole.displayName);
      else throw new Error(`${logName}: cannot find configured role for authorized role=${apsOrgAuthRole}`);
    });
    return orgRolesDisplayNameList;
  }

  public static getAuthorizedRolesDisplayNameList = (configContext: TAPConfigContext, apsUser: APSUserResponse, orgId: string | undefined): Array<string> => {
    const funcName = 'getAuthorizedRolesDisplayNameList';
    const logName = `${ConfigHelper.name}.${funcName}()`;
    
    let rbacRoleList: TAPRbacRoleList = ConfigHelper.getSortedRbacRoleList(configContext);
    let authorizedRolesDisplayNameList: Array<string> = [];

    const systemRoles: APSSystemAuthRoleList = apsUser.systemRoles ? apsUser.systemRoles : [];
    let organizationRoles: APSOrganizationAuthRoleList = [];
    if(orgId) {
      const found = apsUser.memberOfOrganizations?.find((memberOfOrganization: APSOrganizationRoles) => {
        return (memberOfOrganization.organizationId === orgId)
      });
      if(!found) throw new Error(`${logName}: cannot find orgId=${orgId} in apsUser.memberOfOrganizations=${JSON.stringify(apsUser.memberOfOrganizations, null, 2)}`);
      organizationRoles = found.roles;
    }
    const authorizedRoleList: Array<string> = (systemRoles as Array<string>).concat(organizationRoles);

    authorizedRoleList.forEach( (authorizedRole: string) => {
      let rbacRole: TAPRbacRole | undefined = rbacRoleList.find((rbacRole: TAPRbacRole) => {
        return (rbacRole.id === authorizedRole)
      });
      if(rbacRole) authorizedRolesDisplayNameList.push(rbacRole.displayName);
      else throw new Error(`${logName}: cannot find configured role for authorized role=${authorizedRole}`);
    });
    if(authorizedRolesDisplayNameList.length === 0) return ['None'];
    return authorizedRolesDisplayNameList;
  }

  public static apiGetActiveConnectorInstance = async(): Promise<APSConnector | undefined> => {
    const funcName: string = `apiGetActiveConnectorInstance`;
    const logName: string = `${ConfigHelper.name}.${funcName}()`
    let callState: TApiCallState = ApiCallState.getInitialCallState(logName, `get active connector config`);
    try {
      try {
        const activeConnector: APSConnector = await ApsConfigService.getActiveApsConnector();
        return activeConnector;
      } catch (e: any) {
        if(APSClientOpenApi.isInstanceOfApiError(e)) {
          const apiError: APSApiError = e;
          APSClientOpenApi.logError(logName, e);
          if (apiError.status === 404) {
            return undefined;
          } else throw e;
        } else throw e;
      }
    } catch(e: any) {
      APSClientOpenApi.logError(logName, e);
      callState.success = false;
      callState.isAPSApiError = APSClientOpenApi.isInstanceOfApiError(e);
      callState.error = e;
    }
  }

  private static getConfigRbacRoleList = async(): Promise<TAPRbacRoleList> => {
    APRbac.checkRoleDefinitions();
    const configRbacRoleList: TAPRbacRoleList = APRbac.getAPRbacRoleList();
    return configRbacRoleList;
  }

  private static getActiveConnectorInstance = async(): Promise<APSConnector | undefined> => {
    const activeApsConnector: APSConnector | undefined = await ConfigHelper.apiGetActiveConnectorInstance();
    return activeApsConnector;
  }

  private static getPortalAppInfo = async(): Promise<TAPPortalAppInfo>  => {
    const adminPortalAppResult = await APortalAppApiCalls.apiGetPortalAppAbout(E_APORTAL_APP_CALL_STATE_ACTIONS.API_GET_ADMIN_PORTAL_APP_ABOUT);
    // get the connector status & about for active connector
    const apsConnectorStatus: APSConnectorStatus = await ApsMonitorService.getApsConnectorStatus({ optionalConnectorId: undefined });
    const connectorAbout: About = apsConnectorStatus.connectorAbout as About;
    const apPortalAppInfo: TAPPortalAppInfo = {
      connectorClientOpenApiInfo: APClientConnectorOpenApi.getOpenApiInfo(),
      portalAppServerClientOpenApiInfo: APSClientOpenApi.getOpenApiInfo(),
      adminPortalAppAbout: adminPortalAppResult.apPortalAppAbout,
      // TODO: FIX_ME
      // eventPortalVersion: connectorAbout.EVENT_PORTAL_VERSION === "2" ? EEventPortalVersion.VERSION_2 : EEventPortalVersion.VERSION_1,
      eventPortalVersion: connectorAbout.EVENT_PORTAL_VERSION === undefined ? About.EVENT_PORTAL_VERSION._1 : connectorAbout.EVENT_PORTAL_VERSION,
      // eventPortalVersion: EEventPortalVersion.VERSION_2,
    };
    return apPortalAppInfo;
  }

  public static getEmptyContext = (): TAPConfigContext => {
    return {
      isInitialized: false,
      rbacRoleList: []
    };
  }

  public static doInitialize = async (dispatchConfigContextAction: React.Dispatch<ConfigContextAction>) => {
    // const funcName: string = `doInitialize`;
    // const logName: string = `${ConfigHelper.name}.${funcName}()`

    const apPortalAppInfo = await ConfigHelper.getPortalAppInfo();
    const rbacRoleList = await ConfigHelper.getConfigRbacRoleList();
    const connector = await ConfigHelper.getActiveConnectorInstance();

    // console.log(`${logName}: portalAppInfo=${JSON.stringify(portalAppInfo, null, 2)}`);

    dispatchConfigContextAction( { type: 'UPDATE_CONFIG_CONTEXT', configContext: {
      portalAppInfo: apPortalAppInfo,
      rbacRoleList: rbacRoleList,
      connector: connector
    }});
    dispatchConfigContextAction( { type: 'SET_IS_INITIALIZED', isInitialized: true });
  }

}