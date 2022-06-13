import s from 'shelljs';
import path from 'path';
import { Constants } from './lib/Constants';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const CONSTANTS = new Constants(scriptDir);

type TDockerContextAssetsInclude =   {
  sources: string;
  targetDir: string;
  targetFile?: string;
};
type TDockerContextAssetsIncludeList = Array<TDockerContextAssetsInclude>;
const DockerContextAssetsIncludeList: TDockerContextAssetsIncludeList = [
  {
    sources: `${CONSTANTS.WorkingApimServerDir}/dist`,
    targetDir: `${CONSTANTS.DockerContextDir}`
  },
  {
    sources: `${CONSTANTS.WorkingApimServerDir}/node_modules`,
    targetDir: `${CONSTANTS.DockerContextDir}`
  }
]

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copySourcesToWorkingDir = () => {
  const funcName = 'copySourcesToWorkingDir';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  console.log(`${logName}: copying apim-server sources to working dir ...`);
  if(s.cp('-rf', CONSTANTS.ApimServerDir, CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  // remove generated
  if(s.rm('-rf', `${CONSTANTS.WorkingApimServerDir}/node_modules`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${CONSTANTS.WorkingApimServerDir}/dist`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${CONSTANTS.WorkingApimServerDir}/src/*`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${CONSTANTS.WorkingApimServerDir}/server/@types`).code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const buildApimServer = () => {
  const funcName = 'buildApimServer';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  if(s.cd(`${CONSTANTS.WorkingApimServerDir}`).code !== 0) process.exit(1);
  if(s.exec('npm install').code !== 0) process.exit(1);
  if(s.exec('npm list').code !== 0) process.exit(1);

  if(s.exec('npm run dev:build').code !== 0) process.exit(1);

  // build production
  if(s.exec('npm run build').code !== 0) process.exit(1);

  if(s.rm('-rf', `${CONSTANTS.WorkingApimServerDir}/node_modules`).code !== 0) process.exit(1);
  if(s.exec('export NODE_ENV=production; npm ci --only=production').code !== 0) process.exit(1);
  // if(s.exec('npm prune --production --json').code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const buildDockerContext = () => {
  const funcName = 'buildDockerContext';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  // create dir & ensure it is empty
  if(s.mkdir('-p', CONSTANTS.DockerContextDir).code !== 0) process.exit(1);
  if(s.rm('-rf', `${CONSTANTS.DockerContextDir}/`).code !== 0) process.exit(1);

  // copy files & dirs
  for (const include of DockerContextAssetsIncludeList) {
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

const removeLocalDockerArtefacts = () => {
  const funcName = 'removeLocalDockerArtefacts';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  console.log(`${logName}: removing any existing containers for image: ${CONSTANTS.DockerImageName}`);
  const cmd = `docker ps | awk '{split($2,image,":"); print $1, image[1]}' | awk -v image=${CONSTANTS.DockerImageName} '$2 == image {print $1}'`;
  const {stdout, stderr, code } = s.exec(cmd, { silent: false });
  if(code !== 0) process.exit(1);
  const containerIds: string[] = stdout.split("\n");
  for(const containerId of containerIds) {
    if(containerId.length > 0) {
      console.log(`${logName}: removing containerId = '${containerId}'`);
      if(s.exec(`docker rm -f ${containerId}`, { silent: false }).code !== 0) process.exit(1);
    }
  }
  console.log(`${logName}: removing any existing images, tags=${CONSTANTS.DockerImageTag}, ${CONSTANTS.DockerImageTagLatest}`);
  s.exec(`docker rmi -f ${CONSTANTS.DockerImageTag} ${CONSTANTS.DockerImageTagLatest}`, { silent: true });
  // if(s.exec(`docker rmi -f ${CONSTANTS.DockerImageTag} ${CONSTANTS.DockerImageTagLatest}`, { silent: true }).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const buildDockerImage = () => {
  const funcName = 'buildDockerImage';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  console.log(`${logName}]: building new image, tags=${CONSTANTS.DockerImageTag}, ${CONSTANTS.DockerImageTagLatest}`);
  if(s.exec(`docker build --progress=plain --no-cache --tag ${CONSTANTS.DockerImageTag} -f ${CONSTANTS.DockerFile} ${CONSTANTS.DockerContextDir}`).code !== 0) process.exit(1);
  if(s.exec(`docker tag ${CONSTANTS.DockerImageTag} ${CONSTANTS.DockerImageTagLatest}`).code !== 0) process.exit(1);
  // list them
  console.log(`${logName}: docker images:`)
  if(s.exec(`docker images ${CONSTANTS.DockerImageName}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  prepare();
  copySourcesToWorkingDir();
  CONSTANTS.initAfterCopy();
  CONSTANTS.log();
  buildApimServer();
  buildDockerContext();
  removeLocalDockerArtefacts();
  buildDockerImage();

  console.log(`${logName}: success.`);
}

main();
