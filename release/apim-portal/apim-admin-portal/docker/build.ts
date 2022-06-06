import s from 'shelljs';
import path from 'path';
import { Constants } from '../lib/Constants';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const CONSTANTS = new Constants(scriptDir);

let DockerImageName: string;
let DockerImageTag: string;
let DockerImageTagLatest: string;

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', CONSTANTS.WorkingApimPortalDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', CONSTANTS.ContextDir).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copyBuiltArtefactsToWorkingDir = () => {
  const funcName = 'copyBuiltArtefactsToWorkingDir';
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

  DockerImageName = releasePackageJson.name;
  DockerImageTag = `${DockerImageName}:${CONSTANTS.createDockerImageTag(apimPortalPackageJson.version)}`;
  DockerImageTagLatest = `${DockerImageName}:${CONSTANTS.createLatestTag()}`;;
  // DockerImageTag = `${DockerImageName}:${apimPortalPackageJson.version}`;
  // DockerImageTagLatest = `${DockerImageName}:latest`;
  // console.log(`${logName}: Globals = ${JSON.stringify(Globals, null, 2)}`);
  console.log(`${logName}: success.`);
}

const buildDockerContext = () => {
  const funcName = 'buildDockerContext';
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

const removeDockerContainersByImageName = () => {
  const funcName = 'removeDockerContainersByImageName';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  console.log(`${logName}: removing any existing containers for image: ${DockerImageName}`);
  const cmd = `docker ps | awk '{split($2,image,":"); print $1, image[1]}' | awk -v image=${DockerImageName} '$2 == image {print $1}'`;
  const {stdout, stderr, code } = s.exec(cmd, { silent: false });
  if(code !== 0) process.exit(1);
    const containerIds: string[] = stdout.split("\n");
    for(const containerId of containerIds) {
      if(containerId.length > 0) {
        console.log(`${logName}: removing containerId = '${containerId}'`);
        if(s.exec(`docker rm -f ${containerId}`, { silent: false }).code !== 0) process.exit(1);
      }
    }
  console.log(`${logName}: success.`);
}

const buildDockerImage = () => {
  const funcName = 'buildDockerImage';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  console.log(`${logName}: removing any existing images, tags=${DockerImageTag}, ${DockerImageTagLatest}`);
  if(s.exec(`docker rmi -f ${DockerImageTag} ${DockerImageTagLatest}`, { silent: true }).code !== 0) process.exit(1);
  console.log(`${logName}]: building new image, tags=${DockerImageTag}, ${DockerImageTagLatest}`);
  if(s.exec(`docker build --no-cache --tag ${DockerImageTag} -f ${CONSTANTS.DockerFile} ${CONSTANTS.ContextDir}`).code !== 0) process.exit(1);
  if(s.exec(`docker tag ${DockerImageTag} ${DockerImageTagLatest}`).code !== 0) process.exit(1);
  // list them
  console.log(`${logName}: docker images:`)
  if(s.exec(`docker images ${DockerImageName}`).code !== 0) process.exit(1);  
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  prepare();
  copyBuiltArtefactsToWorkingDir();
  setGlobals();
  buildDockerContext();
  removeDockerContainersByImageName();
  buildDockerImage();

  console.log(`${logName}: success.`);
}

main();
