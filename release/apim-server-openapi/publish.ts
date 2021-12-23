import s from 'shelljs';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { Constants } from './lib/Constants';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const CONSTANTS = new Constants(scriptDir);

const checkVersions = () => {
  const funcName = 'checkVersions';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const InputApiSpecFile = `${CONSTANTS.WorkingApimServerDir}/server/common/api.yml`;

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
        console.log(`${logName}: [${CONSTANTS.Skipping}]: nothing to do.`);
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
  checkVersion(CONSTANTS.ReleaseDirBrowser);
  checkVersion(CONSTANTS.ReleaseDirNode);
  console.log(`${logName}: success.`);
}

const publishPackages = () => {
  const funcName = 'publishPackages';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const publish = (releaseDir: string) => {
    s.cd(`${releaseDir}`);
    // if(s.exec('npm publish --dry-run').code !== 0) process.exit(1);  
    if(s.exec('npm publish').code !== 0) process.exit(1);
  }

  publish(CONSTANTS.ReleaseDirBrowser);
  publish(CONSTANTS.ReleaseDirNode);

  console.log(`${logName}: success.`);

}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  CONSTANTS.log();

  checkVersions();
  publishPackages()

  console.log(`${logName}: success.`);
}

main();
