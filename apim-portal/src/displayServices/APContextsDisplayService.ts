import { AuthHelper } from '../auth/AuthHelper';
import { TOrganizationContextAction } from '../components/APContextProviders/APOrganizationContextProvider';
import { UserContextAction } from '../components/APContextProviders/APUserContextProvider';
import { AuthContextAction } from '../components/AuthContextProvider/AuthContextProvider';
import { TAPEntityId } from '../utils/APEntityIdsService';
import { APOrganizationsService } from '../utils/deleteme_APOrganizationsService';
import { 
  APRbac, 
  EAPSCombinedAuthRole, 
  TAPRbacRole, 
} from '../utils/APRbac';
import { EAppState, EUICommonResourcePaths, Globals } from '../utils/Globals';
import APRbacDisplayService from './APRbacDisplayService';
import { TAPLoginUserDisplay } from './APUsersDisplayService/APLoginUsersDisplayService';
import APMemberOfService, { TAPMemberOfBusinessGroupDisplay, TAPMemberOfBusinessGroupDisplayTreeNodeList } from './APUsersDisplayService/APMemberOfService';
import APOrganizationUsersDisplayService, { TAPOrganizationUserDisplay } from './APUsersDisplayService/APOrganizationUsersDisplayService';

class APContextsDisplayService {
  private readonly BaseComponentName = "APContextsDisplayService";

  public get_RoleDisplayName(apsRole: EAPSCombinedAuthRole): string {
    const rbacRole: TAPRbacRole = APRbac.getByRole(apsRole);
    return rbacRole.displayName;
  }

  private setup_AuthContext({ authorizedResourcePathsAsString, dispatchAuthContextAction }:{
    authorizedResourcePathsAsString: string;
    dispatchAuthContextAction: React.Dispatch<AuthContextAction>;
  }): void {
    dispatchAuthContextAction({ type: 'SET_AUTH_CONTEXT', authContext: { 
      isLoggedIn: true, 
      authorizedResourcePathsAsString: authorizedResourcePathsAsString,
    }});
  }

  private async setup_OrganizationContext({ 
    apLoginUserDisplay,
    organizationEntityId, 
    isConnectorAvailable,
    dispatchUserContextAction,
    dispatchOrganizationContextAction,
  }:{
    apLoginUserDisplay: TAPLoginUserDisplay;
    organizationEntityId: TAPEntityId | undefined;
    isConnectorAvailable: boolean;
    dispatchUserContextAction: React.Dispatch<UserContextAction>;
    dispatchOrganizationContextAction: React.Dispatch<TOrganizationContextAction>;
  }): Promise<void> {
    const funcName = 'setup_OrganizationContext';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    // alert(`${logName}: organizationEntityId=${JSON.stringify(organizationEntityId)}`);
    // alert(`${logName}: apLoginUserDisplay.apMemberOfOrganizationDisplayList = ${JSON.stringify(apLoginUserDisplay.apMemberOfOrganizationDisplayList, null, 2)}`);

    if(organizationEntityId !== undefined) {

      // get the Organization User to get the business groups tree and current business group
      const apOrganizationUserDisplay: TAPOrganizationUserDisplay = await APOrganizationUsersDisplayService.apsGet_ApOrganizationUserDisplay({
        userId: apLoginUserDisplay.apEntityId.id,
        organizationEntityId: organizationEntityId,
        fetch_ApOrganizationAssetInfoDisplayList: false,
      });
      if(apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined) throw new Error(`${logName}: apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList === undefined`);

      // get the tree node list for the user context
      // unpruned
      const apMemberOfBusinessGroupDisplayTreeNodeList: TAPMemberOfBusinessGroupDisplayTreeNodeList = APMemberOfService.create_ApMemberOfBusinessGroupDisplayTreeNodeList({
        organizationEntityId: organizationEntityId,
        apMemberOfBusinessGroupDisplayList: apOrganizationUserDisplay.memberOfOrganizationDisplay.apMemberOfBusinessGroupDisplayList,
        apOrganizationRoleEntityIdList: apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList,
        completeApOrganizationBusinessGroupDisplayList: apOrganizationUserDisplay.completeOrganizationBusinessGroupDisplayList,
        pruneBusinessGroupsNotAMemberOf: false,
        accessOnly_To_BusinessGroupManageAssets: false,
      });

      // get the business group (from last sesstion, default, or undefined)
      // alert(`${logName}: apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationSessionInfoDisplay = ${JSON.stringify(apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationSessionInfoDisplay, null, 2)}`);
      const apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay | undefined = APMemberOfService.get_ApMemberOfBusinessGroupDisplay_For_Session({
        apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList,
        apOrganizationSessionInfoDisplay: apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationSessionInfoDisplay,
        accessOnly_To_BusinessGroupManageAssets: false,
      });
      
      // dispatch to contexts
      dispatchUserContextAction({ type: 'SET_CURRENT_ORGANIZATION_ENTITY_ID', currentOrganizationEntityId: organizationEntityId });
      dispatchUserContextAction({ type: 'SET_AP_MEMBER_OF_BUSINESS_GROUP_DISPLAY_TREE_NODE_LIST', apMemberOfBusinessGroupDisplayTreeNodeList: apMemberOfBusinessGroupDisplayTreeNodeList });

      // current roles
      if(apMemberOfBusinessGroupDisplay !== undefined) {
        dispatchUserContextAction({ type: 'SET_CURRENT_BUSINESS_GROUP_ENTITY_ID', currentBusinessGroupEntityId: apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId });        
        dispatchUserContextAction({ type: 'SET_CURRENT_ROLES', currentRolesEntityIdList: 
          apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList ? apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList : []
        });
      } else {
        dispatchUserContextAction({ type: 'CLEAR_CURRENT_BUSINESS_GROUP_ENTITY_ID' });
        dispatchUserContextAction({ type: 'SET_CURRENT_ROLES', currentRolesEntityIdList: apOrganizationUserDisplay.memberOfOrganizationDisplay.apOrganizationRoleEntityIdList});
      }

      // get the organization details only if connector is defined & healthy
      if(isConnectorAvailable) {
        dispatchOrganizationContextAction({ type: 'SET_ORGANIZATION_CONTEXT', organizationContext: await APOrganizationsService.getOrganization(organizationEntityId.id)});
      }
    }
  }

