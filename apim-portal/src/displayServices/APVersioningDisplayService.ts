import { Meta } from "@solace-iot-team/apim-connector-openapi-browser";
import { SemVer } from "semver";

export interface IAPVersionInfo {
  apLastVersion: string;
  apCurrentVersion: string;
  apVersionList: TAPVersionList;
}
export type TAPVersionList = Array<string>;

class APVersioningDisplayService {
  private readonly ComponentName = "APVersioningDisplayService";

  public nameOf(name: keyof IAPVersionInfo) {
    return `${name}`;
  }

  public create_Empty_ApVersionInfo = (): IAPVersionInfo => {
    return {
      apLastVersion: '',
      apCurrentVersion: '',
      apVersionList: []
    };
  }

  private create_Legacy_ApVersionInfo = (): IAPVersionInfo => {
    const defaultVersion = '1.0.1';
    return {
      apLastVersion: defaultVersion,
      apCurrentVersion: defaultVersion,
      apVersionList: [defaultVersion]
    };
  }

  private get_LastVersion(connectorRevisions: Array<string>): string {
    let lastVersion: string = '0.0.1';
    for(const revision of connectorRevisions) {
      const revisionSemVer = new SemVer(revision);
      if(revisionSemVer.compare(lastVersion) === 1) lastVersion = revision;
    }
    return lastVersion;
  }

  public create_ApVersionInfo_From_ApiEntities({ connectorMeta, connectorRevisions, currentVersion }:{
    connectorMeta?: Meta;
    connectorRevisions?: Array<string>;
    currentVersion?: string;
  }): IAPVersionInfo {
    if(connectorMeta === undefined) return this.create_Legacy_ApVersionInfo();
    // connectorRevisions could be undefined or empty list
    const lastVersion: string = connectorRevisions !== undefined ? this.get_LastVersion(connectorRevisions) : connectorMeta.version;
    return {
      apLastVersion: lastVersion,
      apCurrentVersion: currentVersion ? currentVersion : connectorMeta.version,
      apVersionList: connectorRevisions !== undefined && connectorRevisions.length > 0 ? connectorRevisions : [lastVersion],
    };
  }

  public get_Sorted_ApVersionList(list: TAPVersionList): TAPVersionList {
    return list.sort( (e1: string, e2: string) => {
      const e1SemVer = new SemVer(e1);
      const e2SemVer = new SemVer(e2);
      return e2SemVer.compare(e1SemVer);
    });
  }

  // public get_Sorted_ApMinorList(list: TAPVersionList): Array<number> {
  //   const minorList: Array<number> = list.map( (versionStr: string) => {
  //     const semVer = new SemVer(versionStr);
  //     return semVer.minor;
  //   });
  //   return minorList.sort();
  // }

  public create_NewVersion(): string {
    return '1.0.0';
  }

  public create_NextMajorVersion(version: string): string {
    const versionSemVer = new SemVer(version);
    versionSemVer.inc("major");
    versionSemVer.minor = 0;
    versionSemVer.patch = 1;
    return versionSemVer.format();
  }

  public create_NextVersion(version: string): string {
    const versionSemVer = new SemVer(version);
    versionSemVer.inc("minor");
    return versionSemVer.format();
  }
  
  public create_NextLifecycleUpdateVersion(version: string): string {
    const versionSemVer = new SemVer(version);
    versionSemVer.inc("patch");
    return versionSemVer.format();
  }

  public is_NewVersion_GreaterThan_LastVersion({ newVersion, lastVersion }:{
    lastVersion: string, newVersion: string
  }): boolean {
    const lastVersionSemVer = new SemVer(lastVersion);
    if(lastVersionSemVer.compare(newVersion) === -1) return true;
    return false;
  }

}

export default new APVersioningDisplayService();
