import { ApiError, App, AppsService, Developer, DevelopersService } from '@solace-iot-team/apim-connector-openapi-browser';
import { TViewAPSOrganizationRolesList } from '../admin-portal/components/ManageUsers/ManageUsersCommon';
import { APClientConnectorOpenApi } from '../utils/APClientConnectorOpenApi';
import { IAPEntityIdDisplay, TAPEntityId, TAPEntityIdList } from '../utils/APEntityIdsService';
import { APOrganizationsService } from '../utils/APOrganizationsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import { 
  APSMemberOfOrganizationGroups,
  APSUserProfile, 
  APSUserResponse, 
  ApsUsersService, 
} from '../_generated/@solace-iot-team/apim-server-openapi-browser';
import APBusinessGroupsDisplayService, { TAPBusinessGroupDisplay } from './APBusinessGroupsDisplayService';
import APRbacDisplayService from './APRbacDisplayService';
import APAssetDisplayService, { TAPOrganizationAssetInfoDisplayList } from './APAssetsDisplayService';

// export enum EAPAssetTypeDisplay {
//   DEVELOPER_APP = "DEVELOPER_APP"
// }
// export type TAPUserAssetInfoDisplay = {
//   apAssetTypeDisplay: EAPAssetTypeDisplay;
//   apAssetEntityId: TAPEntityId;
//   apOrganizationEntityId: TAPEntityId;
// }
// export type TAPUserAssetInfoDisplayList = Array<TAPUserAssetInfoDisplay>;

// export type xTAPMemberOfBusinessGroupDisplay = APSMemberOfBusinessGroup & {
//   apBusinessGroupDisplay: TAPBusinessGroupDisplay;
// }
export type TAPMemberOfBusinessGroupDisplay =  {
  apBusinessGroupDisplay: TAPBusinessGroupDisplay;
  apBusinessGroupRoleEntityIdList: TAPEntityIdList;
}
export type TAPMemberOfBusinessGroupDisplayList = Array<TAPMemberOfBusinessGroupDisplay>;

export type TAPMemberOfOrganizationGroupsDisplay = {
  apOrganizationEntityId: TAPEntityId;
  apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList;
}
export type TAPMemberOfOrganizationGroupsDisplayList = Array<TAPMemberOfOrganizationGroupsDisplay>;

export type TAPUserDisplay = IAPEntityIdDisplay & IAPSearchContent & {
  apsUserResponse: APSUserResponse;

  apSystemRoleEntityIdList: TAPEntityIdList;

  apMemberOfOrganizationNameListAsString: string;

  apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList;

  apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList;


  deprecated_viewMemberOfOrganizations: TViewAPSOrganizationRolesList;
  // apMemberOfGroups ... 
}
export type TAPUserDisplayList = Array<TAPUserDisplay>;

class APUsersDisplayService {
  private readonly BaseComponentName = "APUsersDisplayService";

  private create_EmptyProfile(): APSUserProfile {
    return {
      first: '',
      last: '',
      email: ''
    };
  }
  private create_EmptyApsUserResponse(): APSUserResponse {
    return {
      isActivated: false,
      userId: '',
      password: '',
      profile: this.create_EmptyProfile(),
    };
  }

  public create_EmptyObject(): TAPUserDisplay {
    return this.create_ApUserDisplay_From_ApiEntities({
      apsUserResponse: this.create_EmptyApsUserResponse(),
      apOrganizationAssetInfoDisplayList: [],
      apMemberOfOrganizationGroupsDisplayList: []
    });
  }

