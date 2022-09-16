import { ApplicationDomain, ApplicationDomainList, EventPortal20Service } from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { 
  IAPEntityIdDisplay, 
} from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';

export interface IAPEpApplicationDomainDisplay extends IAPEntityIdDisplay, IAPSearchContent {
}
export type TAPEpApplicationDomainDisplayList = Array<IAPEpApplicationDomainDisplay>;

class APEpApplicationDomainsDisplayService {
  private readonly ComponentName = "APEpApplicationDomainsDisplayService";

  private create_ApEpApplicationDomainDisplay_From_ApiEntities = ({ applicationDomain }:{
    applicationDomain: ApplicationDomain
  }): IAPEpApplicationDomainDisplay => {
    const funcName = 'create_ApEpApplicationDomainDisplay_From_ApiEntities';
    const logName = `${this.ComponentName}.${funcName}()`;

    if(applicationDomain.id === undefined) throw new Error(`${logName}: applicationDomain.id === undefined`);

    const apEpApplicationDomainDisplay: IAPEpApplicationDomainDisplay = {
      apEntityId: {
        id: applicationDomain.id,
        displayName: applicationDomain.name
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

    // get all the pages

    let applicationDomainList: ApplicationDomainList = [];
    let hasNextPage: boolean = true;
    let nextPage: number = 1;
    while (hasNextPage) {
      const _applicationDomainList: ApplicationDomainList = await EventPortal20Service.listEpApplicationDomains({
        organizationName: organizationId,
        pageSize: 100,
        pageNumber: nextPage,
      });
      if(_applicationDomainList.length === 0) hasNextPage = false;
      else applicationDomainList.push(..._applicationDomainList);
      nextPage++;
    }
    const list: TAPEpApplicationDomainDisplayList = [];
    for(const applicationDomain of applicationDomainList) {
      const isExcluded = exclude_TAPEpApplicationDomainDisplayList.find( (x) => {
        return x.apEntityId.id === applicationDomain.id;
      });
      if(isExcluded === undefined) {
        list.push(this.create_ApEpApplicationDomainDisplay_From_ApiEntities({
          applicationDomain: applicationDomain
        }));  
      }
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(list);
  }

  public async apiGet_IAPEpApplicationDomainDisplay({ organizationId, applicationDomainId }: {
    organizationId: string;
    applicationDomainId: string;
  }): Promise<IAPEpApplicationDomainDisplay | undefined> {
    // const funcName = 'apiGet_IAPEpApplicationDomainDisplay';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    const applicationDomain: ApplicationDomain = await EventPortal20Service.getEpApplicationDomain({
      organizationName: organizationId,
      applicationDomainId: applicationDomainId
    });
    return this.create_ApEpApplicationDomainDisplay_From_ApiEntities({ applicationDomain: applicationDomain });
  }

}

export default new APEpApplicationDomainsDisplayService();
