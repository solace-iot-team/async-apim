import s from 'shelljs';
import path from 'path';

const scriptName: string = path.basename(__filename);

// files & dirs
import tsconfig from './tsconfig.json';
const outDir = tsconfig.compilerOptions.outDir;
const apiSpecFile = './server/common/api.yml';

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptName}.${funcName}()`;
  console.log(`${logName}: cleaning ${outDir} ...`);
  if(s.rm('-rf', outDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', outDir).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const compile = () => {
  const funcName = 'compile';
  const logName = `${scriptName}.${funcName}()`;
  console.log(`${logName}: compiling ...`);
  if(s.exec(`npx tsc`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copyAssets = () => {
  const funcName = 'copyAssets';
  const logName = `${scriptName}.${funcName}()`;
  console.log(`${logName}: copying assets ...`);
  // open api spec
  if(s.cp(`${apiSpecFile}`, `${outDir}/common/api.yml`).code !== 0) process.exit(1);
  // public
  if(s.cp('-rf', 'public', `${outDir}/public`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

// const cleanup = () => {
//   const funcName = 'cleanup';
//   const logName = `${scriptName}.${funcName}()`;
//   console.log(`${logName}: removing obsolete files ...`);
//   if(s.rm('-rf', `${outDir}/src`).code !== 0) process.exit(1);
//   console.log(`${logName}: success.`);
// }

const main = () => {
    prepare();
    compile();
    copyAssets();
    // cleanup();
}

main();
