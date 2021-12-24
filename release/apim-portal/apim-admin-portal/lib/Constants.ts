
export type TAssetsInclude =   { 
  sources: string;
  targetDir: string;
  targetFile?: string;
};
export type TAssetsIncludeList = Array<TAssetsInclude>;

export class Constants {
  private readonly _scriptDir: string;
  private readonly _workingDir: string;
  private readonly _apimAdminPortalBuildArtefactsDir: string;
  private readonly _workingApimPortalDir: string;
  private readonly _contextDir: string;
  // private readonly _tarFileContextDir: string;
  private readonly _tarFileReleaseDir: string;
  private readonly _skipping: string;
  private readonly _dockerFile: string;

  private _assetsIncludeList: TAssetsIncludeList = [];
  
  private initAssetIncludeList() {
    this._assetsIncludeList = [
      {
        sources: `${this._workingApimPortalDir}/build/*`,
        targetDir: `${this._contextDir}/apim-portal`
      },
    ];  

    // this._assetsIncludeList = [
    //   {
    //     sources: `${this._workingApimPortalDir}/build/admin-portal/*.json`,
    //     targetDir: `${this._tarFileContextDir}/admin-portal`
    //   },
    //   {
    //     sources: `${this._workingApimPortalDir}/build/images/*.png`,
    //     targetDir: `${this._tarFileContextDir}/admin-portal/images`
    //   },
    //   {
    //     sources: `${this._workingApimPortalDir}/build/static`,
    //     targetDir: `${this._tarFileContextDir}/admin-portal`
    //   },
    //   {
    //     sources: `${this._workingApimPortalDir}/build/*.txt`,
    //     targetDir: `${this._tarFileContextDir}/admin-portal`
    //   },
    //   {
    //     sources: `${this._workingApimPortalDir}/build/asset-manifest.json`,
    //     targetDir: `${this._tarFileContextDir}/admin-portal`
    //   },
    //   {
    //     sources: `${this._workingApimPortalDir}/build/index.html`,
    //     targetDir: `${this._tarFileContextDir}/admin-portal`
    //   },
    //   {
    //     sources: `${this._workingApimPortalDir}/build/manifest.json`,
    //     targetDir: `${this._tarFileContextDir}/admin-portal`
    //   }
    // ];  
  }
  
  constructor(scriptDir: string) {
    this._scriptDir = scriptDir;
    this._skipping = '+++ SKIPPING +++';
    this._workingDir = `${scriptDir}/working_dir`;
    this._apimAdminPortalBuildArtefactsDir = `${scriptDir}/../working_dir/apim-portal`;
    this._workingApimPortalDir = `${this._workingDir}/apim-portal`;
    this._contextDir = `${this._workingDir}/context`;
    this._tarFileReleaseDir = `${this._workingDir}/tar-release`;
    this._dockerFile = `${scriptDir}/Dockerfile`;
    this.initAssetIncludeList();
  }
  public log() {
    console.log(`${Constants.name} = ${JSON.stringify(this, null, 2)}`);
  }
  public get ScriptDir() { return this._scriptDir; }
  public get WorkingDir() { return this._workingDir; }
  public get ApimAdminPortalBuildArtefactsDir() { return this._apimAdminPortalBuildArtefactsDir; }
  public get WorkingApimPortalDir() { return this._workingApimPortalDir; }
  // public get TarFileContextDir() { return this._tarFileContextDir; }
  public get TarFileReleaseDir() { return this._tarFileReleaseDir; }
  public get Skipping() { return this._skipping; }
  public get AssetsIncludeList() { return this._assetsIncludeList; }
  public get ContextDir() { return this._contextDir; }
  public get DockerFile() { return this._dockerFile; }

}