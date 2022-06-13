
const ENV_VAR_APIM_RELEASE_ALPHA_VERSION = "APIM_RELEASE_ALPHA_VERSION";

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
  private _alphaVersion: string | undefined; 

  private _assetsIncludeList: TAssetsIncludeList = [];
  private readonly _assetDir: string;
  
  private initAssetIncludeList() {
    this._assetsIncludeList = [
      {
        sources: `${this._workingApimPortalDir}/build/*`,
        targetDir: `${this._contextDir}/apim-portal`
      },
      {
        sources: `${this._assetDir}/nginx.conf`,
        targetDir: `${this._contextDir}`
      }
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
    this._alphaVersion = process.env[ENV_VAR_APIM_RELEASE_ALPHA_VERSION];
    this._assetDir = `${scriptDir}/assets`;
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
  public get AlphaVersion() { return this._alphaVersion; }
  public get AssetDir() { return this._assetDir; }

  public createDockerImageTag = (version: string): string => {
    if(this._alphaVersion) {
      return `${version}-${this._alphaVersion.replaceAll('+', '-')}`;
    }
    return version;
  }  
  public createLatestTag = (): string => {
    if(this._alphaVersion) return 'alpha-latest';
    return 'latest';
  } 
  public createTarGzFileName = (name: string, version: string): string => {
    return `${name}.${this.createDockerImageTag(version)}.tgz`;
  }


}
