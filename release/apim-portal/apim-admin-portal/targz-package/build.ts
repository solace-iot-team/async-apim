import s from 'shelljs';
import path from 'path';
import tar from 'tar';
import { Constants } from '../lib/Constants';


const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const CONSTANTS = new Constants(scriptDir);

type TGlobals = {
  targzFileName: string;  
};
var Globals: TGlobals = {
  targzFileName: ''
}

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', CONSTANTS.WorkingApimPortalDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', CONSTANTS.ContextDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', CONSTANTS.TarFileReleaseDir).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copyBuildArtefactsToWorkingDir = () => {
  const funcName = 'copyBuildArtefactsToWorkingDir';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  console.log(`${logName}: copying built apim-portal artefacts to working dir ...`);
  if(s.cp('-rf', `${CONSTANTS.ApimAdminPortalBuildArtefactsDir}/build`, `${CONSTANTS.WorkingApimPortalDir}/build`).code !== 0) process.exit(1);
  // if(s.cp('-rf', `${CONSTANTS.ApimAdminPortalBuildArtefactsDir}/node_modules`, `${CONSTANTS.WorkingApimPortalDir}/node_modules`).code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const setGlobals = () => {
  const funcName = 'setGlobals';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const apimPortalPackageJson = require(`${CONSTANTS.ApimAdminPortalBuildArtefactsDir}/package.json`);
  const releasePackageJson = require(`${scriptDir}/package.json`);

  Globals.targzFileName = `${releasePackageJson.name}.${apimPortalPackageJson.version}.tgz`;
  console.log(`${logName}: Globals = ${JSON.stringify(Globals, null, 2)}`);
  console.log(`${logName}: success.`);
}

const buildTarFileContext = () => {
  const funcName = 'buildTarFileContext';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  // copy files & dirs
  for (const include of CONSTANTS.AssetsIncludeList) {
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
    cwd: CONSTANTS.ContextDir,
    file: `${CONSTANTS.TarFileReleaseDir}/${Globals.targzFileName}`
  };
  const fileList: Array<string> = [
    'apim-portal'
  ];
  tar.create(tarCreateOptions, fileList);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  CONSTANTS.log();

  prepare();
  copyBuildArtefactsToWorkingDir();
  setGlobals();
  buildTarFileContext();
  buildTarFile();

  console.log(`${logName}: success.`);
}

main();
