import s from 'shelljs';
import path from 'path';
import { Constants } from './lib/Constants';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const CONSTANTS = new Constants(scriptDir);

const checkImageExistsLocally = () => {
  const funcName = 'checkImageExistsLocally';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  console.log(`${logName}: checking local image exists, tag = ${CONSTANTS.DockerImageTag}`);
  const res = s.exec(`docker images --filter "reference=${CONSTANTS.DockerImageTag}" --format "{{.Repository}}:{{.Tag}}"`);
  if(res.code !== 0) process.exit(1);
  // console.log(`${logName}: res.stdout = ${JSON.stringify(res.stdout, null, 2)}`);
  if(!res.stdout.includes(CONSTANTS.DockerImageTag)) {
    console.log(`${logName}: ERROR: could not find local image ${CONSTANTS.DockerImageTag} - build it first`);
    process.exit(1);
  }
 console.log(`${logName}: success.`);
}

const checkVersion = () => {
  const funcName = 'checkVersion';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const publishedImageTag = `${CONSTANTS.DockerHubUser}/${CONSTANTS.DockerImageTag}`;
  console.log(`${logName}: checking if image already exists: ${publishedImageTag}`);
  const code = s.exec(`docker manifest inspect ${publishedImageTag}`).code;
  if(code===0) {
    console.log(`${logName}: [${CONSTANTS.Skipping}]: image already exists: ${publishedImageTag}`);
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
  const publishedImageTag = `${CONSTANTS.DockerHubUser}/${CONSTANTS.DockerImageTag}`;
  const publishedImageTagLatest = `${CONSTANTS.DockerHubUser}/${CONSTANTS.DockerImageTagLatest}`;
  if(s.exec(`docker tag ${CONSTANTS.DockerImageTag} ${publishedImageTag}`).code !== 0) process.exit(1);
  if(s.exec(`docker tag ${publishedImageTag} ${publishedImageTagLatest}`).code !== 0) process.exit(1);
  if(s.exec(`docker push ${publishedImageTag}`).code !== 0) process.exit(1);
  if(s.exec(`docker push ${publishedImageTagLatest}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}


const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  CONSTANTS.initAfterCopy();
  CONSTANTS.log();
  
  checkImageExistsLocally();
  checkVersion();
  publishDockerImage();

  console.log(`${logName}: success.`);
}

main();
