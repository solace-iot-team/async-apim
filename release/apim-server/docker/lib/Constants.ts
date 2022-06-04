
const ENV_VAR_APIM_RELEASE_ALPHA_VERSION = "APIM_RELEASE_ALPHA_VERSION";

export class Constants {
  private readonly _scriptDir: string;
  private readonly _gitRoot: string;
  private readonly _workingDir: string;
  private readonly _apimServerDir: string;
  private readonly _workingApimServerDir: string;
  private readonly _skipping: string;
  private readonly _dockerContextDir: string;
  private readonly _dockerFile: string;
  private readonly _dockerHubUser: string;
  private _dockerImageName: string | undefined;
  private _dockerImageTag: string | undefined;
  private _dockerImageTagLatest: string | undefined;
  private _alphaVersion: string | undefined; 

  constructor(scriptDir: string) {
    this._scriptDir = scriptDir;
    this._gitRoot = `${scriptDir}/../../..`;
    this._workingDir = `${scriptDir}/working_dir`;
    this._apimServerDir = `${this._gitRoot}/apim-server`;
    this._workingApimServerDir = `${this._workingDir}/apim-server`;
    this._skipping = '+++ SKIPPING +++';
    this._dockerContextDir = `${this._workingDir}/docker-context`;
    this._dockerFile = `${scriptDir}/Dockerfile`;
    this._dockerHubUser = "solaceiotteam";
    this._alphaVersion = process.env[ENV_VAR_APIM_RELEASE_ALPHA_VERSION];
  }
  private createDockerImageTag = (version: string): string => {
    if(this._alphaVersion) {
      return `${version}-${this._alphaVersion.replaceAll('+', '-')}`;
    }
    return version;
  }  
  private createLatestTag = (): string => {
    if(this._alphaVersion) return 'alpha-latest';
    return 'latest';
  }  
  public initAfterCopy() {
    const apimServerPackageJson = require(`${this._workingApimServerDir}/package.json`);
    const releasePackageJson = require(`${this._scriptDir}/package.json`);
    this._dockerImageName = releasePackageJson.name;
    this._dockerImageTag = `${this._dockerImageName}:${this.createDockerImageTag(apimServerPackageJson.version)}`; 
    this._dockerImageTagLatest = `${this._dockerImageName}:${this.createLatestTag()}`;   
  }
  public log() {
    console.log(`${Constants.name} = ${JSON.stringify(this, null, 2)}`);
  }
  public get ScriptDir() { return this._scriptDir; }
  public get GitRoot() { return this._gitRoot; }
  public get WorkingDir() { return this._workingDir; }
  public get ApimServerDir() { return this._apimServerDir; }
  public get WorkingApimServerDir() { return this._workingApimServerDir; }
  public get Skipping() { return this._skipping; }
  public get DockerContextDir() { return this._dockerContextDir; }
  public get DockerFile() { return this._dockerFile; }
  public get DockerHubUser() { return this._dockerHubUser; }
  public get DockerImageName() {
    if(!this._dockerImageName) throw new Error(`${Constants.name}: this._dockerImageName is undefined`);
    return this._dockerImageName;
  }
  public get DockerImageTag() {
    if(!this._dockerImageTag) throw new Error(`${Constants.name}: this._dockerImageTag is undefined`);
    return this._dockerImageTag;
  }
  public get DockerImageTagLatest() {
    if(!this._dockerImageTagLatest) throw new Error(`${Constants.name}: this._dockerImageTagLatest is undefined`);
    return this._dockerImageTagLatest;
  }
  public get AlphaVersion() { return this._alphaVersion; }

}
