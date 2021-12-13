import s from 'shelljs';
import path from 'path';
import tar from 'tar';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const WorkingDir = `${scriptDir}/working_dir`;
const ApimAdminPortalBuildArtefactsDir = '../working_dir/apim-portal';
const WorkingApimPortalDir = `${WorkingDir}/apim-portal`;
const TarFileContextDir = `${WorkingDir}/tar-context`;
const ReleaseDir=`${WorkingDir}/release`;

type TGlobals = {
  targzFileName: string;  
};
var Globals: TGlobals = {
  targzFileName: ''
}

type TAssetsInclude =   {
  sources: string;
  targetDir: string;
  targetFile?: string;
};
type TAssetsIncludeList = Array<TAssetsInclude>;
const AssetsIncludeList: TAssetsIncludeList = [
  {
    sources: `${WorkingApimPortalDir}/build/admin-portal/*.json`,
    targetDir: `${TarFileContextDir}/admin-portal`
  },
  {
    sources: `${WorkingApimPortalDir}/build/images/*.png`,
    targetDir: `${TarFileContextDir}/admin-portal/images`
  },
  {
    sources: `${WorkingApimPortalDir}/build/static`,
    targetDir: `${TarFileContextDir}/admin-portal`
  },
  {
    sources: `${WorkingApimPortalDir}/build/*.txt`,
    targetDir: `${TarFileContextDir}/admin-portal`
  },
  {
    sources: `${WorkingApimPortalDir}/build/asset-manifest.json`,
    targetDir: `${TarFileContextDir}/admin-portal`
  },
  {
    sources: `${WorkingApimPortalDir}/build/index.html`,
    targetDir: `${TarFileContextDir}/admin-portal`
  },
  {
    sources: `${WorkingApimPortalDir}/build/manifest.json`,
    targetDir: `${TarFileContextDir}/admin-portal`
  }
];

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', WorkingApimPortalDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', ReleaseDir).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copyBuildArtefactsToWorkingDir = () => {
  const funcName = 'copyBuildArtefactsToWorkingDir';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  console.log(`${logName}: copying built apim-portal artefacts to working dir ...`);
  if(s.cp('-rf', `${ApimAdminPortalBuildArtefactsDir}/build`, `${WorkingApimPortalDir}/build`).code !== 0) process.exit(1);
  if(s.cp('-rf', `${ApimAdminPortalBuildArtefactsDir}/node_modules`, `${WorkingApimPortalDir}/node_modules`).code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const setGlobals = () => {
  const funcName = 'setGlobals';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const apimPortalPackageJson = require(`${ApimAdminPortalBuildArtefactsDir}/package.json`);
  const releasePackageJson = require(`${scriptDir}/package.json`);

  Globals.targzFileName = `${releasePackageJson.name}.${apimPortalPackageJson.version}.tgz`;
  console.log(`${logName}: Globals = ${JSON.stringify(Globals, null, 2)}`);
  console.log(`${logName}: success.`);
}

const buildTarFileContext = () => {
  const funcName = 'buildTarFileContext';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  // create dir & ensure it is empty
  if(s.mkdir('-p', TarFileContextDir).code !== 0) process.exit(1);
  if(s.rm('-rf', `${TarFileContextDir}/`).code !== 0) process.exit(1);

  // copy files & dirs
  for (const include of AssetsIncludeList) {
    console.log(`${logName}: include = \n${JSON.stringify(include, null, 2)}`);
    if(s.mkdir('-p', include.targetDir).code !== 0) process.exit(1);
    if(include.targetFile) {
      if(s.cp('-rf', include.sources, `${include.targetDir}/${include.targetFile}`).code !== 0) process.exit(1);
    } else {
      if(s.cp('-rf', include.sources, include.targetDir).code !== 0) process.exit(1);
    }
  }

  console.log(`${logName}: success.`);
}

const buildTarFile = () => {
  const funcName = 'buildTarFile';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  const tarCreateOptions: tar.ReplaceOptions = {
    sync: true,
    gzip: true,
    strict: true,
    cwd: TarFileContextDir,
    file: `${ReleaseDir}/${Globals.targzFileName}`
  };
  const fileList: Array<string> = [
    'admin-portal'
  ];
  tar.create(tarCreateOptions, fileList);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  prepare();
  copyBuildArtefactsToWorkingDir();
  setGlobals();
  buildTarFileContext();
  buildTarFile();

  console.log(`${logName}: success.`);
}

main();
