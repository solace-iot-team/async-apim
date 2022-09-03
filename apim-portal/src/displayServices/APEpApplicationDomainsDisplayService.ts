import APEntityIdsService, { 
  IAPEntityIdDisplay, 
} from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';

export interface IAPEpApplicationDomainDisplay extends IAPEntityIdDisplay, IAPSearchContent {
}
export type TAPEpApplicationDomainDisplayList = Array<IAPEpApplicationDomainDisplay>;

type APIApplicationDomain = {
  id: string;
  displayName: string;
}
const HardCoded_APIApplicationDomainList: Array<APIApplicationDomain> = [
  {
    id: "cgsh8nobngu",
    displayName: "integration/acme-retail"
  }
];


class APEpApplicationDomainsDisplayService {
  private readonly ComponentName = "APEpApplicationDomainsDisplayService";

  private create_ApEpApplicationDomainDisplay_From_ApiEntities = ({ apiApplicationDomain }:{
    apiApplicationDomain: APIApplicationDomain
  }): IAPEpApplicationDomainDisplay => {
    const funcName = 'create_ApEpApplicationDomainDisplay_From_ApiEntities';
    const logName = `${this.ComponentName}.${funcName}()`;

    const apEpApplicationDomainDisplay: IAPEpApplicationDomainDisplay = {
      apEntityId: {
        id: apiApplicationDomain.id,
        displayName: apiApplicationDomain.displayName
      },
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<IAPEpApplicationDomainDisplay>(apEpApplicationDomainDisplay);
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiGetList_TAPEpApplicationDomainDisplayList({ organizationId, exclude_TAPEpApplicationDomainDisplayList }:{
    organizationId: string;
    exclude_TAPEpApplicationDomainDisplayList: TAPEpApplicationDomainDisplayList;
  }): Promise<TAPEpApplicationDomainDisplayList> {
    // const funcName = 'apiGetList_ApEpSettingsDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    // TODO: replace with api call
    const apiApplicationDomainList: Array<APIApplicationDomain> = HardCoded_APIApplicationDomainList;

    const list: TAPEpApplicationDomainDisplayList = [];
    for(const apiApplicationDomain of apiApplicationDomainList) {
      const isExcluded = exclude_TAPEpApplicationDomainDisplayList.find( (x) => {
        return x.apEntityId.id === apiApplicationDomain.id;
      });
      if(isExcluded === undefined) {
        list.push(this.create_ApEpApplicationDomainDisplay_From_ApiEntities({
          apiApplicationDomain: apiApplicationDomain
        }));  
      }
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(list);
  }

  public async apiGet_IAPEpApplicationDomainDisplay({ organizationId, applicationDomainId }: {
    organizationId: string;
    applicationDomainId: string;
  }): Promise<IAPEpApplicationDomainDisplay | undefined> {
    const funcName = 'apiGet_IAPEpApplicationDomainDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    // TODO: replace with api call
    const apiApplicationDomainList: Array<APIApplicationDomain> = HardCoded_APIApplicationDomainList;
    const found: APIApplicationDomain | undefined = apiApplicationDomainList.find( (x) => {
      return x.id === applicationDomainId;
    });
    if(found === undefined) return undefined;
    return this.create_ApEpApplicationDomainDisplay_From_ApiEntities({ apiApplicationDomain: found });
  }

}

export default new APEpApplicationDomainsDisplayService();
