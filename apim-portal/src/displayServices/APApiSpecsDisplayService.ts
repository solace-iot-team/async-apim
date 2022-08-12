import yaml from "js-yaml";

import { ApiProductsService, ApisService, AppsService } from '@solace-iot-team/apim-connector-openapi-browser';
import APEntityIdsService, { IAPEntityIdDisplay, TAPEntityId } from '../utils/APEntityIdsService';
import { Globals } from "../utils/Globals";
import APVersioningDisplayService from "./APVersioningDisplayService";
import { APFetch } from "../utils/APFetch";


export enum EApFileDownloadType {
  JSON='application/json',
  YAML='application/x-yaml',
  ZIP='application/zip'
}

export enum EAPApiSpecFormat {
  JSON = 'application/json',
  YAML = 'application/x-yaml',
  UNKNOWN = 'application/x-unknown'
}

export type TAPApiSpecDisplay = IAPEntityIdDisplay & {
  format: EAPApiSpecFormat;
  spec: any;
  version?: string;
}

class APApiSpecsDisplayService {
  private readonly ComponentName = "APApiSpecsDisplayService";
  private readonly EmptySpec = {};

  public create_Empty_ApApiSpecDisplay(): TAPApiSpecDisplay {
    return {
      apEntityId: APEntityIdsService.create_EmptyObject_NoId(),
      format: EAPApiSpecFormat.UNKNOWN,
      spec: this.EmptySpec,
    };
  }

  public is_Empty_AsyncApiSpecString(spec: any): boolean {
    return spec === this.EmptySpec;
  }

  public get_AsyncApiSpec_As_Yaml_String({ apApiSpecDisplay }:{
    apApiSpecDisplay: TAPApiSpecDisplay;
  }): string {
    const funcName = 'get_AsyncApiSpec_Json_As_String';
    const logName = `${this.ComponentName}.${funcName}()`;
    switch(apApiSpecDisplay.format) {
      case EAPApiSpecFormat.JSON:
        return yaml.dump(apApiSpecDisplay.spec);
      case EAPApiSpecFormat.YAML:
        return apApiSpecDisplay.spec;
      case EAPApiSpecFormat.UNKNOWN:
        return apApiSpecDisplay.spec;
      default:
        return Globals.assertNever(logName, apApiSpecDisplay.format);
    }
  }

  public async create_ApApiSpecDisplay_From_AsyncApiString({ apApiEntityId, asyncApiSpecString }:{
    apApiEntityId: TAPEntityId;
    asyncApiSpecString: string;
  }): Promise<TAPApiSpecDisplay> {
    const funcName = 'create_ApApiSpecDisplay_From_AsyncApiString';
    const logName = `${this.ComponentName}.${funcName}()`;

    const result: string | TAPApiSpecDisplay = this.create_ApApiSpecDisplayJson_From_AsyncApiString({ 
      apApiEntityId: apApiEntityId,
      asyncApiSpecString: asyncApiSpecString,
      currentFormat: EAPApiSpecFormat.UNKNOWN,
    });
    if(typeof result === 'string') throw new Error(`${logName}: result=${result}`);
    return result;
  }

