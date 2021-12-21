import s from 'shelljs';
import path from 'path';
import { Constants } from './lib/Constants';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const CONSTANTS = new Constants(scriptDir);

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
  if(s.rm('-rf', `${CONSTANTS.WorkingApimServerDir}/dist`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${CONSTANTS.WorkingApimServerDir}/node_modules`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${CONSTANTS.WorkingApimServerDir}/src/*`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${CONSTANTS.WorkingApimServerDir}/server/@types`).code !== 0) process.exit(1);
  
  console.log(`${logName}: success.`);
}


const devBuildApimServer = () => {
  const funcName = 'devBuildApimServer';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  s.cd(`${CONSTANTS.WorkingApimServerDir}`);
  console.log(`${logName}: directory = ${s.exec(`pwd`)}`);
  if(s.exec('npm install').code !== 0) process.exit(1);
  if(s.exec('npm run dev:build').code !== 0) process.exit(1);
  if(s.cd(`${scriptDir}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copyAssets = () => {
  const funcName = 'copyAssets';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const copySrcs = (srcDir: string, outDir: string) => {
    console.log(`${logName}: copy ${srcDir}`);
    if(s.rm('-rf', `${outDir}`).code !== 0) process.exit(1);
    if(s.mkdir('-p', outDir).code !== 0) process.exit(1);
    if(s.cp('-r', `${srcDir}/*`, `${outDir}`).code !== 0) process.exit(1);  
  }

  const SrcDirBrowser: string = `${CONSTANTS.WorkingApimServerDir}/src/@solace-iot-team/apim-server-openapi-browser`;
  const OutDirBrowser: string = `${CONSTANTS.ReleaseDirBrowser}/src`;
  const SrcDirNode: string = `${CONSTANTS.WorkingApimServerDir}/src/@solace-iot-team/apim-server-openapi-node`;
  const OutDirNode: string = `${CONSTANTS.ReleaseDirNode}/src`;

  console.log(`${logName}: starting ...`);

  copySrcs(SrcDirBrowser, OutDirBrowser);
  copySrcs(SrcDirNode, OutDirNode);

  console.log(`${logName}: success.`);
}

const compileSrcs = () => {
  const funcName = 'compileSrcs';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  s.cd(`${CONSTANTS.ReleaseDirBrowser}`);
  if(s.rm('-rf', `./dist`).code !== 0) process.exit(1);
  if(s.exec('npx tsc').code !== 0) process.exit(1);

  s.cd(`${CONSTANTS.ReleaseDirNode}`);
  if(s.rm('-rf', `./dist`).code !== 0) process.exit(1);
  if(s.exec('npm install').code !== 0) process.exit(1);
  if(s.exec('npx tsc').code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  CONSTANTS.log();
  
  prepare();
  copySourcesToWorkingDir();
  devBuildApimServer();
  copyAssets();
  compileSrcs();

  console.log(`${logName}: success.`);
}

main();
