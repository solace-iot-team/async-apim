import s from 'shelljs';
import path from 'path';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const Skipping = '+++ SKIPPING +++';

const ApimAdminPortalBuildArtefactsDir = '../working_dir/apim-portal';

type TDockerGlobals = {
  dockerHubUser: string;
  dockerImageName: string;
  dockerImageTag: string;
  dockerImageTagLatest: string;
  
};
var DockerGlobals: TDockerGlobals = {
  dockerHubUser: "solaceiotteam",
  dockerImageName: '',
  dockerImageTag: '',
  dockerImageTagLatest: ''
}

const setGlobals = () => {
  const funcName = 'setGlobals';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const apimPortalPackageJson = require(`${ApimAdminPortalBuildArtefactsDir}/package.json`);
  const releasePackageJson = require(`${scriptDir}/package.json`);

  DockerGlobals.dockerImageName = releasePackageJson.name;
  DockerGlobals.dockerImageTag = `${DockerGlobals.dockerImageName}:${apimPortalPackageJson.version}`;
  DockerGlobals.dockerImageTagLatest = `${DockerGlobals.dockerImageName}:latest`;
  console.log(`${logName}: DockerGlobals = ${JSON.stringify(DockerGlobals, null, 2)}`);
  console.log(`${logName}: success.`);
}

const checkImageExistsLocally = () => {
  const funcName = 'checkImageExistsLocally';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  console.log(`${logName}: checking local image exists, tag = ${DockerGlobals.dockerImageTag}`);
  const res = s.exec(`docker images --filter "reference=${DockerGlobals.dockerImageTag}" --format "{{.Repository}}:{{.Tag}}"`);
  if(res.code !== 0) process.exit(1);
  // console.log(`${logName}: res.stdout = ${JSON.stringify(res.stdout, null, 2)}`);
  if(!res.stdout.includes(DockerGlobals.dockerImageTag)) {
    console.log(`${logName}: ERROR: could not find local image ${DockerGlobals.dockerImageTag} - build it first`);
    process.exit(1);
  }
 console.log(`${logName}: success.`);
}

const checkVersion = () => {
  const funcName = 'checkVersion';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const publishedImageTag = `${DockerGlobals.dockerHubUser}/${DockerGlobals.dockerImageTag}`;
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

const publishDockerImage = () => {
  const funcName = 'publishDockerImage';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const publishedImageTag = `${DockerGlobals.dockerHubUser}/${DockerGlobals.dockerImageTag}`;
  const publishedImageTagLatest = `${DockerGlobals.dockerHubUser}/${DockerGlobals.dockerImageTagLatest}`;
  if(s.exec(`docker tag ${DockerGlobals.dockerImageTag} ${publishedImageTag}`).code !== 0) process.exit(1);
  if(s.exec(`docker tag ${publishedImageTag} ${publishedImageTagLatest}`).code !== 0) process.exit(1);
  if(s.exec(`docker push ${publishedImageTag}`).code !== 0) process.exit(1);
  if(s.exec(`docker push ${publishedImageTagLatest}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  setGlobals();
  checkImageExistsLocally();
  checkVersion();
  publishDockerImage();

  console.log(`${logName}: success.`);
}

main();