  public create_ApApiSpecDisplayJson_From_AsyncApiString({ apApiEntityId, asyncApiSpecString, currentFormat }:{
    apApiEntityId: TAPEntityId;
    asyncApiSpecString: string;
    currentFormat: EAPApiSpecFormat;
  }): TAPApiSpecDisplay | string {
    const funcName = 'create_ApApiSpecDisplayJson_From_AsyncApiString';
    const logName = `${this.ComponentName}.${funcName}()`;
    switch(currentFormat) {
      case EAPApiSpecFormat.JSON:
        const apApiSpecDisplay: TAPApiSpecDisplay = {
          apEntityId: apApiEntityId,
          format: EAPApiSpecFormat.JSON,
          spec: asyncApiSpecString
        };
        return apApiSpecDisplay;
      case EAPApiSpecFormat.YAML: {
        // return `${logName}: implement conversion from YAML to JSON`;
        try {
          const doc: any = yaml.load(asyncApiSpecString);
          try {
            const jsonParsedDoc: any = JSON.parse(JSON.stringify(doc));
            const apApiSpecDisplay: TAPApiSpecDisplay = {
              apEntityId: apApiEntityId,
              format: EAPApiSpecFormat.JSON,
              spec: jsonParsedDoc,
            };
            return apApiSpecDisplay;
          } catch (e) {
            return `Unable to convert YAML to JSON, e=${e}`;
          }
        } catch (e) {
          return `Unable to convert YAML to JSON, e=${e}`;
        }
      }
      case EAPApiSpecFormat.UNKNOWN: {
        if(asyncApiSpecString === '') return 'Unable to parse, contents are empty.';
        try {
          const parsedSpec: any = JSON.parse(asyncApiSpecString);
          const apApiSpecDisplay: TAPApiSpecDisplay = {
            apEntityId: apApiEntityId,
            format: EAPApiSpecFormat.JSON,
            spec: parsedSpec,
          };
          return apApiSpecDisplay;
        } catch(jsonError: any) {
          console.error(`${logName}: jsonError=${jsonError}`);
          try {
            const doc: any = yaml.load(asyncApiSpecString);
            try {
              const jsonParsedDoc: any = JSON.parse(JSON.stringify(doc));
              if(typeof(jsonParsedDoc) !== 'object') return `Unable to parse as JSON or YAML, type:${typeof(jsonParsedDoc)}`;
              // console.log(`${logName}: typeof(jsonParseddoc)=${typeof(jsonParsedDoc)} , jsonParseddoc = ${JSON.stringify(doc, null, 2)}`);
              return this.create_ApApiSpecDisplayJson_From_AsyncApiString({
                apApiEntityId: apApiEntityId,
                asyncApiSpecString: asyncApiSpecString,
                currentFormat: EAPApiSpecFormat.YAML,
              });
            } catch (yamlError) {
              console.error(`${logName}: yamlError=${JSON.stringify(yamlError, null, 2)}`);
              return `Unable to parse as JSON or YAML, jsonError=${JSON.stringify(jsonError)}, yamlerror=${JSON.stringify(yamlError)}`;
            }
            // return { format: EAPAsyncApiSpecFormat.YAML, spec: asyncApiSpec.spec };
          } catch(yamlError: any) {
            console.error(`${logName}: yamlError=${JSON.stringify(yamlError, null, 2)}`);
            return `Unable to parse as JSON or YAML (${yamlError.name}:${yamlError.reason})`;
          }  
        }
      }
      default:
        return Globals.assertNever(logName, currentFormat);
    }
  }

  private has_Title({ apApiSpecDisplay }:{
    apApiSpecDisplay: TAPApiSpecDisplay
  }): boolean {
    try {
      this.get_Title({ apApiSpecDisplay: apApiSpecDisplay });
      return true;
    } catch(e: any) {
      return false;
    }
  }
  private has_VersionString({ apApiSpecDisplay }:{
    apApiSpecDisplay: TAPApiSpecDisplay;
  }): boolean {
    try {
      this.get_RawVersionString({ apApiSpecDisplay: apApiSpecDisplay });
      return true;
    } catch(e: any) {
      return false;
    }
  }

  /**
   * Rudimentary validations:
   * - must have $.info.title
   * - must have $.info.version
   * - must hvae $.info.version in semVer format
   * @param object 
   * @returns 
   */
  public async validateSpec({ apApiSpecDisplay }:{
    apApiSpecDisplay: TAPApiSpecDisplay;
  }): Promise<boolean | string> {
    const funcName = 'validateSpec';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(apApiSpecDisplay.format !== EAPApiSpecFormat.JSON) throw new Error(`${logName}: apApiSpecDisplay.format !== EAPApiSpecFormat.JSON`);

    const hasTitle: boolean = this.has_Title({ apApiSpecDisplay: apApiSpecDisplay });
    if(!hasTitle) return `Cannot read title from Async API. Missing element: $.info.title.`;

    const hasVersionString: boolean = this.has_VersionString({ apApiSpecDisplay: apApiSpecDisplay });
    if(!hasVersionString) return `Cannot read version from Async API. Missing element: $.info.version.`;

    try {
      this.get_VersionAsSemVerString({ apApiSpecDisplay: apApiSpecDisplay });
    } catch(e: any) {
      return `Async API version is not in semantic version format (version: '${this.get_RawVersionString({ apApiSpecDisplay: apApiSpecDisplay })}').`;
    }
    return true;
  }

  public get_RawVersionString({ apApiSpecDisplay }:{
    apApiSpecDisplay: TAPApiSpecDisplay;
  }): string {
    const funcName = 'get_RawVersionString';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(apApiSpecDisplay.format !== EAPApiSpecFormat.JSON) throw new Error(`${logName}: apApiSpecDisplay.format !== EAPApiSpecFormat.JSON`);
    if(typeof(apApiSpecDisplay.spec) !== 'object') throw new Error(`${logName}: typeof(apApiSpecDisplay.spec) !== 'object'`);
    if(apApiSpecDisplay.spec['info'] === undefined) throw new Error(`${logName}: apApiSpecDisplay.spec['info'] === undefined`);
    if(apApiSpecDisplay.spec['info']['version'] === undefined) throw new Error(`${logName}: apApiSpecDisplay.spec['info']['version'] === undefined`);
    return apApiSpecDisplay.spec['info']['version'];
  }
  // public get_VersionString({ apApiSpecDisplay }:{
  //   apApiSpecDisplay: TAPApiSpecDisplay;
  // }): string {
  //   return APVersioningDisplayService.create_SemVerString(this.get_RawVersionString({ apApiSpecDisplay: apApiSpecDisplay }));
  // }
  public get_VersionAsSemVerString({ apApiSpecDisplay }:{
    apApiSpecDisplay: TAPApiSpecDisplay;
  }): string {
    const funcName = 'get_VersionAsSemVerString';
    const logName = `${this.ComponentName}.${funcName}()`;
    const rawVersionString = this.get_RawVersionString({ apApiSpecDisplay: apApiSpecDisplay });
    if(APVersioningDisplayService.isSemVerFormat(rawVersionString)) return rawVersionString;
    throw new Error(`${logName}: not in semver format, rawVersionString=${rawVersionString}`);
  }

