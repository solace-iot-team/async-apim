import { Meta } from "@solace-iot-team/apim-connector-openapi-browser";
import { SemVer } from "semver";

export interface IAPVersionInfo {
  apLastVersion: string;
  apCurrentVersion: string;
  apVersionList?: TAPVersionList;
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
    if(connectorMeta === undefined) return this.create_Empty_ApVersionInfo();
    return {
      apLastVersion: connectorRevisions !== undefined ? this.get_LastVersion(connectorRevisions) : connectorMeta.version,
      apCurrentVersion: currentVersion ? currentVersion : connectorMeta.version,
      apVersionList: connectorRevisions
    };
  }

  public get_Sorted_ApVersionList(list: TAPVersionList): TAPVersionList {
    return list.sort( (e1: string, e2: string) => {
      const e1SemVer = new SemVer(e1);
      const e2SemVer = new SemVer(e2);
      return e2SemVer.compare(e1SemVer);
    });
  }

  public create_NewVersion(): string {
    return '1.0.0';
  }

  public create_NextVersion(version: string): string {
    const versionSemVer = new SemVer(version);
    versionSemVer.inc("minor");
    return versionSemVer.format();
  }

  public is_GreaterThan(lastVersion: string, newVersion: string): boolean {
    const lastVersionSemVer = new SemVer(lastVersion);
    if(lastVersionSemVer.compare(newVersion) === -1) return true;
    return false;
  }

}

export default new APVersioningDisplayService();
