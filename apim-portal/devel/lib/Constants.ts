
export class Constants {
  private readonly _scriptDir: string;
  private readonly _apimPortalDir: string;
  private readonly _outputAdminPortalAboutFile: string;
  private readonly _outputDeveloperPortalAboutFile: string;


  private readonly _workingDir: string;
  private readonly _apimServerDir: string;
  private readonly _workingApimServerDir: string;
  private readonly _generatedApimServerOpenApiSrcDir: string;
  private readonly _outputGeneratedApimServerOpenApiSrcDir: string;

  constructor(scriptDir: string) {
    this._scriptDir = scriptDir;
    this._apimPortalDir = scriptDir;
    this._outputAdminPortalAboutFile = `${this._apimPortalDir}/public/admin-portal/about.json`;
    this._outputDeveloperPortalAboutFile = `${this._apimPortalDir}/public/developer-portal/about.json`;
    this._workingDir = `${scriptDir}/working_dir`;
    this._apimServerDir = `${scriptDir}/../apim-server`;
    this._workingApimServerDir = `${this._workingDir}/apim-server`;
    this._generatedApimServerOpenApiSrcDir = `${this._workingApimServerDir}/src/@solace-iot-team/apim-server-openapi-browser`;
    this._outputGeneratedApimServerOpenApiSrcDir = `${this._apimPortalDir}/src/_generated/@solace-iot-team/apim-server-openapi-browser`;
  }
  public log() {
    console.log(`${Constants.name} = ${JSON.stringify(this, null, 2)}`);
  }
  public get ScriptDir() { return this._scriptDir; }
  public get ApimPortalDir() { return this._apimPortalDir; }
  public get OutputAdminPortalAboutFile() { return this._outputAdminPortalAboutFile; }
  public get OutputDeveloperPortalAboutFile() { return this._outputDeveloperPortalAboutFile; }

  public get WorkingDir() { return this._workingDir; }
  public get ApimServerDir() { return this._apimServerDir; }
  public get WorkingApimServerDir() { return this._workingApimServerDir; }
  public get GeneratedApimServerOpenApiSrcDir() { return this._generatedApimServerOpenApiSrcDir; }
  public get OutputGeneratedApimServerOpenApiSrcDir() { return this._outputGeneratedApimServerOpenApiSrcDir; }
}