  public get_Title({ apApiSpecDisplay }:{
    apApiSpecDisplay: TAPApiSpecDisplay
  }): string {
    const funcName = 'get_Title';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(apApiSpecDisplay.format !== EAPApiSpecFormat.JSON) throw new Error(`${logName}: apApiSpecDisplay.format !== EAPApiSpecFormat.JSON`);
    if(typeof(apApiSpecDisplay.spec) !== 'object') throw new Error(`${logName}: typeof(apApiSpecDisplay.spec) !== 'object'`);
    if(apApiSpecDisplay.spec['info'] === undefined) throw new Error(`${logName}: apApiSpecDisplay.spec['info'] === undefined`);
    if(apApiSpecDisplay.spec['info']['title'] === undefined) throw new Error(`${logName}: apApiSpecDisplay.spec['info']['title'] === undefined`);
    return apApiSpecDisplay.spec['info']['title'];
  }

  // public static getAsyncApiSpecAsJson = (asyncApiSpec: TAPAsyncApiSpec): TAPAsyncApiSpec | string => {
  //   const funcName = 'getAsyncApiSpecAsJson';
  //   const logName = `${APConnectorApiHelper.name}.${funcName}(${asyncApiSpec.format})`;
  //   // console.log(`${logName}: starting ...`);
  //   switch (asyncApiSpec.format) {
  //     case EAPAsyncApiSpecFormat.JSON:
  //       return asyncApiSpec;
  //     case EAPAsyncApiSpecFormat.YAML: {
  //       // return `${logName}: implement conversion from YAML to JSON`;
  //       try {
  //         const doc: any = yaml.load(asyncApiSpec.spec);
  //         try {
  //           const jsonParsedDoc: any = JSON.parse(JSON.stringify(doc));
  //           return { format: EAPAsyncApiSpecFormat.JSON, spec: jsonParsedDoc };
  //         } catch (e) {
  //           return `unable to convert YAML to JSON, e=${e}`;
  //         }
  //       } catch (e) {
  //         return `unable to convert YAML to JSON, e=${e}`;
  //       }
  //     }
  //     case EAPAsyncApiSpecFormat.UNKNOWN: {
  //       try {
  //         const parsedSpec: any = JSON.parse(asyncApiSpec.spec);
  //         return { format: EAPAsyncApiSpecFormat.JSON, spec: parsedSpec };
  //       } catch(jsonError: any) {
  //         console.error(`${logName}: jsonError=${jsonError}`);
  //         try {
  //           const doc: any = yaml.load(asyncApiSpec.spec);
  //           try {
  //             const jsonParsedDoc: any = JSON.parse(JSON.stringify(doc));
  //             if(typeof(jsonParsedDoc) !== 'object') return `unable to parse as JSON or YAML, type:${typeof(jsonParsedDoc)}`;
  //             // console.log(`${logName}: typeof(jsonParseddoc)=${typeof(jsonParsedDoc)} , jsonParseddoc = ${JSON.stringify(doc, null, 2)}`);
  //             return APConnectorApiHelper.getAsyncApiSpecAsJson({ format: EAPAsyncApiSpecFormat.YAML, spec: asyncApiSpec.spec });
  //             // return { format: EAPAsyncApiSpecFormat.YAML, spec: asyncApiSpec.spec };
  //           } catch (yamlError) {
  //             console.error(`${logName}: yamlError=${JSON.stringify(yamlError, null, 2)}`);
  //             return `unable to parse as JSON or YAML, jsonError=${JSON.stringify(jsonError)}, error=${JSON.stringify(yamlError)}`;
  //           }
  //           // return { format: EAPAsyncApiSpecFormat.YAML, spec: asyncApiSpec.spec };
  //         } catch(yamlError: any) {
  //           console.error(`${logName}: yamlError=${JSON.stringify(yamlError, null, 2)}`);
  //           return `unable to parse as JSON or YAML, error=${yamlError.reason}`;
  //         }  
  //       }
  //     }
  //     default:
  //       return Globals.assertNever(logName, asyncApiSpec.format);
  //   }
  // }

