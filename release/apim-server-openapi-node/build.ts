import s from 'shelljs';
import path from 'path';
import yaml from 'js-yaml';
import fs from 'fs';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
const WorkingDir = `${scriptDir}/working_dir`;
const ApimServerDir = `${scriptDir}/../../apim-server`;
const WorkingApimServerDir = `${WorkingDir}/apim-server`;

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
  if(s.rm('-rf', `${WorkingApimServerDir}/dist`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${WorkingApimServerDir}/node_modules`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${WorkingApimServerDir}/src/*`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${WorkingApimServerDir}/server/@types`).code !== 0) process.exit(1);
  
  console.log(`${logName}: success.`);
}

const checkVersion = () => {
  const funcName = 'checkVersion';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  const PackageJsonFile = './package.json';
  const PackageJson = require(`${PackageJsonFile}`);
  const InputApiSpecFile = `${WorkingApimServerDir}/server/common/api.yml`;

  console.log(`${logName}: starting ...`);

  const getNpmLatestVersion = (): string => {
    let packageName = PackageJson.name;
    let latestVersion = s.exec(`npm view ${packageName} version`).stdout.slice(0, -1);
    return latestVersion;
  }
  const loadYamlFileAsJson = (apiSpecPath: string): any => {
    const b: Buffer = fs.readFileSync(apiSpecPath);
    return yaml.load(b.toString());
}
  const getNewVersion = (): string => {
      let apiSpec = loadYamlFileAsJson(InputApiSpecFile);
      let version = apiSpec.info.version;
      return version;
  }

  const npmVersion = getNpmLatestVersion();
  const newVersion = getNewVersion();
  console.log(`npm version='${npmVersion}', new version='${newVersion}'`);
  if(newVersion === npmVersion) {
      console.log('nothing to do, exiting.');
      process.exit(2);
  }
  // write new version into package.json
  PackageJson.version = newVersion;
  let newPackageJsonString = JSON.stringify(PackageJson, null, 2);
  s.cp(`${PackageJsonFile}`, `.package.json`);
  fs.writeFileSync(PackageJsonFile, newPackageJsonString);

  console.log(`${logName}: success.`);
}

const devBuildApimServer = () => {
  const funcName = 'devBuildApimServer';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  s.cd(`${WorkingApimServerDir}`);
  console.log(`${logName}: directory = ${s.exec(`pwd`)}`);
  if(s.exec('npm install').code !== 0) process.exit(1);
  if(s.exec('npm run dev:build:server').code !== 0) process.exit(1);
  if(s.cd(`${scriptDir}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copyAssets = () => {
  const funcName = 'copyAssets';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const OutDir: string = `${scriptDir}/src`;

  console.log(`${logName}: starting ...`);
  if(s.mkdir('-p', OutDir).code !== 0) process.exit(1);
  if(s.cp('-r', `${WorkingApimServerDir}/src/@solace-iot-team/apim-server-openapi-node/*`, `${OutDir}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  prepare();
  copySourcesToWorkingDir();
  checkVersion();
  devBuildApimServer();
  copyAssets();
  console.log(`${logName}: success.`);
}

main();
