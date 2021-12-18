import s from 'shelljs';
import fs from 'fs';
import path from 'path';
import { TAPPortalAbout } from './src/utils/Globals';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
// files & dirs
const apimPortalDir = `${scriptDir}`;
const outputAdminPortalAboutFile = `${apimPortalDir}/public/admin-portal/about.json`;
const outputDeveloperPortalAboutFile = `${apimPortalDir}/public/developer-portal/about.json`;

// names
const AdminPortalName = 'async-apim-admin-portal';
const AdminPortalDescription = 'Solace Async API Management Admin Portal';
const DeveloperPortalName = 'async-apim-developer-portal';
const DeveloperPortalDescription = 'Solace Async API Management Developer Portal';
const ApimServerOpenApiBrowserPackageName = '@solace-iot-team/apim-server-openapi-browser';
const ApimConnectorOpenApiBrowserPackageName = '@solace-iot-team/apim-connector-openapi-browser';

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-f', outputAdminPortalAboutFile).code !== 0) process.exit(1);
  if(s.rm('-f', outputDeveloperPortalAboutFile).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const getApimServerOpenApiVersion = (): string => {
  const funcName = 'getApimServerOpenApiVersion';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const x = s.exec(`npm list ${ApimServerOpenApiBrowserPackageName}`).stdout;
  const invalidIdx: number = x.search('invalid');
  if(invalidIdx > -1) throw new Error(`${logName}: invalid version of ${ApimServerOpenApiBrowserPackageName} in package.json`);
  const idx: number = x.lastIndexOf(ApimServerOpenApiBrowserPackageName);
  const y = x.slice(idx).replace(/\s/g, '' );
  console.log(`${logName}: success.`);
  return y;
}

const getApimConnectorOpenApiVersion = (): string => {
  const funcName = 'getApimConnectorOpenApiVersion';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const x = s.exec(`npm list ${ApimConnectorOpenApiBrowserPackageName}`).stdout;
  const invalidIdx: number = x.search('invalid');
  if(invalidIdx > -1) throw new Error(`${logName}: invalid version of ${ApimConnectorOpenApiBrowserPackageName} in package.json`);
  const idx: number = x.lastIndexOf(ApimConnectorOpenApiBrowserPackageName);
  const y = x.slice(idx).replace(/\s/g, '' );
  console.log(`${logName}: success.`);
  return y;
}
const buildAbouts = () => {
  const funcName = 'buildAbouts';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const buildAbout = (name: string, description: string, packageJson: any, sha1: string): TAPPortalAbout => {
    const tsDate = new Date();
    const about: TAPPortalAbout = {
      name: name,
      description: description,
      author: packageJson.author,
      license: packageJson.license,
      version: packageJson.version,
      build_date: tsDate.toUTCString(),
      "apim-connector-open-api-version": getApimConnectorOpenApiVersion(),
      "apim-server-openapi-version": getApimServerOpenApiVersion(),
      repository: {
          type: packageJson.repository.type,
          url: packageJson.repository.url,
          revision: {
              sha1: sha1
          }
      },
      issues_url: packageJson.bugs.url
    }
    return  about;
  }
  const copyAbout = (about: TAPPortalAbout, outputFile: string) => {
    const funcName = 'copyAbout';
    const logName = `${scriptDir}/${scriptName}.${funcName}()`;
    console.log(`${logName}: starting ...`);
    try {
        fs.writeFileSync(outputFile, JSON.stringify(about, null, 2));
    } catch(e) {
        console.log(`error writing about file: ${outputFile}:\n`, JSON.stringify(e, null, 2));
        process.exit(1);
    }
    console.log(`${logName}: success.`);
  }
  
  // func main
  console.log(`${logName}: starting ...`);
  const packageJsonFile = `${apimPortalDir}/package.json`;
  const packageJson = require(`${packageJsonFile}`);
  const sha1 = s.exec('git rev-parse HEAD').stdout.slice(0, -1);
  const adminPortalAbout: TAPPortalAbout = buildAbout(AdminPortalName, AdminPortalDescription, packageJson, sha1);
  console.log(`${logName}: adminPortalAbout = ${JSON.stringify(adminPortalAbout, null, 2)}`);
  copyAbout(adminPortalAbout, outputAdminPortalAboutFile);
  const developerPortalAbout: TAPPortalAbout = buildAbout(DeveloperPortalName, DeveloperPortalDescription, packageJson, sha1);
  console.log(`${logName}: developerPortalAbout = ${JSON.stringify(developerPortalAbout, null, 2)}`);
  copyAbout(developerPortalAbout, outputDeveloperPortalAboutFile);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  prepare();
  buildAbouts();
  console.log(`${logName}: success.`);
}

main();
