export enum EAppState {
  ADMIN_PORTAL = 'ADMIN_PORTAL',
  DEVELOPER_PORTAL = 'DEVELOPER_PORTAL',
  UNDEFINED = 'UNDEFINED'
}

export type TLocationStateAppState = {
  setAppState: boolean
}

export type EUICombinedResourcePaths = EUICommonResourcePaths | EUIAdminPortalResourcePaths | EUIDeveloperPortalResourcePaths;

export enum EUICommonResourcePaths {
  Home = '/',
  Unauthorized = '/unauthorized',
  NoOrganization = '/noorganization',
  Login = '/login',
  ManageUserAccount = '/manage/user/account',
}

export enum EUIAdminPortalResourcePaths {
  Home = '/admin-portal',
  UserHome = '/admin-portal/user/home',
  LoginAs = '/admin-portal/loginas',
  ManageOrganizationUsers = '/admin-portal/manage/organization/users',
  ManageOrganizationEnvironments = '/admin-portal/manage/organization/environments',
  ManageSystemUsers = '/admin-portal/manage/system/users',
  ManageSystemTeams = '/admin-portal/manage/system/teams',
  ManageSystemOrganizations = '/admin-portal/manage/system/organizations',
  ManageSystemConfigConnectors = '/admin-portal/manage/system/config/connectors',
  ManageSystemConfigSettings = '/admin-portal/manage/system/config/settings',
  MonitorSystemHealth = '/admin-portal/monitor/system/health',
}

export enum EUIDeveloperPortalResourcePaths {
  Home = '/developer-portal',
  UserHome = '/developer-portal/user/home',
  ViewProductCatalog = '/developer-portal/view/product-catalog',
  ManageUserApplications = '/developer-portal/manage/user/applications',
  ManageTeamApplications = '/developer-portal/manage/team/applications'
}

export enum EUIEmbeddableResourcePaths {
  DeveloperAppConfigure = '/embedabble/developer/app/configure',
  AdminEnvironments = '/embedabble/admin/environments'
}

export enum EUIDeveloperToolsResourcePaths {
  TestRoles = '/devel/roles',
  BootstrapOrganizations = '/devel/bootstrap/organizations',
  BootstrapUsers = '/devel/bootstrap/users',
  BootstrapConnectors = '/devel/bootstrap/connectors',
  ViewContexts = '/devel/view/contexts'
}

export class Globals {

  public static getCurrentHomePath = (isUserLoggedIn: boolean, currentAppState: EAppState): string => {
    const funcName = 'getCurrentHomePath';
    const logName = `${Globals.name}.${funcName}()`;
    if(currentAppState === EAppState.ADMIN_PORTAL) {
      if(isUserLoggedIn) return EUIAdminPortalResourcePaths.UserHome;
      else return EUIAdminPortalResourcePaths.Home;
    }
    else if(currentAppState === EAppState.DEVELOPER_PORTAL) {
      if(isUserLoggedIn) return EUIDeveloperPortalResourcePaths.UserHome;
      else return EUIDeveloperPortalResourcePaths.Home;
    }
    else throw new Error(`${logName}: unknown currentAppState=${currentAppState}`);
  }

  public static getOriginHomePath = (originAppState: EAppState): string => {
    const funcName = 'getOriginHomePath';
    const logName = `${Globals.name}.${funcName}()`;
    if(originAppState === EAppState.ADMIN_PORTAL) return EUIAdminPortalResourcePaths.Home;
    else if(originAppState === EAppState.DEVELOPER_PORTAL) return EUIDeveloperPortalResourcePaths.Home;
    else throw new Error(`${logName}: unknown originAppState=${originAppState}`);
  }

  public static sleep = async(millis = 500) => {
    if(millis > 0) await new Promise(resolve => setTimeout(resolve, millis));
  }

  public static generateDeepObjectValuesString = (source: any, result: string = ''): string => {
    const isObject = (obj:any ) => obj && typeof obj === 'object';

    Object.keys(source).forEach( key => {
      const value = source[key];
      if (Array.isArray(value)) result += Globals.generateDeepObjectValuesString(value);
      else if (isObject(value)) result += Globals.generateDeepObjectValuesString(value);
      else result += value + ',';
    });

    return result;
  }

  public static encodeRFC5987ValueChars = (str: string): string => {
    return encodeURIComponent(str)
    // Note that although RFC3986 reserves "!", RFC5987 does not,
    // so we do not need to escape it
    .replace(/['()]/g, escape) // i.e., %27 %28 %29
    .replace(/\*/g, '%2A')
        // The following are not required for percent-encoding per RFC5987,
        // so we can allow for a little better readability over the wire: |`^
        .replace(/%(?:7C|60|5E)/g, unescape);
  }
}

export class GlobalElementStyles {
  public static breadcrumbLink = (): any => {
    return {
      'text-decoration': 'underline'
    }
  }
}