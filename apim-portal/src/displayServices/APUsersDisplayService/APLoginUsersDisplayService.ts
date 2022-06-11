import { APSClientOpenApi } from '../../utils/APSClientOpenApi';
import { 
  ApiError,
  ApsLoginService,
  APSSessionLoginResponse,
  APSSessionRefreshTokenResponse,
  ApsSessionService,
  APSUserLoginCredentials, 
  APSUserResponse, 
  ApsUsersService, 
  APSUserUpdate, 
} from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import APMemberOfService, { TAPMemberOfOrganizationDisplayList } from './APMemberOfService';
import { 
  APUsersDisplayService, 
  IAPUserDisplay, 
} from './APUsersDisplayService';

export type TAPUserLoginCredentials = APSUserLoginCredentials;

export type TAPLoginUserDisplay = IAPUserDisplay & {
  apMemberOfOrganizationDisplayList: TAPMemberOfOrganizationDisplayList;
};

export type TAPSecLoginUserResponse = {
  apLoginUserDisplay: TAPLoginUserDisplay;
  apsApitoken: string;
  lastOrganizationId?: string;
};

class APLoginUsersDisplayService extends APUsersDisplayService {
  private readonly ComponentName = "APLoginUsersDisplayService";

  // public nameOf_ApSystemUserDisplay(name: keyof TAPSystemUserDisplay) {
  //   return name;
  // }

  public create_Empty_ApUserLoginCredentials(): TAPUserLoginCredentials {
    const apUserLoginCredentials: TAPUserLoginCredentials = {
      username: '',
      password: ''
    };
    return apUserLoginCredentials;
  }

  /** create user with roles  */
  private create_ApLoginUserDisplay_From_ApiEntities({ apsUserResponse }: {
    apsUserResponse: APSUserResponse;
  }): TAPLoginUserDisplay {

    const base: IAPUserDisplay = this.create_ApUserDisplay_From_ApiEntities({
      apsUserResponse: apsUserResponse,
    });

    const apMemberOfOrganizationDisplayList: TAPMemberOfOrganizationDisplayList = APMemberOfService.create_ApMemberOfOrganizationDisplayList({
      apsUserResponse: apsUserResponse,
    });

    const apLoginUserDisplay: TAPLoginUserDisplay = {
      ...base,
      apMemberOfOrganizationDisplayList: apMemberOfOrganizationDisplayList,
    }
    return apLoginUserDisplay;
  }

  /** 
   * Create the login user from APSUser instead from APSUserResponse. 
   * Used when root user logs in, cannot get the full APSUserResponse.
   */
  private create_ApLoginUserDisplay_From_ApsUserResponse({ apsUserResponse }: {
    apsUserResponse: APSUserResponse;
  }): TAPLoginUserDisplay {
    const _apsUserResponse: APSUserResponse = {
      ...apsUserResponse,
      memberOfOrganizations: [],
      memberOfOrganizationGroups: [],
      organizationSessionInfoList: []
    }
    return this.create_ApLoginUserDisplay_From_ApiEntities({ 
      apsUserResponse: _apsUserResponse
    });
  }

  public create_Empty_ApLoginUserDisplay(): TAPLoginUserDisplay {
    const base: IAPUserDisplay = super.create_Empty_ApUserDisplay();
    const apLoginUserDisplay: TAPLoginUserDisplay = {
      ...base,
      apMemberOfOrganizationDisplayList: [],
    }
    return apLoginUserDisplay;    
  }

  // ********************************************************************************************************************************
  // APS API calls
  // ********************************************************************************************************************************

