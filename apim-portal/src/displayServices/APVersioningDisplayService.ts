import { Meta } from "@solace-iot-team/apim-connector-openapi-browser";
import { SemVer, coerce as SemVerCoerce } from "semver";

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
    const funcName = 'create_ApVersionInfo_From_ApiEntities';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(connectorMeta === undefined) return this.create_Legacy_ApVersionInfo();
    // connectorRevisions could be undefined or empty list
    const lastVersion: string | undefined = connectorRevisions !== undefined ? this.get_LastVersion(connectorRevisions) : connectorMeta.version;
    if(lastVersion === undefined) throw new Error(`${logName}: lastVersion === undefined`);
    const _currentVersion: string | undefined = currentVersion ? currentVersion : connectorMeta.version;
    if(_currentVersion === undefined) throw new Error(`${logName}: _currentVersion === undefined`);
    return {
      apLastVersion: lastVersion,
      apCurrentVersion: this.create_SemVerString(_currentVersion),
      apVersionList: connectorRevisions !== undefined && connectorRevisions.length > 0 ? connectorRevisions : [lastVersion],
    };
  }

  /**
   * Returns a semVer string of a version string.
   */
  public create_SemVerString(versionString: string): string {
    const funcName = 'create_SemVerString';
    const logName = `${this.ComponentName}.${funcName}()`;
    try {
      // semVer?
      const semVer: SemVer | null = SemVerCoerce(versionString, {
        loose: true
      });
      if(semVer === null) throw new Error('try number string');
      return semVer.format();
    } catch (e) {
      // number string?
      const num: number = parseInt(versionString);
      if(isNaN(num)) throw new Error(`${logName}: cannot parse version as semVer or number, version=${versionString}`);
      return `${num}.0.0`;
    }
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
