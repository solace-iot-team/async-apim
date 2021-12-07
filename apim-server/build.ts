import s from 'shelljs';
import path from 'path';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

// files & dirs
import tsconfig from './tsconfig.json';
const outRoot = `${scriptDir}/dist`;
const outDir = tsconfig.compilerOptions.outDir;
const publicDir = `${outRoot}/public`;
const apiSpecFile = `${scriptDir}/server/common/api.yml`;
// const portalDir = `${scriptDir}/../apim-portal`;
// const portalBuildDir = `${portalDir}/build`;

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: cleaning ${outRoot} ...`);
  if(s.rm('-rf', outRoot).code !== 0) process.exit(1);
  if(s.mkdir('-p', outDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', publicDir).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const compileServer = () => {
  const funcName = 'compileServer';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: compiling ...`);
  if(s.exec(`npx tsc`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copyServerAssets = () => {
  const funcName = 'copyServerAssets';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: copying server assets ...`);
  // open api spec
  if(s.cp(`${apiSpecFile}`, `${outDir}/server/common/api.yml`).code !== 0) process.exit(1);
  // public
  if(s.cp('-rf', 'public', `${outRoot}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  prepare();
  compileServer();
  copyServerAssets();
}

main();
