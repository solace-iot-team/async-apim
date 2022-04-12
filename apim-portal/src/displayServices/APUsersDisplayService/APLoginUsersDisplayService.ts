import { APSClientOpenApi } from '../../utils/APSClientOpenApi';
import { 
  ApiError,
  ApsLoginService,
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

class APLoginUsersDisplayService extends APUsersDisplayService {
  private readonly ComponentName = "APLoginUsersDisplayService";

  // public nameOf_ApSystemUserDisplay(name: keyof TAPSystemUserDisplay) {
  //   return name;
  // }

  public create_Empty_ApUserLoginCredentials(): TAPUserLoginCredentials {
    const apUserLoginCredentials: TAPUserLoginCredentials = {
      userId: '',
      userPwd: ''
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
  private create_ApLoginUserDisplay_From_ApsUser({ apsUser }: {
    apsUser: APSUserResponse;
  }): TAPLoginUserDisplay {
    const apsUserResponse: APSUserResponse = {
      ...apsUser,
      memberOfOrganizations: [],
      memberOfOrganizationGroups: [],
      organizationSessionInfoList: []
    }
    return this.create_ApLoginUserDisplay_From_ApiEntities({ 
      apsUserResponse: apsUserResponse
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

  public async apsLogin({ apUserLoginCredentials }:{
    apUserLoginCredentials: TAPUserLoginCredentials;
  }): Promise<TAPLoginUserDisplay | undefined> {
    let apsUser: APSUserResponse | undefined = undefined;
    try {
      const request: APSUserLoginCredentials = {
        userId: apUserLoginCredentials.userId,
        userPwd: apUserLoginCredentials.userPwd,
      };
      apsUser = await ApsLoginService.login({
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
        userId: apUserLoginCredentials.userId,
      });  
    } catch(e: any) {
      if(APSClientOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return this.create_ApLoginUserDisplay_From_ApsUser({
          apsUser: apsUser
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