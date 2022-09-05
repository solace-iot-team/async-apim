import { 
  Job,
  ManagementService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay } from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import APDisplayUtils from './APDisplayUtils';

// should be defined in API
enum E_APJobDisplay_JobNames {
  EVENT_PORTAL_IMPORTER = "EventPortalImporter",
  ROTATE_APP_CREDENTIALS = "rotateAppCredentials"
};

export interface IAPJobDisplay extends IAPEntityIdDisplay, IAPSearchContent {
  connectorJob: Job;
  status: Job.status;
}
export type TAPJobDisplayList = Array<IAPJobDisplay>;

class APJobsDisplayService {
  private readonly ComponentName = "APJobsDisplayService";

  public get_APJobDisplay_JobNames = (): Array<string> => {
    return Object.values(E_APJobDisplay_JobNames);
  }
  private create_IAPJobsDisplay_From_ApiEntities = ({ connectorJob }:{
    connectorJob: Job;
  }): IAPJobDisplay => {
    // const funcName = 'create_IAPJobsDisplay_From_ApiEntities';
    // const logName = `${this.ComponentName}.${funcName}()`;

    const apJobsDisplay: IAPJobDisplay = {
      apEntityId: {
        id: connectorJob.id,
        displayName: connectorJob.name
      },
      connectorJob: connectorJob,
      status: connectorJob.status ? connectorJob.status : Job.status.PENDING,
      apSearchContent: ''
    };
    return APSearchContentService.add_SearchContent<IAPJobDisplay>(apJobsDisplay);
  }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiGetList_TAPJobDisplayList({ organizationId, jobNameFilterList }:{
    organizationId: string;
    jobNameFilterList: Array<string>;
  }): Promise<TAPJobDisplayList> {
    // const funcName = 'apiGetList_TAPJobDisplayList';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    const connectorJobList: Array<Job> = [];
    let nextPage: number | null = 1;
    while(nextPage !== null) {
      const _jobList: Array<Job> = await ManagementService.listJobs({
        organizationName: organizationId,
        pageSize: 100,
        pageNumber: nextPage,
        sortDirection: "desc",
        sortFieldName: APDisplayUtils.nameOf<Job>('lastRunAt')
      });
      connectorJobList.push(..._jobList);
      if(_jobList.length === 0) nextPage = null;
      else nextPage++;
    }
    const list: TAPJobDisplayList = [];
    for(const connectorJob of connectorJobList) {
      if(jobNameFilterList.length > 0) {
        const found = jobNameFilterList.find( (x) => {
          return x === connectorJob.name;
        });
        if(found) {
          list.push(this.create_IAPJobsDisplay_From_ApiEntities({
            connectorJob: connectorJob
          }));    
        }
      } else {
        list.push(this.create_IAPJobsDisplay_From_ApiEntities({
          connectorJob: connectorJob
        }));  
      }
    }
    return APEntityIdsService.sort_ApDisplayObjectList_By_DisplayName(list);
  }

  public async apiGet_IAPJobDisplay({ organizationId, jobId }: {
    organizationId: string;
    jobId: string;
  }): Promise<IAPJobDisplay> {
    const funcName = 'apiGet_IAPJobDisplay';
    const logName = `${this.ComponentName}.${funcName}()`;
    // throw new Error(`${logName}: test error handling`);

    let nextPage: number | null = 1;
    while(nextPage !== null) {
      const _jobList: Array<Job> = await ManagementService.listJobs({
        organizationName: organizationId,
        pageSize: 100,
        pageNumber: nextPage,
        sortDirection: "desc",
        sortFieldName: APDisplayUtils.nameOf<Job>('lastRunAt')
      });
      const found = _jobList.find( (x) => {
        return x.id === jobId;
      });
      if(found !== undefined) return this.create_IAPJobsDisplay_From_ApiEntities({connectorJob: found});
      if(_jobList.length === 0) nextPage = null;
      else nextPage++;
    }
    throw new Error(`${logName}: job not found, id=${jobId}`);
  }
}

export default new APJobsDisplayService();

