import { Meta } from "@solace-iot-team/apim-connector-openapi-browser";
import { SemVer, coerce as SemVerCoerce, valid as SemVerValid } from "semver";

export type TAPVersionTreeTableNode = {
  key: string;
  label: string;
  data: string;
  children: TAPVersionTreeTableNodeList;
  selectable?: boolean;
  style?: object;
}
export type TAPVersionTreeTableNodeList = Array<TAPVersionTreeTableNode>;

export type TAPVersionMapping = {
  apVersion: string;
  connectorRevision: string;
}

export interface IAPVersionInfo {
  apLastVersion: string;
  apCurrentVersion: string;
  apVersionList: TAPVersionList;
  apLastMajorVersionList: TAPVersionList;
  apVersion_ConnectorRevision_Map: Array<TAPVersionMapping>; 
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
      apVersionList: [],
      apLastMajorVersionList: [],
      apVersion_ConnectorRevision_Map: [],
    };
  }

  private create_Legacy_ApVersionInfo = (): IAPVersionInfo => {
    const defaultVersion = '1.0.1';
    return {
      apLastVersion: defaultVersion,
      apCurrentVersion: defaultVersion,
      apVersionList: [defaultVersion],
      apLastMajorVersionList: [defaultVersion],
      apVersion_ConnectorRevision_Map: [{apVersion: defaultVersion, connectorRevision: defaultVersion}]
    };
  }

  private get_LastVersion(apVersionList: TAPVersionList): string {
    // const funcName = 'get_LastVersion';
    // const logName = `${this.ComponentName}.${funcName}()`;
    // alert(`${logName}: connectorRevisions=${JSON.stringify(connectorRevisions, null, 2)}`);
    let lastVersion: string = '0.0.1';
    for(const apVersion of apVersionList) {
      const semVer = new SemVer(apVersion);
      if(semVer.compare(lastVersion) === 1) lastVersion = apVersion;
    }
    // alert(`${logName}: lastVersion=${lastVersion}`);
    return lastVersion;
  }

  public create_ApVersionInfo_From_ApiEntities({ connectorMeta, apVersionList, connectorRevisionList, currentVersion }:{
    connectorMeta?: Meta;
    apVersionList?: TAPVersionList;
    connectorRevisionList?: Array<string>;
    currentVersion?: string;
  }): IAPVersionInfo {
    const funcName = 'create_ApVersionInfo_From_ApiEntities';
    const logName = `${this.ComponentName}.${funcName}()`;
    if(connectorMeta === undefined) return this.create_Legacy_ApVersionInfo();
    // connectorRevisions could be undefined or empty list
    const _lastVersion: string | undefined = apVersionList !== undefined ? this.get_LastVersion(apVersionList) : connectorMeta.version !== undefined ? this.create_SemVerString(connectorMeta.version) : undefined;
    // alert(`${logName}: _lastVersion = ${_lastVersion}`);
    if(_lastVersion === undefined) throw new Error(`${logName}: lastVersion === undefined`);
    const _currentVersion: string | undefined = currentVersion ? currentVersion : _lastVersion;
    // alert(`${logName}: _currentVersion = ${_currentVersion}`);
    if(_currentVersion === undefined) throw new Error(`${logName}: _currentVersion === undefined`);

    let _apVersionList: TAPVersionList = [_lastVersion];
    let _lastMajorVersionList: TAPVersionList = [_lastVersion];
    let _apVersionMappingList: Array<TAPVersionMapping> = [ { apVersion: _lastVersion, connectorRevision: _lastVersion}];
    if(connectorRevisionList !== undefined && connectorRevisionList.length > 0) {
      const __apVersionList: TAPVersionList = [];
      const __apVersionMappingList: Array<TAPVersionMapping> = [];
      connectorRevisionList.forEach( (x: string) => {
        const apv = this.create_SemVerString(x);
        __apVersionList.push(apv);
        __apVersionMappingList.push({ apVersion: apv, connectorRevision: x});
      });
      _apVersionList = __apVersionList;
      _apVersionMappingList = __apVersionMappingList;
      _lastMajorVersionList = this.create_LastMajorVersionList({ connectorRevisions: connectorRevisionList });
    }
    
    return {
      apLastVersion: _lastVersion,
      apCurrentVersion: this.create_SemVerString(_currentVersion),
      apVersionList: _apVersionList,
      apLastMajorVersionList: _lastMajorVersionList,
      apVersion_ConnectorRevision_Map: _apVersionMappingList,
    };
  }

  public get_OrginalConnectorRevision({ apVersion, apVersion_ConnectorRevision_Map }: {
    apVersion_ConnectorRevision_Map: Array<TAPVersionMapping>;
    apVersion: string;
  }): string {
    const funcName = 'get_OrginalConnectorRevision';
    const logName = `${this.ComponentName}.${funcName}()`;
    const found: TAPVersionMapping | undefined = apVersion_ConnectorRevision_Map.find( (x) => {
      return x.apVersion === apVersion;
    });
    if(found === undefined) throw new Error(`${logName}: found === undefined`);
    return found.connectorRevision;
  }

  private create_LastMajorVersionList({ connectorRevisions }:{
    connectorRevisions: Array<string>;
  }): TAPVersionList {
    const funcName = 'create_LastMajorVersionList';
    const logName = `${this.ComponentName}.${funcName}()`;

    const sortedSemVerStringList: TAPVersionList = this.create_SortedSemVerStringList({ revisionList: connectorRevisions });
    const majorVersionList: TAPVersionList = [];

    const majorVersionMap: Map<number, Array<string>> = new Map();

    for(const semVerString of sortedSemVerStringList) {
      const semVer = new SemVer(semVerString);
      const list: Array<string> | undefined = majorVersionMap.get(semVer.major);
      if(list === undefined) majorVersionMap.set(semVer.major, [semVerString]);
      else list.push(semVerString);
    }
    for(let key of majorVersionMap.keys()) {
      // get the last version
      const list: Array<string> | undefined = majorVersionMap.get(key);
      if(list === undefined) throw new Error(`${logName}: list === undefined`);
      if(list.length === 0) throw new Error(`${logName}: list.length === 0`);
      majorVersionList.push(list[0]);
    }
    return majorVersionList;
  }

  private create_VersionChildrenTreeTableNodeList({ children }:{
    children: Array<string>;
  }): TAPVersionTreeTableNodeList {
    const childrenTreeTableNodelList: TAPVersionTreeTableNodeList = [];
    for(const child of children) {
      childrenTreeTableNodelList.push({
        key: child,
        label: child,
        data: child,
        children: [],
        selectable: true
      });
    }
    return childrenTreeTableNodelList;
  }

  private create_MajorVersionTreeTableNode({ major, list }:{
    major: number;
    list: Array<string>;
  }): TAPVersionTreeTableNode {
    const node: TAPVersionTreeTableNode = {
      key: major.toString(),
      label: `v${major}.x.x`,
      data: major.toString(),
      children: this.create_VersionChildrenTreeTableNodeList( { children: list }),
      selectable: false,
    }
    return node;
  }

  public create_VersionTreeTableNodeList({ apVersionList }:{
    apVersionList: TAPVersionList;
  }): TAPVersionTreeTableNodeList {
    const funcName = 'create_VersionTreeTableNodeList';
    const logName = `${this.ComponentName}.${funcName}()`;

    const sortedSemVerStringList: TAPVersionList = this.create_SortedSemVerStringList({ revisionList: apVersionList });
    const majorVersionMap: Map<number, Array<string>> = new Map();
    for(const semVerString of sortedSemVerStringList) {
      const semVer = new SemVer(semVerString);
      const list: Array<string> | undefined = majorVersionMap.get(semVer.major);
      if(list === undefined) majorVersionMap.set(semVer.major, [semVerString]);
      else list.push(semVerString);
    }
    const treeTableNodeList: TAPVersionTreeTableNodeList = [];
    for(let key of majorVersionMap.keys()) {
      const list: Array<string> | undefined = majorVersionMap.get(key);
      if(list === undefined) throw new Error(`${logName}: list === undefined`);
      const majorNode = this.create_MajorVersionTreeTableNode({ major: key, list: list });
      treeTableNodeList.push(majorNode);
    }
    return treeTableNodeList;
  }

  private create_SortedSemVerStringList({ revisionList }:{
    revisionList: Array<string>;
  }): TAPVersionList {
    const semVerStringList: TAPVersionList = [];
    for(const revision of revisionList) {
      semVerStringList.push(this.create_SemVerString(revision));
    }
    return this.get_Sorted_ApVersionList(semVerStringList);
  }

  public isSemVerFormat(versionString: string): boolean {
    try {
      const s: string | null = SemVerValid(versionString);
      if(s === null) return false;
      return true;
    } catch(e) {
      return false;
    }
  }
  /**
   * Returns a semVer string of a version string.
   */
  public create_SemVerString(versionString: string): string {
    const funcName = 'create_SemVerString';
    const logName = `${this.ComponentName}.${funcName}()`;
    try {
      // tolerance for OLD apis: version='default'
      if(versionString === 'default') versionString = '1.1.1';
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

  public create_New_ApVersionInfo = (): IAPVersionInfo => {
    const defaultVersion = this.create_NewVersion();
    return {
      apLastVersion: defaultVersion,
      apCurrentVersion: defaultVersion,
      apVersionList: [defaultVersion],
      apLastMajorVersionList: [defaultVersion],
      apVersion_ConnectorRevision_Map: [ { apVersion: defaultVersion, connectorRevision: defaultVersion }],
    };
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