  private setup_App({ 
    isConnectorAvailable, 
    authorizedResourcePathsAsString, 
    userContextCurrentAppState, 
    userContextOriginAppState, 
    dispatchUserContextAction, 
    navigateTo 
  }:{
    isConnectorAvailable: boolean;
    authorizedResourcePathsAsString: string;
    userContextCurrentAppState: EAppState;
    userContextOriginAppState: EAppState;
    dispatchUserContextAction: React.Dispatch<UserContextAction>;
    navigateTo: (path: string) => void;
  }): void {
    const funcName = 'setup_App';
    const logName = `${this.BaseComponentName}.${funcName}()`;

    if(!isConnectorAvailable) {
      // no access to admin portal ==> redirect to system unavailable
      if(!AuthHelper.isAuthorizedToAccessAdminPortal(authorizedResourcePathsAsString)) {
        navigateTo(EUICommonResourcePaths.HealthCheckView);
        return;
      }
    }
    let originAppState: EAppState = userContextOriginAppState;
    let newCurrentAppState: EAppState = userContextCurrentAppState;

    if(userContextCurrentAppState !== EAppState.UNDEFINED) {
      newCurrentAppState = userContextCurrentAppState;
      // catch state management errors
      if(originAppState === EAppState.UNDEFINED) throw new Error(`${logName}: orginAppState is undefined, currentAppState=${newCurrentAppState}`);
    } else {
      // came directly to /login url
      // if access to admin portal ==> admin portal, if access to developer portal ==> developer portal, if no access ==> developer portal
      if(AuthHelper.isAuthorizedToAccessAdminPortal(authorizedResourcePathsAsString)) {
        originAppState = EAppState.ADMIN_PORTAL; 
        newCurrentAppState = EAppState.ADMIN_PORTAL;
      } else if(AuthHelper.isAuthorizedToAccessDeveloperPortal(authorizedResourcePathsAsString)) {
        originAppState = EAppState.DEVELOPER_PORTAL; 
        newCurrentAppState = EAppState.DEVELOPER_PORTAL;
      } else {
        originAppState = EAppState.DEVELOPER_PORTAL; 
        newCurrentAppState = EAppState.DEVELOPER_PORTAL;
        // throw new Error(`${logName}: user not authorized to access developer portal nor admin portal.\nauthContext=${JSON.stringify(authContext, null, 2)}\nuserContext=${JSON.stringify(userContext, null, 2)}`);
      }
    }
    dispatchUserContextAction({ type: 'SET_ORIGIN_APP_STATE', appState: originAppState});
    dispatchUserContextAction({ type: 'SET_CURRENT_APP_STATE', appState: newCurrentAppState});
    navigateTo(Globals.getCurrentHomePath(true, newCurrentAppState));
  }

