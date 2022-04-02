import { IAPEntityIdDisplay } from './APEntityIdsService';

export enum EAPApiSpecFormat {
  JSON = 'application/json',
  YAML = 'application/x-yaml',
  UNKNOWN = 'application/x-unknown'
}

export type TAPApiSpecDisplay = IAPEntityIdDisplay & {
  format: EAPApiSpecFormat,
  spec: any
}

export class APApiSpecsService {
  private readonly BaseComponentName = "APApiSpecsService";

}

export default new APApiSpecsService();
