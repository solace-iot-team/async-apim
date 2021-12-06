import s from 'shelljs';
import path from 'path';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
const workingDir = `${scriptDir}/tmp`;
const workingApimServerDir = `${workingDir}/apim-server`;
const workingApimServerDistDir = `${workingApimServerDir}/dist`;
const workingApimPortalDir = `${workingDir}/apim-portal`;
const apimServerDir = `${scriptDir}/../../../apim-server`;
const apimPortalDir = `${scriptDir}/../../../apim-portal`;

const dockerAssetDir = `${scriptDir}/assets`;
const dockerFile = `${scriptDir}/Dockerfile`;
const dockerContextDir = `${workingDir}/docker-context`;
const dockerContextDistDir = `${dockerContextDir}/dist`;
const dockerHubUser = "solaceiotteam";

let apimPortalPackageJson;
let dockerImageName: string;
let dockerImageTag: string;
let dockerImageTagLatest: string;

const dockerContextAssetsInclude = [
  'start.sh'
]

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', workingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', workingDir).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copySourcesToWorkingDir = () => {
  const funcName = 'copySourcesToWorkingDir';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  console.log(`${logName}: copying apim-server sources to working dir ...`);
  if(s.cp('-rf', apimServerDir, workingDir).code !== 0) process.exit(1);
  if(s.rm('-rf', `${workingApimServerDir}/dist`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${workingApimServerDir}/node_modules`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${workingApimServerDir}/src/*`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${workingApimServerDir}/server/@types`).code !== 0) process.exit(1);
  
  console.log(`${logName}: copying apim-portal sources to working dir ...`);
  if(s.cp('-rf', apimPortalDir, workingDir).code !== 0) process.exit(1);
  if(s.rm('-rf', `${workingApimPortalDir}/node_modules`).code !== 0) process.exit(1);
  // remove .env . it is compiled into the build  
  if(s.rm('-rf', `${workingApimPortalDir}/.env`).code !== 0) process.exit(1);
  // replace it with the one working with the quickstart docker compose
  if(s.cp('-rf', `${dockerAssetDir}/.env.apim-portal`, `${workingApimPortalDir}/.env`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const buildApimServer = () => {
  const funcName = 'buildApimServer';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  s.cd(`${workingApimServerDir}`);
  console.log(`${logName}: directory = ${s.exec(`pwd`)}`);
  if(s.exec('npm install').code !== 0) process.exit(1);
  if(s.exec('npm run build').code !== 0) process.exit(1);
  if(s.exec('npm prune --production --json').code !== 0) process.exit(1);
  if(s.cd(`${scriptDir}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const buildDockerContext = () => {
  const funcName = 'buildDockerContext';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  if(s.mkdir('-p', dockerContextDistDir).code !== 0) process.exit(1);
  if(s.cp('-rf', `${workingApimServerDistDir}`, dockerContextDir).code !== 0) process.exit(1);
  if(s.cp('-rf', `${workingApimServerDir}/node_modules`, dockerContextDir).code !== 0) process.exit(1);

  for(const include of dockerContextAssetsInclude) {
    const includeFile = `${dockerAssetDir}/${include}`;
    console.log(`${logName}: includeFile = ${includeFile}`);
    if(s.cp('-rf', `${includeFile}`, dockerContextDir).code !== 0) process.exit(1);
  }
  console.log(`${logName}: success.`);
}

const setPackageVars = () => {
  const funcName = 'setPackageVars';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  apimPortalPackageJson = require(`${apimPortalDir}/package.json`);
  dockerImageName = apimPortalPackageJson.name;
  dockerImageTag = `${dockerImageName}:${apimPortalPackageJson.version}`;
  dockerImageTagLatest = `${dockerImageName}:latest`;
  console.log(`${logName}: success.`);
}

const checkVersion = () => {
  const funcName = 'checkVersion';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const publishedImageTag = `${dockerHubUser}/${dockerImageTag}`;
  console.log(`${logName}: checking if image already exists: ${publishedImageTag}`);
  const code = s.exec(`docker manifest inspect ${publishedImageTag}`).code;
  if(code===0) {
    console.log(`${logName}: aborting - image already exists: ${publishedImageTag}`);
    process.exit(2);
  } else {
    console.log(`${logName}: new image to publish: ${publishedImageTag}`);
  }
  console.log(`${logName}: success.`);
}

const removeDockerContainersByImageName = () => {
  const funcName = 'removeDockerContainersByImageName';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  console.log(`${logName}: removing any existing containers for image: ${dockerImageName}`);
  const cmd = `docker ps | awk '{split($2,image,":"); print $1, image[1]}' | awk -v image=${dockerImageName} '$2 == image {print $1}'`;
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
  
  console.log(`${logName}: removing any existing images, tags=${dockerImageTag}, ${dockerImageTagLatest}`);
  if(s.exec(`docker rmi -f ${dockerImageTag} ${dockerImageTagLatest}`, { silent: true }).code !== 0) process.exit(1);
  console.log(`${logName}]: building new image, tags=${dockerImageTag}, ${dockerImageTagLatest}`);
    // if(s.exec(`docker build --no-cache --build-arg PLATFORM_API_SERVER_NAME=${dockerImageName} --tag ${dockerImageTag} -f ${dockerFile} ${workingApiImplmentationDir}`).code !== 0) process.exit(1);
  if(s.exec(`docker build --no-cache --tag ${dockerImageTag} -f ${dockerFile} ${dockerContextDir}`).code !== 0) process.exit(1);
  if(s.exec(`docker tag ${dockerImageTag} ${dockerImageTagLatest}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const publishDockerImage = () => {
  const funcName = 'publishDockerImage';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const publishedImageTag = `${dockerHubUser}/${dockerImageTag}`;
  const publishedImageTagLatest = `${dockerHubUser}/${dockerImageTagLatest}`;
  if(s.exec(`docker tag ${dockerImageTag} ${publishedImageTag}`).code !== 0) process.exit(1);
  if(s.exec(`docker tag ${publishedImageTag} ${publishedImageTagLatest}`).code !== 0) process.exit(1);
  if(s.exec(`docker push ${publishedImageTag}`).code !== 0) process.exit(1);
  if(s.exec(`docker push ${publishedImageTagLatest}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  setPackageVars();
  checkVersion();
  prepare();
  copySourcesToWorkingDir();
  buildApimServer();
  buildDockerContext();
  removeDockerContainersByImageName();
  buildDockerImage();
  publishDockerImage();
  console.log(`${logName}: success.`);
}

main();
