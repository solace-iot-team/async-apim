import { 
  Job,
  ManagementService,
} from '@solace-iot-team/apim-connector-openapi-browser';
import { IAPEntityIdDisplay } from '../utils/APEntityIdsService';
import APSearchContentService, { IAPSearchContent } from '../utils/APSearchContentService';
import APDisplayUtils from './APDisplayUtils';

export interface IAPJobDisplay extends IAPEntityIdDisplay, IAPSearchContent {
  connectorJob: Job;
  status: Job.status;
}
export type TAPJobDisplayList = Array<IAPJobDisplay>;

class APJobsDisplayService {
  private readonly ComponentName = "APJobsDisplayService";

  private create_IAPJobsDisplay_From_ApiEntities = ({ connectorJob }:{
    connectorJob: Job;
  }): IAPJobDisplay => {
    const funcName = 'create_IAPJobsDisplay_From_ApiEntities';
    const logName = `${this.ComponentName}.${funcName}()`;

    const apJobsDisplay: IAPJobDisplay = {
      apEntityId: {
        id: connectorJob.id,
        displayName: connectorJob.id
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

  public async apiGet_Job({ organizationId, jobId }: {
    organizationId: string;
    jobId: string;
  }): Promise<IAPJobDisplay> {
    const funcName = 'apiGet_Job';
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