  // ********************************************************************************************************************************
  // API calls
  // ********************************************************************************************************************************

  public async apiGet_App_ApiSpec({ organizationId, appId, apiEntityId }: {
    organizationId: string;
    appId: string;
    apiEntityId: TAPEntityId;
  }): Promise<TAPApiSpecDisplay> {
    const spec: Record<string, unknown> = await AppsService.getAppApiSpecification({
      organizationName: organizationId,
      appName: appId,
      apiName: apiEntityId.id,
      format: EApFileDownloadType.JSON      
    });
    return {
      apEntityId: apiEntityId,
      format: EAPApiSpecFormat.JSON,
      spec: spec
    };
  }

  public async apiGet_App_ApiSpec_ZipContents({ organizationId, appId, apiEntityId }:{
    organizationId: string;
    appId: string;
    apiEntityId: TAPEntityId;
  }): Promise<Blob> {
    // /{organization_name}/apps/{app_name}/apis/{api_name}
    const zipContents: Blob = await APFetch.GETConnector_ZipContents({
      connectorUrlPath: `${organizationId}/apps/${appId}/apis/${apiEntityId.id}?format=${encodeURIComponent('application/zip')}`,
    });
    return zipContents;
  }

  public async apiGet_ApiProduct_ApiSpec({ organizationId, apiProductId, apiEntityId }: {
    organizationId: string;
    apiProductId: string;
    apiEntityId: TAPEntityId;
  }): Promise<TAPApiSpecDisplay> {
    const spec: any = await ApiProductsService.getApiProductApiSpecification({
      organizationName: organizationId, 
      apiProductName: apiProductId,
      apiName: apiEntityId.id,
      format: EApFileDownloadType.JSON
    });
    return {
      apEntityId: apiEntityId,
      format: EAPApiSpecFormat.JSON,
      spec: spec
    };
  }

  public async apiGet_ApiProduct_ApiSpec_ZipContents({ organizationId, apiProductId, apiEntityId }:{
    organizationId: string;
    apiProductId: string;
    apiEntityId: TAPEntityId;
  }): Promise<Blob> {
    const zipContents: Blob = await APFetch.GETConnector_ZipContents({
      connectorUrlPath: `${organizationId}/apiProducts/${apiProductId}/apis/${apiEntityId.id}?format=${encodeURIComponent('application/zip')}`,
    });
    return zipContents;
  }

  public async apiGet_Api_ApiSpec({ organizationId, apiEntityId, version }: {
    organizationId: string;
    apiEntityId: TAPEntityId;
    version?: string;
  }): Promise<TAPApiSpecDisplay> {
    let spec: any = undefined;
    if(version === undefined) {
      spec = await ApisService.getApi({
        organizationName: organizationId,
        apiName: apiEntityId.id,
        format: EApFileDownloadType.JSON
      });  
    } else {
      spec = await ApisService.getApiRevision({
        organizationName: organizationId,
        apiName: apiEntityId.id,
        format: EApFileDownloadType.JSON,
        version: version,
      });
    }
    return {
      apEntityId: apiEntityId,
      format: EAPApiSpecFormat.JSON,
      spec: spec,
      version: version,
    };
  }

  public async apiGet_Api_ApiSpec_ZipContents({ organizationId, apiEntityId, version }:{
    organizationId: string;
    apiEntityId: TAPEntityId;
    version?: string;
  }): Promise<Blob> {
    const zipContents: Blob = await APFetch.GETConnector_ZipContents({
      connectorUrlPath: `${organizationId}/apis/${apiEntityId.id}?format=${encodeURIComponent('application/zip')}`
    });
    return zipContents;
  }

  // // this does not work - the response is NOT a blob
  // // cannot figure out how to convert the response to a blob
  // // no use
  // public async apiGet_Api_ApiSpec_ZipContents({ organizationId, apiEntityId, version }:{
  //   organizationId: string;
  //   apiEntityId: TAPEntityId;
  //   version?: string;
  // }): Promise<Blob> {  
  //   const funcName = 'apiGet_Api_ApiSpec_ZipContents';
  //   const logName = `${this.ComponentName}.${funcName}()`;
  
  //   let zipContents: Blob | undefined = undefined;
  //   if(version === undefined) {
  //     zipContents = await ApisService.getApi({
  //       organizationName: organizationId,
  //       apiName: apiEntityId.id,
  //       format: EApFileDownloadType.ZIP
  //     });  
  //   } else {
  //     zipContents = await ApisService.getApiRevision({
  //       organizationName: organizationId,
  //       apiName: apiEntityId.id,
  //       version: version,
  //       format: EApFileDownloadType.ZIP
  //     });
  //   }
  //   if(zipContents === undefined) throw new Error(`${logName}: zipContents === undefined`);
  //   return zipContents;
  // }

}

export default new APApiSpecsDisplayService();
