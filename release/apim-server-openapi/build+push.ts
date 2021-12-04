import s from 'shelljs';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
const WorkingDir = `${scriptDir}/working_dir`;
const ApimServerDir = `${scriptDir}/../../apim-server`;
const WorkingApimServerDir = `${WorkingDir}/apim-server`;

const ReleaseDirBrowser = `${scriptDir}/apim-server-openapi-browser`;
const ReleaseDirNode = `${scriptDir}/apim-server-openapi-node`;

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

const checkVersions = () => {
  const funcName = 'checkVersions';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const InputApiSpecFile = `${WorkingApimServerDir}/server/common/api.yml`;

  const getNpmLatestVersion = (packageName: string): string => {
    const latestVersion = s.exec(`npm view ${packageName} version`).stdout.slice(0, -1);
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

  const checkVersion = (releaseDir: string) => {
    const funcName = 'checkVersions.checkVersion';
    const logName = `${scriptDir}/${scriptName}.${funcName}()`;
    console.log(`${logName}: starting ...`);
  
    const PackageJsonFile = `${releaseDir}/package.json`;
    const PackageJson = require(`${PackageJsonFile}`);
  
    const npmLatestVersion = getNpmLatestVersion(PackageJson.name);
    const newVersion = getNewVersion();
    console.log(`${PackageJson.name}: npm latest version='${npmLatestVersion}', new version='${newVersion}'`);
    if(newVersion === npmLatestVersion) {
        console.log('nothing to do, exiting.');
        process.exit(2);
    }
    // write new version into package.json
    PackageJson.version = newVersion;
    let newPackageJsonString = JSON.stringify(PackageJson, null, 2);
    s.cp(`${PackageJsonFile}`, `${releaseDir}/.package.json`);
    fs.writeFileSync(PackageJsonFile, newPackageJsonString);  
    console.log(`${logName}: success.`);
  }
  
  // func main
  console.log(`${logName}: starting ...`);
  checkVersion(ReleaseDirBrowser);
  checkVersion(ReleaseDirNode);
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

  const copySrcs = (srcDir: string, outDir: string) => {
    console.log(`${logName}: copy ${srcDir}`);
    if(s.rm('-rf', `${outDir}`).code !== 0) process.exit(1);
    if(s.mkdir('-p', outDir).code !== 0) process.exit(1);
    if(s.cp('-r', `${srcDir}/*`, `${outDir}`).code !== 0) process.exit(1);  
  }

  const SrcDirBrowser: string = `${WorkingApimServerDir}/src/@solace-iot-team/apim-server-openapi-browser`;
  const OutDirBrowser: string = `${ReleaseDirBrowser}/src`;
  const SrcDirNode: string = `${WorkingApimServerDir}/src/@solace-iot-team/apim-server-openapi-node`;
  const OutDirNode: string = `${ReleaseDirNode}/src`;

  console.log(`${logName}: starting ...`);

  copySrcs(SrcDirBrowser, OutDirBrowser);
  copySrcs(SrcDirNode, OutDirNode);

  console.log(`${logName}: success.`);
}

const compileSrcs = () => {
  const funcName = 'compileSrcs';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  s.cd(`${ReleaseDirBrowser}`);
  if(s.rm('-rf', `./dist`).code !== 0) process.exit(1);
  if(s.exec('npx tsc').code !== 0) process.exit(1);

  s.cd(`${ReleaseDirNode}`);
  if(s.rm('-rf', `./dist`).code !== 0) process.exit(1);
  if(s.exec('npm install').code !== 0) process.exit(1);
  if(s.exec('npx tsc').code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const publishPackages = () => {
  const funcName = 'publishPackages';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const publish = (releaseDir: string) => {
    s.cd(`${releaseDir}`);
    if(s.exec('npm publish').code !== 0) process.exit(1);
    // if(s.exec('npm publish --dry-run').code !== 0) process.exit(1);  
  }

  publish(ReleaseDirBrowser);
  publish(ReleaseDirNode);

  console.log(`${logName}: success.`);

}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  prepare();
  copySourcesToWorkingDir();
  checkVersions();
  devBuildApimServer();
  copyAssets();
  compileSrcs();
  publishPackages()
  console.log(`${logName}: success.`);
}

main();