  private createUserDisplayName(apsUserProfile: APSUserProfile): string {
    return `${apsUserProfile.first} ${apsUserProfile.last}`;
  }
  protected create_ApUserDisplay_From_ApiEntities({apsUserResponse, apOrganizationAssetInfoDisplayList, apMemberOfOrganizationGroupsDisplayList}: {
    apsUserResponse: APSUserResponse;
    apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList;
    apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList
  }): TAPUserDisplay {

    const base: TAPUserDisplay = {
      apEntityId: {
        id: apsUserResponse.userId,
        displayName: this.createUserDisplayName(apsUserResponse.profile)
      },
      apsUserResponse: apsUserResponse,
      apSystemRoleEntityIdList: APRbacDisplayService.getSystemRolesEntityIdList(apsUserResponse.systemRoles),
      apMemberOfOrganizationNameListAsString: 'todo',
      apOrganizationAssetInfoDisplayList: apOrganizationAssetInfoDisplayList,
      apMemberOfOrganizationGroupsDisplayList: apMemberOfOrganizationGroupsDisplayList,
      deprecated_viewMemberOfOrganizations: [],
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<TAPUserDisplay>(base);
  }

  public find_ApMemberOfBusinessGroupDisplayList({organizationId, apUserDisplay }: {
    organizationId: string;
    apUserDisplay: TAPUserDisplay;
  }): TAPMemberOfBusinessGroupDisplayList {
    const funcName = 'find_ApMemberOfBusinessGroupDisplayList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const found = apUserDisplay.apMemberOfOrganizationGroupsDisplayList.find( (x) => {
      return x.apOrganizationEntityId.id === organizationId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    return found.apMemberOfBusinessGroupDisplayList;
  }
  
  private async get_ApMemberOfBusinessGroupDisplayList({organizationId, apsUserResponse }: {
    organizationId: string;
    apsUserResponse: APSUserResponse;
  }): Promise<TAPMemberOfBusinessGroupDisplayList> {
    const funcName = 'get_ApMemberOfBusinessGroupDisplayList';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    const found = apsUserResponse.memberOfOrganizationGroups?.find( (x: APSMemberOfOrganizationGroups) => {
      return x.organizationId === organizationId;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    const apMemberOfBusinessGroupDisplayList: TAPMemberOfBusinessGroupDisplayList = [];
    for(const apsMemberOfBusinessGroup of found.memberOfBusinessGroupList) {
      const apBusinessGroupDisplay: TAPBusinessGroupDisplay = await APBusinessGroupsDisplayService.getApBusinessGroupDisplay({
        organizationId: organizationId,
        businessGroupId: apsMemberOfBusinessGroup.businessGroupId
      });
      apMemberOfBusinessGroupDisplayList.push({
        // businessGroupId: apsMemberOfBusinessGroup.businessGroupId,
        apBusinessGroupDisplay: apBusinessGroupDisplay,
        apBusinessGroupRoleEntityIdList: APRbacDisplayService.getBusinessGroupRolesEntityIdList(apsMemberOfBusinessGroup.roles)
      });
    }
    return apMemberOfBusinessGroupDisplayList;
  }

  public async getConnectorUser({ organizationId, userId}: {
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

  private async getUserAssetList({apsUserResponse, organizationId}: {
    apsUserResponse: APSUserResponse;
    organizationId?: string;
  }): Promise<TAPOrganizationAssetInfoDisplayList> {
    const funcName = 'getUserAssetList';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // create the org list
    let organizationIdList: Array<string> = [];
    if(organizationId !== undefined) {
      // one org only
      const found = apsUserResponse.memberOfOrganizationGroups?.find( (apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups) => {
        return apsMemberOfOrganizationGroups.organizationId === organizationId;
      });
      if(found === undefined) throw new Error(`${logName}: cannot find organizationId=${organizationId} in apsUserResponse.memberOfOrganizationGroups=${JSON.stringify(apsUserResponse.memberOfOrganizationGroups, null, 2)}`);
      organizationIdList.push(found.organizationId);
    } else {
      // all orgs
      const list = apsUserResponse.memberOfOrganizationGroups?.map( (apsMemberOfOrganizationGroups: APSMemberOfOrganizationGroups) => {
        return apsMemberOfOrganizationGroups.organizationId;
      });
      if(list !== undefined) organizationIdList = list;
    }
    const organizationEntityIdList: TAPEntityIdList = await APOrganizationsService.listOrganizationEntityIdList_For_OrganizationIdList({
      organizationIdList: organizationIdList
    });

    const apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList = await APAssetDisplayService.getApAssetInfoListForUser({
      organizationEntityIdList: organizationEntityIdList,
      userId: apsUserResponse.userId
    });
    return apOrganizationAssetInfoDisplayList;
  }

  public async getApUserDisplay({ userId, organizationId }: {
    userId: string;
    organizationId?: string;
  }): Promise<TAPUserDisplay> {
    const funcName = 'getApUserDisplay';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    const apsUserResponse: APSUserResponse = await ApsUsersService.getApsUser({
      userId: userId
    });
    const apOrganizationAssetInfoDisplayList: TAPOrganizationAssetInfoDisplayList = await this.getUserAssetList({
      apsUserResponse: apsUserResponse,
      organizationId: organizationId
    });
    const apOrganizationEntityIdList: TAPEntityIdList = await APOrganizationsService.listOrganizationEntityIdList();
    const apMemberOfOrganizationGroupsDisplayList: TAPMemberOfOrganizationGroupsDisplayList = [];
    if(apsUserResponse.memberOfOrganizationGroups !== undefined) {
      for(const apsMemberOfOrganizationGroups of apsUserResponse.memberOfOrganizationGroups) {
        const organizationEntityId: TAPEntityId | undefined = apOrganizationEntityIdList.find( (x) => {
          return x.id === apsMemberOfOrganizationGroups.organizationId;
        });
        if(organizationEntityId === undefined) throw new Error(`${logName}: organizationEntityId === undefined`);

        apMemberOfOrganizationGroupsDisplayList.push({
          apOrganizationEntityId: organizationEntityId,
          apMemberOfBusinessGroupDisplayList: await this.get_ApMemberOfBusinessGroupDisplayList({
            organizationId: organizationEntityId.id,
            apsUserResponse: apsUserResponse
          })
        });


        // for(const apsMemberOfBusinessGroup of apsMemberOfOrganizationGroups.memberOfBusinessGroupList) {
        //   apMemberOfOrganizationGroupsDisplayList.push({
        //     apOrganizationEntityId: organizationEntityId,
        //     apMemberOfBusinessGroupDisplayList: await this.get_ApMemberOfBusinessGroupDisplayList({
        //       organizationId: organizationEntityId.id,
        //       apsUserResponse: apsUserResponse
        //     })
        //   })
        // }
      }
    }
    return this.create_ApUserDisplay_From_ApiEntities({
      apsUserResponse: apsUserResponse,
      apOrganizationAssetInfoDisplayList: apOrganizationAssetInfoDisplayList,
      apMemberOfOrganizationGroupsDisplayList: apMemberOfOrganizationGroupsDisplayList
    });
  }

}

export default new APUsersDisplayService();
