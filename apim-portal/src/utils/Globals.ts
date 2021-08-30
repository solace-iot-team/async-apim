
// TODO: work this out
export enum EPortalDomainUIPaths {
  AdminPortal = '/admin-portal',
  DeveloperPortal = '/developer-portal'
}

export enum EAdminPortalUIResourcePaths {
  domain
}

export enum EUIResourcePaths {
  AdminPortal = '/admin-portal',
  Home = '/',
  Unauthorized = '/unauthorized',
  NoOrganization = '/noorganization',
  Login = '/login',
  LoginAs = '/loginas',
  UserHome = '/user/home',
  ManageUserAccount = '/manage/user/account',
  ManageOrganizationUsers = '/manage/organization/users',
  ManageOrganizationEnvironments = '/manage/organization/environments',
  ManageSystemUsers = '/manage/system/users',
  ManageSystemTeams = '/manage/system/teams',
  ManageSystemOrganizations = '/manage/system/organizations',
  ManageSystemConfigConnectors = '/manage/system/config/connectors',
  ManageSystemConfigSettings = '/manage/system/config/settings',
  MonitorSystemHealth = '/monitor/system/health',
  DeveloperPortal = '/developer-portal',
  DeveloperPortalHome = '/developer-portal',
  DeveloperPortalUserHome = '/developer-portal/user/home', 
  DeveloperPortalViewProductCatalog = '/developer-portal/view/product-catalog',
  DeveloperPortalManageApplications = '/developer-portal/manage/applications'
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