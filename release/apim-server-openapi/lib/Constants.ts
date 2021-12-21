
export class Constants {
  private readonly _scriptDir: string;
  private readonly _workingDir: string;
  private readonly _apimServerDir: string;
  private readonly _workingApimServerDir: string;
  private readonly _skipping: string;
  private readonly _releaseDirBrowser: string;
  private readonly _releaseDirNode: string;

  constructor(scriptDir: string) {
    this._scriptDir = scriptDir;
    this._skipping = '+++ SKIPPING +++';
    this._workingDir = `${scriptDir}/working_dir`;
    this._apimServerDir = `${scriptDir}/../../apim-server`;
    this._workingApimServerDir = `${this._workingDir}/apim-server`;
    this._releaseDirBrowser = `${scriptDir}/apim-server-openapi-browser`;
    this._releaseDirNode = `${scriptDir}/apim-server-openapi-node`;
  }
  public log() {
    console.log(`${Constants.name} = ${JSON.stringify(this, null, 2)}`);
  }
  public get ScriptDir() { return this._scriptDir; }
  public get WorkingDir() { return this._workingDir; }
  public get ApimServerDir() { return this._apimServerDir; }
  public get WorkingApimServerDir() { return this._workingApimServerDir; }
  public get Skipping() { return this._skipping; }
  public get ReleaseDirBrowser() { return this._releaseDirBrowser; }
  public get ReleaseDirNode() { return this._releaseDirNode; }

}
