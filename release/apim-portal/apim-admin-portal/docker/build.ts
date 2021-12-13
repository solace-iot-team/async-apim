import s from 'shelljs';
import path from 'path';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const WorkingDir = `${scriptDir}/working_dir`;
const ApimAdminPortalBuildArtefactsDir = '../working_dir/apim-portal';
const WorkingApimPortalDir = `${WorkingDir}/apim-portal`;

const DockerContextDir = `${WorkingDir}/docker-context`;
const DockerFile = `${scriptDir}/Dockerfile`;

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
    sources: `${WorkingApimPortalDir}/build/admin-portal/*.json`,
    targetDir: `${DockerContextDir}/admin-portal`
  },
  {
    sources: `${WorkingApimPortalDir}/build/images/*.png`,
    targetDir: `${DockerContextDir}/admin-portal/images`
  },
  {
    sources: `${WorkingApimPortalDir}/build/static`,
    targetDir: `${DockerContextDir}/admin-portal`
  },
  {
    sources: `${WorkingApimPortalDir}/build/*.txt`,
    targetDir: `${DockerContextDir}/admin-portal`
  },
  {
    sources: `${WorkingApimPortalDir}/build/asset-manifest.json`,
    targetDir: `${DockerContextDir}/admin-portal`
  },
  {
    sources: `${WorkingApimPortalDir}/build/index.html`,
    targetDir: `${DockerContextDir}/admin-portal`
  },
  {
    sources: `${WorkingApimPortalDir}/build/manifest.json`,
    targetDir: `${DockerContextDir}/admin-portal`
  }
]

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', WorkingApimPortalDir).code !== 0) process.exit(1);
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

  DockerImageName = releasePackageJson.name;
  DockerImageTag = `${DockerImageName}:${apimPortalPackageJson.version}`;
  DockerImageTagLatest = `${DockerImageName}:latest`;
  // console.log(`${logName}: Globals = ${JSON.stringify(Globals, null, 2)}`);
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
  if(s.exec(`docker build --no-cache --tag ${DockerImageTag} -f ${DockerFile} ${DockerContextDir}`).code !== 0) process.exit(1);
  if(s.exec(`docker tag ${DockerImageTag} ${DockerImageTagLatest}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  prepare();
  copyBuildArtefactsToWorkingDir();
  setGlobals();
  buildDockerContext();
  removeDockerContainersByImageName();
  buildDockerImage();

  console.log(`${logName}: success.`);
}

main();
