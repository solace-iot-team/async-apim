import s from 'shelljs';
import path from 'path';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const GitRoot = `${scriptDir}/../../..`;
const WorkingDir = `${scriptDir}/working_dir`;
const ApimPortalDir = `${GitRoot}/apim-portal`;
const ApimServerDir =`${GitRoot}/apim-server`;
const WorkingApimPortalDir = `${WorkingDir}/apim-portal`;

const AssetDir = `${scriptDir}/assets`;

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

  console.log(`${logName}: copying apim-portal sources to working dir ...`);
  if(s.cp('-rf', ApimPortalDir, WorkingDir).code !== 0) process.exit(1);
  if(s.rm('-rf', `${WorkingApimPortalDir}/node_modules`).code !== 0) process.exit(1);
  // remove build
  if(s.rm('-rf', `${WorkingApimPortalDir}/build`).code !== 0) process.exit(1);
  // remove .env . it is compiled into the build
  if(s.rm('-rf', `${WorkingApimPortalDir}/.env`).code !== 0) process.exit(1);
  // replace it with the one working with the quickstart docker compose
  if(s.cp('-rf', `${AssetDir}/.env.apim-portal`, `${WorkingApimPortalDir}/.env`).code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const buildApimAdminPortal = () => {
  const funcName = 'buildApimAdminPortal';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  if(s.cd(`${WorkingApimPortalDir}`).code !== 0) process.exit(1);
  if(s.exec('npm install').code !== 0) process.exit(1);
  if(s.exec('npm run dev:build').code !== 0) process.exit(1);
  if(s.exec('npm run build').code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const postProcessBuild = () => {
  const funcName = 'postProcessBuild';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  if(s.rm('-f', `${WorkingApimPortalDir}/build/manifest.admin-portal.json`).code !== 0) process.exit(1);
  if(s.rm('-f', `${WorkingApimPortalDir}/build/manifest.developer-portal.json`).code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  prepare();
  copySourcesToWorkingDir();
  buildApimAdminPortal();
  postProcessBuild();

  console.log(`${logName}: success.`);
}

main();
