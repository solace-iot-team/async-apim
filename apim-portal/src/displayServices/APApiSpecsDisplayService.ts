import yaml from "js-yaml";
import * as AsyncApiSpecParser from '@asyncapi/parser';

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

  // public static getAsyncApiSpecJsonAsDisplayString = (asyncApiSpec: TAPAsyncApiSpec): string => {
  //   const funcName = 'getAsyncApiSpecJsonAsDisplayString';
  //   const logName = `${APConnectorApiHelper.name}.${funcName}()`;
  //   if(asyncApiSpec.format !== EAPAsyncApiSpecFormat.JSON) throw new Error(`${logName}: cannot handle asyncApiSpec.format other than JSON. format=${asyncApiSpec.format}`);
  //   return JSON.stringify(asyncApiSpec.spec, null, 2);
  // }

  // public get_AsyncApiSpec_Json_As_String({ apApiSpecDisplay }:{
  //   apApiSpecDisplay: TAPApiSpecDisplay;
  // }): string {
  //   const funcName = 'get_AsyncApiSpec_Json_As_String';
  //   const logName = `${this.ComponentName}.${funcName}()`;
  //   if(apApiSpecDisplay.format !== EAPApiSpecFormat.JSON) throw new Error(`${logName}: cannot handle asyncApiSpec.format other than JSON. format=${apApiSpecDisplay.format}`);
  //   return JSON.stringify(apApiSpecDisplay.spec);
  // }

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

    const result: string | TAPApiSpecDisplay = await this.create_ApApiSpecDisplayJson_From_AsyncApiString({ 
      apApiEntityId: apApiEntityId,
      asyncApiSpecString: asyncApiSpecString,
      currentFormat: EAPApiSpecFormat.UNKNOWN,
    });
    if(typeof result === 'string') throw new Error(`${logName}: result`);
    return result;


    // .then((result: string | TAPApiSpecDisplay) => {
    //   if(typeof(result) === 'string') {
    //     throw new Error(`${logName}: error=${result}`);
    //   }
    //   return result;  
    // });

    // return create.then( (apApiSpecDisplay: TAPApiSpecDisplay) => {
    //   return apApiSpecDisplay;
    // });
    // // this is wrong

    // this.create_ApApiSpecDisplayJson_From_AsyncApiString({ 
    //   apApiEntityId: apApiEntityId,
    //   asyncApiSpecString: asyncApiSpecString,
    //   currentFormat: EAPApiSpecFormat.UNKNOWN,
    // })
    // .then((result: string | TAPApiSpecDisplay) => {
    //   if(typeof(result) === 'string') {
    //     throw new Error(`${logName}: error=${result}`);
    //   }
    //   return result;  
    // });
    // throw new Error(`${logName}: should never get here`);
  }

  /**
   * Creates a JSON format of TAPApiSpecDisplay from the async api string.
   * In case of error, returns an error message. Can be used for validation.
   */
  public async create_ApApiSpecDisplayJson_From_AsyncApiString({ apApiEntityId, asyncApiSpecString, currentFormat }:{
    apApiEntityId: TAPEntityId;
    asyncApiSpecString: string;
    currentFormat: EAPApiSpecFormat;
  }): Promise<TAPApiSpecDisplay | string> {
    const funcName = 'create_ApApiSpecDisplayJson_From_AsyncApiString';
    const logName = `${this.ComponentName}.${funcName}()`;

    try {
      const asyncApiDocument: any = await AsyncApiSpecParser.parse(asyncApiSpecString);
      // console.log(`${logName}: asyncApiDocument=\n${JSON.stringify(asyncApiDocument, null, 2)}`);
      // get the complete spec
      // note: this is a hack, _json property not documented and could change
      if(asyncApiDocument["_json"] === undefined) return(`${logName}: asyncApiDocument["_json"] === undefined`);
      const apApiSpecDisplay: TAPApiSpecDisplay = {
        apEntityId: apApiEntityId,
        format: EAPApiSpecFormat.JSON,
        spec: asyncApiDocument["_json"]
      };
      return apApiSpecDisplay;
    } catch(e: any) {
      const errors = e.validationErrors ? `, Errors: ${JSON.stringify(e.validationErrors)}` : '';
      return `${e.title}${errors}`;
    }
  }

  // public create_ApApiSpecDisplayJson_From_AsyncApiString({ apApiEntityId, asyncApiSpecString, currentFormat }:{
  //   apApiEntityId: TAPEntityId;
  //   asyncApiSpecString: string;
  //   currentFormat: EAPApiSpecFormat;
  // }): TAPApiSpecDisplay | string {
  //   const funcName = 'create_ApApiSpecDisplayJson_From_AsyncApiString';
  //   const logName = `${this.ComponentName}.${funcName}()`;
  //   switch(currentFormat) {
  //     case EAPApiSpecFormat.JSON:
  //       const apApiSpecDisplay: TAPApiSpecDisplay = {
  //         apEntityId: apApiEntityId,
  //         format: EAPApiSpecFormat.JSON,
  //         spec: asyncApiSpecString
  //       };
  //       return apApiSpecDisplay;
  //     case EAPApiSpecFormat.YAML: {
  //       // return `${logName}: implement conversion from YAML to JSON`;
  //       try {
  //         const doc: any = yaml.load(asyncApiSpecString);
  //         try {
  //           const jsonParsedDoc: any = JSON.parse(JSON.stringify(doc));
  //           const apApiSpecDisplay: TAPApiSpecDisplay = {
  //             apEntityId: apApiEntityId,
  //             format: EAPApiSpecFormat.JSON,
  //             spec: jsonParsedDoc,
  //           };
  //           return apApiSpecDisplay;
  //         } catch (e) {
  //           return `Unable to convert YAML to JSON, e=${e}`;
  //         }
  //       } catch (e) {
  //         return `Unable to convert YAML to JSON, e=${e}`;
  //       }
  //     }
  //     case EAPApiSpecFormat.UNKNOWN: {
  //       if(asyncApiSpecString === '') return 'Unable to parse, contents are empty.';
  //       try {
  //         const parsedSpec: any = JSON.parse(asyncApiSpecString);
  //         const apApiSpecDisplay: TAPApiSpecDisplay = {
  //           apEntityId: apApiEntityId,
  //           format: EAPApiSpecFormat.JSON,
  //           spec: parsedSpec,
  //         };
  //         return apApiSpecDisplay;
  //       } catch(jsonError: any) {
  //         console.error(`${logName}: jsonError=${jsonError}`);
  //         try {
  //           const doc: any = yaml.load(asyncApiSpecString);
  //           try {
  //             const jsonParsedDoc: any = JSON.parse(JSON.stringify(doc));
  //             if(typeof(jsonParsedDoc) !== 'object') return `Unable to parse as JSON or YAML, type:${typeof(jsonParsedDoc)}`;
  //             // console.log(`${logName}: typeof(jsonParseddoc)=${typeof(jsonParsedDoc)} , jsonParseddoc = ${JSON.stringify(doc, null, 2)}`);
  //             return this.create_ApApiSpecDisplayJson_From_AsyncApiString({
  //               apApiEntityId: apApiEntityId,
  //               asyncApiSpecString: asyncApiSpecString,
  //               currentFormat: EAPApiSpecFormat.YAML,
  //             });
  //           } catch (yamlError) {
  //             console.error(`${logName}: yamlError=${JSON.stringify(yamlError, null, 2)}`);
  //             return `Unable to parse as JSON or YAML, jsonError=${JSON.stringify(jsonError)}, error=${JSON.stringify(yamlError)}`;
  //           }
  //           // return { format: EAPAsyncApiSpecFormat.YAML, spec: asyncApiSpec.spec };
  //         } catch(yamlError: any) {
  //           console.error(`${logName}: yamlError=${JSON.stringify(yamlError, null, 2)}`);
  //           return `Unable to parse as JSON or YAML, error=${yamlError.reason}`;
  //         }  
  //       }
  //     }
  //     default:
  //       return Globals.assertNever(logName, currentFormat);
  //   }
  // }

  // private has_VersionString({ apApiSpecDisplay }:{
  //   apApiSpecDisplay: TAPApiSpecDisplay
  // }): boolean {
  //   try {
  //     this.get_VersionString({ apApiSpecDisplay: apApiSpecDisplay });
  //     return true;
  //   } catch(e: any) {
  //     return false;
  //   }
  // }
  // private has_Title({ apApiSpecDisplay }:{
  //   apApiSpecDisplay: TAPApiSpecDisplay
  // }): boolean {
  //   try {
  //     this.get_Title({ apApiSpecDisplay: apApiSpecDisplay });
  //     return true;
  //   } catch(e: any) {
  //     return false;
  //   }
  // }

  public async validateSpec({ specJSONorYAML }:{
    specJSONorYAML: any;
  }): Promise<boolean | string> {
    try {
      await AsyncApiSpecParser.parse(specJSONorYAML);
      // const asyncApiDocument: AsyncApiSpecParser.AsyncAPIDocument = await AsyncApiSpecParser.parse(specJSONorYAML);
      // // test if version is semVer format
      // try {
      //   APVersioningDisplayService.create_SemVerString(asyncApiDocument.version());
      // } catch (semverError: any) {
      //   return `cannot parse version as semVer, version=${asyncApiDocument.version()}`
      // }
    } catch(e: any) {
      return `${e.title} Errors: ${JSON.stringify(e.validationErrors)}`;
    }
    return true;
  }

  // public async validateSpec({ apApiSpecDisplay }:{
  //   apApiSpecDisplay: TAPApiSpecDisplay
  // }): Promise<boolean | string> {
  //   const funcName = 'validateSpec';
  //   const logName = `${this.ComponentName}.${funcName}()`;
  //   if(apApiSpecDisplay.format !== EAPApiSpecFormat.JSON) throw new Error(`${logName}: apApiSpecDisplay.format !== EAPApiSpecFormat.JSON`);
  //   try {
  //     await AsyncApiSpecParser.parse(apApiSpecDisplay.spec);
  //   } catch(e: any) {
  //     return `${e.title} Errors: ${JSON.stringify(e.validationErrors)}`;
  //   }
  //   const hasVersionString: boolean = this.has_VersionString({ apApiSpecDisplay: apApiSpecDisplay });
  //   if(!hasVersionString) return `Cannot read version from Async Api Spec. Missing object info/version.`;
  //   const hasTitle: boolean = this.has_Title({ apApiSpecDisplay: apApiSpecDisplay });
  //   if(!hasTitle) return `Cannot read title from Async Api Spec. Missing object info/title.`;
  //   return true;
  // }

  public get_RawVersionString({ apApiSpecDisplay }:{
    apApiSpecDisplay: TAPApiSpecDisplay
  }): string {
    const funcName = 'get_VersionString';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(apApiSpecDisplay.format !== EAPApiSpecFormat.JSON) throw new Error(`${logName}: apApiSpecDisplay.format !== EAPApiSpecFormat.JSON`);
    if(typeof(apApiSpecDisplay.spec) !== 'object') throw new Error(`${logName}: typeof(apApiSpecDisplay.spec) !== 'object'`);
    if(apApiSpecDisplay.spec['info'] === undefined) throw new Error(`${logName}: apApiSpecDisplay.spec['info'] === undefined`);
    if(apApiSpecDisplay.spec['info']['version'] === undefined) throw new Error(`${logName}: apApiSpecDisplay.spec['info']['version'] === undefined`);
    return apApiSpecDisplay.spec['info']['version'];
  }
  public get_VersionString({ apApiSpecDisplay }:{
    apApiSpecDisplay: TAPApiSpecDisplay
  }): string {
    return APVersioningDisplayService.create_SemVerString(this.get_RawVersionString({ apApiSpecDisplay: apApiSpecDisplay }));
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