  /** Setup the contexts after user login */
  public async setup_LoginContexts({
    apLoginUserDisplay,
    organizationEntityId,
    isConnectorAvailable,
    dispatchAuthContextAction,
    userContextCurrentAppState,
    userContextOriginAppState,
    dispatchUserContextAction,
    dispatchOrganizationContextAction,
    navigateTo,
  }:{
    apLoginUserDisplay: TAPLoginUserDisplay;
    organizationEntityId: TAPEntityId | undefined;
    isConnectorAvailable: boolean;
    dispatchAuthContextAction: React.Dispatch<AuthContextAction>;
    userContextCurrentAppState: EAppState;
    userContextOriginAppState: EAppState;
    dispatchUserContextAction: React.Dispatch<UserContextAction>;
    dispatchOrganizationContextAction: React.Dispatch<TOrganizationContextAction>;
    navigateTo: (path: string) => void;
    // onLoadingChange: (isLoading: boolean) => void;
  }): Promise<void> {

    // test show loading
    // await Globals.sleep(5000);

    const authorizedResourcePathsAsString: string = await APRbacDisplayService.create_AuthorizedResourcePathListAsString({
      apLoginUserDisplay: apLoginUserDisplay,
      apOrganizationEntityId: organizationEntityId
    });
  
    this.setup_AuthContext({
      authorizedResourcePathsAsString: authorizedResourcePathsAsString,
      dispatchAuthContextAction: dispatchAuthContextAction
    });

    await this.setup_OrganizationContext({
      apLoginUserDisplay: apLoginUserDisplay,
      organizationEntityId: organizationEntityId,
      isConnectorAvailable: isConnectorAvailable,
      dispatchUserContextAction: dispatchUserContextAction,
      dispatchOrganizationContextAction: dispatchOrganizationContextAction
    });

    this.setup_App({
      isConnectorAvailable: isConnectorAvailable,
      authorizedResourcePathsAsString: authorizedResourcePathsAsString,
      userContextCurrentAppState: userContextCurrentAppState,
      userContextOriginAppState: userContextOriginAppState,
      dispatchUserContextAction: dispatchUserContextAction,
      navigateTo: navigateTo
    });

  }

  /** Clear the contexts after user logout */
  public clear_LoginContexts({
    dispatchAuthContextAction,
    dispatchUserContextAction,
    dispatchOrganizationContextAction,
  }:{
    dispatchAuthContextAction: React.Dispatch<AuthContextAction>;
    dispatchUserContextAction: React.Dispatch<UserContextAction>;
    dispatchOrganizationContextAction: React.Dispatch<TOrganizationContextAction>;
  }): void {

    dispatchAuthContextAction({ type: 'CLEAR_AUTH_CONTEXT' });
    dispatchUserContextAction({ type: 'CLEAR_USER_CONTEXT' });
    dispatchOrganizationContextAction({ type: 'CLEAR_ORGANIZATION_CONTEXT' });

  }
  
  public setup_BusinessGroupContexts_For_LoggedInUser({ 
    apLoginUserDisplay,
    apMemberOfBusinessGroupDisplay, 
    dispatchUserContextAction,
    dispatchAuthContextAction,
  }: {
    apLoginUserDisplay: TAPLoginUserDisplay;
    apMemberOfBusinessGroupDisplay: TAPMemberOfBusinessGroupDisplay;
    dispatchUserContextAction: React.Dispatch<UserContextAction>;
    dispatchAuthContextAction: React.Dispatch<AuthContextAction>;
  }): void {
    const funcName = 'setup_BusinessGroupContexts_For_LoggedInUser';
    const logName = `${this.BaseComponentName}.${funcName}()`;
    if(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined ) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList === undefined`);
    if(apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList.length === 0) throw new Error(`${logName}: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList.length === 0`);

    const authorizedResourcePathsAsString: string = APRbacDisplayService.create_AuthorizedResourcePathListAsString_For_BusinessGroupRoles({
      apLoginUserDisplay: apLoginUserDisplay,
      apBusinessGroupRoleEntityIdList: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList,
    });
  
    this.setup_AuthContext({
      authorizedResourcePathsAsString: authorizedResourcePathsAsString,
      dispatchAuthContextAction: dispatchAuthContextAction
    });

    dispatchUserContextAction({ type: 'SET_CURRENT_BUSINESS_GROUP_ENTITY_ID', currentBusinessGroupEntityId: apMemberOfBusinessGroupDisplay.apBusinessGroupDisplay.apEntityId });        
    dispatchUserContextAction({ type: 'SET_CURRENT_ROLES', currentRolesEntityIdList: apMemberOfBusinessGroupDisplay.apCalculatedBusinessGroupRoleEntityIdList });

  }

}

export default new APContextsDisplayService();
