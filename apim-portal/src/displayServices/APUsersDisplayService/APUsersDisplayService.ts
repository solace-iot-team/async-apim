import { DataTableSortOrderType } from 'primereact/datatable';

import { ApiError, Developer, DevelopersService } from '@solace-iot-team/apim-connector-openapi-browser';
import { APClientConnectorOpenApi } from '../../utils/APClientConnectorOpenApi';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
  TAPEntityId, 
  TAPEntityIdList 
} from '../../utils/APEntityIdsService';
import { 
  APSListResponseMeta,
  APSUserProfile, 
  APSUserResponse,
  ApsUsersService,
  APSUserUpdate, 
} from '../../_generated/@solace-iot-team/apim-server-openapi-browser';
import APRbacDisplayService from '../APRbacDisplayService';
import { APSClientOpenApi } from '../../utils/APSClientOpenApi';

export type TAPUserDisplayLazyLoadingTableParameters = {
  isInitialSetting: boolean; // differentiate between first time and subsequent times
  first: number; // index of the first row to be displayed
  rows: number; // number of rows to display per page
  page: number;
  // sortField: (keyof APSUser | keyof APSUserProfile);
  sortField: string;
  sortOrder: DataTableSortOrderType
}

export type TAPUserAuthenticationDisplay = {
  isActivated: boolean;
  password: string;
}

export interface IAPUserDisplay extends IAPEntityIdDisplay {

  apUserProfileDisplay: TAPUserProfileDisplay;

  apUserAuthenticationDisplay: TAPUserAuthenticationDisplay;

  apSystemRoleEntityIdList: TAPEntityIdList;

}
export type TAPUserDisplayList = Array<IAPUserDisplay>;
export type TAPUserDisplayListResponse = APSListResponseMeta & {
  apUserDisplayList: TAPUserDisplayList;
}

export type TAPUserProfileDisplay = IAPEntityIdDisplay & APSUserProfile;

export type TAPCheckUserIdExistsResult = {
  existsInOrganization: boolean;
  exists: boolean;
}

export abstract class APUsersDisplayService {
  private readonly BaseComponentName = "APUsersDisplayService";

  // TODO: re-work to do deep property names generically
  public nameOf(name: keyof IAPUserDisplay) {
    return name;
  }
  public nameOf_ApEntityId(name: keyof TAPEntityId) {
    return `apEntityId.${name}`;
  }
  public nameOf_ApUserProfileDisplay(name: keyof TAPUserProfileDisplay) {
    return `apUserProfileDisplay.${name}`;
  }
  public nameOf_ApUserAuthenticationDisplay(name: keyof TAPUserAuthenticationDisplay) {
    return `apUserAuthenticationDisplay.${name}`;
  }

  protected map_ApFieldName_To_ApsFieldName(apFieldName?: string): string | undefined {
    if(apFieldName === undefined) return undefined;
    if(apFieldName.startsWith('apUserProfileDisplay')) return apFieldName.replace('apUserProfileDisplay.', 'profile.');
    else if(apFieldName.startsWith('apUserAuthenticationDisplay')) return apFieldName.replace('apUserAuthenticationDisplay.', '');
    return apFieldName;
  }

  public map_ApUserDisplayFieldName_To_APSUserFieldName(apUserDisplayFieldName: string): string {
    if(apUserDisplayFieldName.startsWith('apUserProfileDisplay')) return apUserDisplayFieldName.replace('apUserProfileDisplay.', 'profile.');
    else if(apUserDisplayFieldName.startsWith('apUserAuthenticationDisplay')) return apUserDisplayFieldName.replace('apUserAuthenticationDisplay.', '');
    return apUserDisplayFieldName;
  }

  // TODO: re-work to do deep property names generically
  // returns the name as string of the property
  // public getPropertyNameString = <T extends Record<string, unknown>>(obj: T, selector: (x: Record<keyof T, keyof T>) => keyof T): keyof T => {
  //   const keyRecord = Object.keys(obj).reduce((res, key) => {
  //     const typedKey = key as keyof T
  //     res[typedKey] = typedKey
  //     return res
  //   }, {} as Record<keyof T, keyof T>)
  //   return selector(keyRecord)
  // }
  // public getPropertyNameString = <T extends IAPUserDisplay>(obj: T, selector: (x: Record<keyof T, keyof T>) => keyof T): keyof T => {
  //   const keyRecord = Object.keys(obj).reduce((res, key) => {
  //     const typedKey = key as keyof T
  //     res[typedKey] = typedKey
  //     return res
  //   }, {} as Record<keyof T, keyof T>)
  //   return selector(keyRecord)
  // }
  // END: TODO: re-work to do deep property names generically


