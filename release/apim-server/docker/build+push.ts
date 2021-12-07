import s from 'shelljs';
import path from 'path';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const GitRoot = `${scriptDir}/../../..`;
const WorkingDir = `${scriptDir}/working_dir`;
const ApimServerDir = `${GitRoot}/apim-server`;
const WorkingApimServerDir = `${WorkingDir}/apim-server`;

const Skipping = '+++ SKIPPING +++';
const DockerContextDir = `${WorkingDir}/docker-context`;
const DockerFile = `${scriptDir}/Dockerfile`;
const DockerHubUser = "solaceiotteam";

let DockerImageName: string;
let DockerImageTag: string;
let DockerImageTagLatest: string;

type TDockerContextAssetsInclude =   {
  sources: string;
  targetDir: string;
  targetFile?: string;
};
type TDockerContextAssetsIncludeList = Array<TDockerContextAssetsInclude>;
const DockerContextAssetsIncludeList: TDockerContextAssetsIncludeList = [
  {
    sources: `${WorkingApimServerDir}/dist`,
    targetDir: `${DockerContextDir}`
  },
  {
    sources: `${WorkingApimServerDir}/node_modules`,
    targetDir: `${DockerContextDir}`
  }
]

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', WorkingDir).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copySourcesToWorkingDir = () => {
  const funcName = 'copySourcesToWorkingDir';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  console.log(`${logName}: copying apim-server sources to working dir ...`);
  if(s.cp('-rf', ApimServerDir, WorkingDir).code !== 0) process.exit(1);
  // remove generated
  if(s.rm('-rf', `${WorkingApimServerDir}/node_modules`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${WorkingApimServerDir}/dist`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${WorkingApimServerDir}/src/*`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${WorkingApimServerDir}/server/@types`).code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const setGlobals = () => {
  const funcName = 'setGlobals';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const apimServerPackageJson = require(`${WorkingApimServerDir}/package.json`);
  const releasePackageJson = require(`${scriptDir}/package.json`);
  
  DockerImageName = releasePackageJson.name;
  DockerImageTag = `${DockerImageName}:${apimServerPackageJson.version}`;
  DockerImageTagLatest = `${DockerImageName}:latest`; 
  // console.log(`${logName}: Globals = ${JSON.stringify(Globals, null, 2)}`);
  console.log(`${logName}: success.`);
}

const checkVersion = () => {
  const funcName = 'checkVersion';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const publishedImageTag = `${DockerHubUser}/${DockerImageTag}`;
  console.log(`${logName}: checking if image already exists: ${publishedImageTag}`);
  const code = s.exec(`docker manifest inspect ${publishedImageTag}`).code;
  if(code===0) {
    console.log(`${logName}: [${Skipping}]: image already exists: ${publishedImageTag}`);
    process.exit(2);
  } else {
    console.log(`${logName}: new image to publish: ${publishedImageTag}`);
  }
  console.log(`${logName}: success.`);
}

const buildApimServer = () => {
  const funcName = 'buildApimServer';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  if(s.cd(`${WorkingApimServerDir}`).code !== 0) process.exit(1);
  if(s.exec('npm install').code !== 0) process.exit(1);

  if(s.exec('npm run dev:build').code !== 0) process.exit(1);

  // build production
  if(s.exec('npm run build').code !== 0) process.exit(1);

  if(s.rm('-rf', `${WorkingApimServerDir}/node_modules`).code !== 0) process.exit(1);
  if(s.exec('export NODE_ENV=production; npm ci --only=production').code !== 0) process.exit(1);
  // if(s.exec('npm prune --production --json').code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const buildDockerContext = () => {
  const funcName = 'buildDockerContext';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  // create dir & ensure it is empty
  if(s.mkdir('-p', DockerContextDir).code !== 0) process.exit(1);
  if(s.rm('-rf', `${DockerContextDir}/`).code !== 0) process.exit(1);

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
    // if(s.exec(`docker build --no-cache --build-arg PLATFORM_API_SERVER_NAME=${dockerImageName} --tag ${dockerImageTag} -f ${dockerFile} ${workingApiImplmentationDir}`).code !== 0) process.exit(1);
  if(s.exec(`docker build --progress=plain --no-cache --tag ${DockerImageTag} -f ${DockerFile} ${DockerContextDir}`).code !== 0) process.exit(1);
  if(s.exec(`docker tag ${DockerImageTag} ${DockerImageTagLatest}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const publishDockerImage = () => {
  const funcName = 'publishDockerImage';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const publishedImageTag = `${DockerHubUser}/${DockerImageTag}`;
  const publishedImageTagLatest = `${DockerHubUser}/${DockerImageTagLatest}`;
  if(s.exec(`docker tag ${DockerImageTag} ${publishedImageTag}`).code !== 0) process.exit(1);
  if(s.exec(`docker tag ${publishedImageTag} ${publishedImageTagLatest}`).code !== 0) process.exit(1);
  if(s.exec(`docker push ${publishedImageTag}`).code !== 0) process.exit(1);
  if(s.exec(`docker push ${publishedImageTagLatest}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  prepare();
  copySourcesToWorkingDir();

  setGlobals();

  checkVersion();
  buildApimServer();

  buildDockerContext();
  removeDockerContainersByImageName();
  buildDockerImage();
  publishDockerImage();

  console.log(`${logName}: success.`);
}

main();