  public async apsGet_ApLoginUserDisplay({ userId }:{
    userId: string;
  }): Promise<TAPLoginUserDisplay> {

    const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
      userId: userId
    });

    const apLoginUserDisplay: TAPLoginUserDisplay = this.create_ApLoginUserDisplay_From_ApiEntities({
      apsUserResponse: apsUserResponse,
    });

    return apLoginUserDisplay;
  }

  public async apsUpdate_LastOrganizationId({ userId, lastOrganizationId }:{
    userId: string;
    lastOrganizationId: string;
  }): Promise<void> {
    // const funcName = 'apsUpdate_LastOrganizationId';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const update: APSUserUpdate = {
      lastOrganizationId: lastOrganizationId
    };
    await this.apsUpdate_ApsUserUpdate({ 
      userId: userId,
      apsUserUpdate: update
    });

  }  


  public async apsSecRefreshToken(): Promise<APSSessionRefreshTokenResponse> {
    // const funcName = 'apsSecRefreshToken';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // // test error handling
    // throw new Error(`${logName}: test error handling`);
    try {
      const apsSessionRefreshTokenResponse: APSSessionRefreshTokenResponse = await ApsSessionService.apsRefreshToken();    
      return apsSessionRefreshTokenResponse;
    } catch(e: any) {
      if(APSClientOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 401) {
          const apsSessionRefreshTokenResponse: APSSessionRefreshTokenResponse = {
            success: false,
            token: '',
            userId: '',
          };
          return apsSessionRefreshTokenResponse;
        };
      }
      throw e;
    }
  }

  public async apsSecLogin({ apUserLoginCredentials }:{
    apUserLoginCredentials: TAPUserLoginCredentials;
  }): Promise<TAPSecLoginUserResponse | undefined> {

    let apsSessionLoginResponse: APSSessionLoginResponse | undefined = undefined;
    try {
      const request: APSUserLoginCredentials = {
        username: apUserLoginCredentials.username,
        password: apUserLoginCredentials.password,
      };
      apsSessionLoginResponse = await ApsSessionService.apsLogin({
        requestBody: request
      });
    } catch(e: any) {
      if(APSClientOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 401) return undefined;
      }
      throw e;
    }
    // setup the bearer token on the open api
    APSClientOpenApi.setToken(apsSessionLoginResponse.token);
    // now get the full APSUserResponse
    // Note: it might be the root user, in which case, this will throw an error 404
    try {
      const apLoginUserDisplay: TAPLoginUserDisplay = await this.apsGet_ApLoginUserDisplay({ 
        userId: apUserLoginCredentials.username,
      });  
      return {
        apLoginUserDisplay: apLoginUserDisplay,
        apsApitoken: apsSessionLoginResponse.token,
        lastOrganizationId: apsSessionLoginResponse.lastOrganizationId
      };
    } catch(e: any) {
      if(APSClientOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) {
          const {token, ...rest} = apsSessionLoginResponse;
          const apsUserResponse: APSUserResponse = {
            ...rest,
          };
          return {
            apLoginUserDisplay: this.create_ApLoginUserDisplay_From_ApsUserResponse({
              apsUserResponse: apsUserResponse
            }),
            apsApitoken: apsSessionLoginResponse.token,
            lastOrganizationId: apsSessionLoginResponse.lastOrganizationId,
          };
        }
      }
      throw e;
    }
  }

  public async apsSecLogout(): Promise<void> {
    await ApsSessionService.apsLogout();
  }

  public async apsLogin({ apUserLoginCredentials }:{
    apUserLoginCredentials: TAPUserLoginCredentials;
  }): Promise<TAPLoginUserDisplay | undefined> {
    let apsUserResponse: APSUserResponse | undefined = undefined;
    try {
      const request: APSUserLoginCredentials = {
        username: apUserLoginCredentials.username,
        password: apUserLoginCredentials.password,
      };
      apsUserResponse = await ApsLoginService.login({
        requestBody: request,
      });
    } catch(e: any) {
      if(APSClientOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 401) return undefined;
      }
      throw e;
    }
    // now get the full APSUserResponse
    // Note: it might be the root user, in which case, this will throw an error 404
    try {
      return await this.apsGet_ApLoginUserDisplay({ 
        userId: apUserLoginCredentials.username,
      });  
    } catch(e: any) {
      if(APSClientOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return this.create_ApLoginUserDisplay_From_ApsUserResponse({
          apsUserResponse: apsUserResponse
        });
      }
      throw e;
    }
  }

  public async apsLoginAs({ userId }:{
    userId: string;
  }): Promise<TAPLoginUserDisplay | undefined> {
    // const funcName = 'apsLoginAs';
    // const logName = `${this.ComponentName}.${funcName}()`;

    try {
      const apsUserResponse: APSUserResponse = await ApsLoginService.loginAs({
        requestBody: {
          userId: userId
        }
      });
      const apLoginUserDisplay: TAPLoginUserDisplay = this.create_ApLoginUserDisplay_From_ApiEntities({
        apsUserResponse: apsUserResponse,
      });
      return apLoginUserDisplay;
    } catch(e: any) {
      if(APSClientOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 401) return undefined;
      }
      throw e;
    }
  }

  public async apsLogout({ userId }:{
    userId: string;
  }): Promise<void> {
    // const funcName = 'apsLogout';
    // const logName = `${this.ComponentName}.${funcName}()`;

    await ApsLoginService.logout({ 
      userId: userId
    });

  }

  public async apsLogoutAll(): Promise<void> {
    // const funcName = 'apsLogoutAll';
    // const logName = `${this.ComponentName}.${funcName}()`;

    await ApsLoginService.logoutAll();

  }

  public async apsLogoutOrganizationAll({ organizationId }:{
    organizationId: string;
  }): Promise<void> {
    // const funcName = 'apsLogoutOrganizationAll';
    // const logName = `${this.ComponentName}.${funcName}()`;

    await ApsLoginService.logoutOrganizationAll({
      organizationId: organizationId
    });

  }

  protected async apsUpdate_ApsUserUpdate({
    userId, apsUserUpdate
  }: {
    userId: string;
    apsUserUpdate: APSUserUpdate,
  }): Promise<void> {
    // const funcName = 'apsUpdate_ApsUserUpdate';
    // const logName = `${this.ComponentName}.${funcName}()`;

    await ApsUsersService.updateApsUser({
      userId: userId, 
      requestBody: apsUserUpdate
    });
  }

}

export default new APLoginUsersDisplayService();