  public create_Empty_ApUserProfileDisplay(): TAPUserProfileDisplay {
    return {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      email: '',
      first: '',
      last: '',
    }
  }

  public create_Empty_ApUserAutheticationDisplay(): TAPUserAuthenticationDisplay {
    return {
      isActivated: false,
      password: '',
    };
  }

  public create_Empty_ApUserDisplay(): IAPUserDisplay {
    const apUserDisplay: IAPUserDisplay = {
      apEntityId: APEntityIdsService.create_EmptyObject(),
      apUserProfileDisplay: this.create_Empty_ApUserProfileDisplay(),
      apUserAuthenticationDisplay: this.create_Empty_ApUserAutheticationDisplay(),
      apSystemRoleEntityIdList: [],
    };
    return apUserDisplay;
  }

  public create_UserEntityId({apsUserResponse}:{
    apsUserResponse: APSUserResponse;
  }): TAPEntityId {
    return { id: apsUserResponse.userId, displayName: this.create_UserDisplayName(apsUserResponse.profile)};
  }

  public create_UserDisplayName(apsUserProfile: APSUserProfile): string {
    return `${apsUserProfile.first} ${apsUserProfile.last}`;
  }

  protected create_ApUserProfileDisplay({userEntityId, apsUserProfile}:{
    userEntityId: TAPEntityId;
    apsUserProfile: APSUserProfile
  }): TAPUserProfileDisplay {
    const apUserProfileDisplay: TAPUserProfileDisplay = {
      apEntityId: userEntityId,
      email: apsUserProfile.email,
      first: apsUserProfile.first,
      last: apsUserProfile.last
    };
    return apUserProfileDisplay;
  }
  protected create_ApUserAuthenticationDisplay({apsUserResponse}:{
    apsUserResponse: APSUserResponse;
  }): TAPUserAuthenticationDisplay {
    const apUserAuthenticationDisplay: TAPUserAuthenticationDisplay = {
      isActivated: apsUserResponse.isActivated,
      password: '***',
    };
    return apUserAuthenticationDisplay;
  }
  protected create_ApUserDisplay_From_ApiEntities({apsUserResponse}: {
    apsUserResponse: APSUserResponse;
  }): IAPUserDisplay {
    const userEntityId: TAPEntityId = this.create_UserEntityId({ apsUserResponse: apsUserResponse});
    const base: IAPUserDisplay = {
      apEntityId: userEntityId,
      apUserProfileDisplay: this.create_ApUserProfileDisplay({ userEntityId: userEntityId, apsUserProfile: apsUserResponse.profile}),
      apUserAuthenticationDisplay: this.create_ApUserAuthenticationDisplay({ apsUserResponse: apsUserResponse }),
      apSystemRoleEntityIdList: APRbacDisplayService.create_SystemRoles_EntityIdList(apsUserResponse.systemRoles),
    };
    return base;
  }

  public get_ApUserProfileDisplay({apUserDisplay}: {
    apUserDisplay: IAPUserDisplay;
  }): TAPUserProfileDisplay {
    return apUserDisplay.apUserProfileDisplay;
  }

  protected set_ApUserProfileDisplay({ apUserDisplay, apUserProfileDisplay }: {
    apUserDisplay: IAPUserDisplay;
    apUserProfileDisplay: TAPUserProfileDisplay;
  }): IAPUserDisplay {
    apUserDisplay.apEntityId = apUserProfileDisplay.apEntityId;
    apUserDisplay.apUserProfileDisplay = apUserProfileDisplay;
    return apUserDisplay;
  }

  public get_ApUserAuthenticationDisplay({ apUserDisplay}: {
    apUserDisplay: IAPUserDisplay;
  }): TAPUserAuthenticationDisplay {
    return apUserDisplay.apUserAuthenticationDisplay;
  }

