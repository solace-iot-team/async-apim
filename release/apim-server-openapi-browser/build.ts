import s from 'shelljs';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
const outDir: string = `${scriptDir}/src`;

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', outDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', outDir).code !== 0) process.exit(1);
  if(s.rm('-rf', `${scriptDir}/dist`).code !== 0) process.exit(1);

  const apimServerDir = `${scriptDir}/../../apim-server`;
  const lnCode = s.ln('-sf', `${apimServerDir}`, `apim-server`).code;
  if(lnCode !== 0 && lnCode !== 1) process.exit(1);

  console.log(`${logName}: success.`);
}

const callApimServerDevBuild = () => {
  const funcName = 'callApimServerDevBuild';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  s.cd(`${scriptDir}/apim-server`);
  s.exec('npm install');
  s.exec('npm run dev:build');
  s.cd(scriptDir);
  console.log(`${logName}: success.`);
}

const copyAssets = () => {
  const funcName = 'copyAssets';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.cp('-r', `${scriptDir}/apim-server/src/@solace-iot-team/apim-server-openapi-browser/*`, `${outDir}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}


const main = () => {
  prepare();
  callApimServerDevBuild();
  copyAssets();
}

main();