  protected set_ApUserAuthenticationDisplay({ apUserDisplay, apUserAuthenticationDisplay }: {
    apUserDisplay: IAPUserDisplay;
    apUserAuthenticationDisplay: TAPUserAuthenticationDisplay;
  }): IAPUserDisplay {
    apUserDisplay.apUserAuthenticationDisplay = apUserAuthenticationDisplay;
    return apUserDisplay;
  }

  public get_isActivated({ apUserDisplay }: {
    apUserDisplay: IAPUserDisplay;
  }): boolean {
    return apUserDisplay.apUserAuthenticationDisplay.isActivated;
  }

  public set_isActivated({ apUserDisplay, isActivated }: {
    apUserDisplay: IAPUserDisplay;
    isActivated: boolean;
  }): IAPUserDisplay {
    apUserDisplay.apUserAuthenticationDisplay.isActivated = isActivated;
    return apUserDisplay;
  }

  private is_ApsUserMemberOfOrganization({ organizationId, apsUserResponse }: {
    organizationId: string;
    apsUserResponse: APSUserResponse;
  }): boolean {
    if(apsUserResponse.memberOfOrganizations === undefined) return false;
    const found = apsUserResponse.memberOfOrganizations.find( (x) => {
      return x.organizationId === organizationId;
    });
    return found !== undefined;
  }

  // ********************************************************************************************************************************
  // APS API calls
  // ********************************************************************************************************************************

  public async apsCheck_UserIdExists({userId, organizationId}: {
    organizationId: string;
    userId: string;
  }): Promise<TAPCheckUserIdExistsResult> {
    // const funcName = 'apsCheck_UserIdExists';
    // const logName = `${this.BaseComponentName}.${funcName}()`;
    try {
      // throw new Error(`${logName}: test error handling upstream`);
      const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
        userId: userId
      });
      return {
        exists: true,
        existsInOrganization: this.is_ApsUserMemberOfOrganization({ organizationId: organizationId, apsUserResponse: apsUserResponse})
      }
     } catch(e: any) {
      if(APSClientOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status === 404) return { exists: false, existsInOrganization: false };
      }
      throw e;
    }
  }

  public async connectorGet_Developer({ organizationId, userId}: {
    organizationId: string;
    userId: string;
  }): Promise<Developer | undefined> {
    try {
      const connectorDeveloper: Developer = await DevelopersService.getDeveloper({
        organizationName: organizationId, 
        developerUsername: userId
      });
      return connectorDeveloper;
    } catch(e: any) {
      if(APClientConnectorOpenApi.isInstanceOfApiError(e)) {
        const apiError: ApiError = e;
        if(apiError.status !== 404) throw e;
      } else throw e; 
    }
    return undefined;
  }

  protected abstract apsUpdate_ApsUserUpdate({ userId, apsUserUpdate }: {
    userId: string;
    apsUserUpdate: APSUserUpdate,
  }): Promise<void>;

  public async apsUpdate_ApUserProfileDisplay({ apUserProfileDisplay }: {
    apUserProfileDisplay: TAPUserProfileDisplay,
  }): Promise<void> {
    // const funcName = 'apsUpdate_ApUserProfileDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    const update: APSUserUpdate = {
      profile: {
        email: apUserProfileDisplay.email,
        first: apUserProfileDisplay.first,
        last: apUserProfileDisplay.last,
      }
    }
    await this.apsUpdate_ApsUserUpdate({ 
      userId: apUserProfileDisplay.apEntityId.id,
      apsUserUpdate: update
    });
  }

  public async apsUpdate_ApUserAuthenticationDisplay({ userId, apUserAuthenticationDisplay }: {
    userId: string;
    apUserAuthenticationDisplay: TAPUserAuthenticationDisplay;
  }): Promise<void> {
    // const funcName = 'apsUpdate_ApUserAuthenticationDisplay';
    // const logName = `${this.BaseComponentName}.${funcName}()`;

    const update: APSUserUpdate = {
      password: apUserAuthenticationDisplay.password
    }
    await this.apsUpdate_ApsUserUpdate({ 
      userId: userId,
      apsUserUpdate: update
    });
  }

}
