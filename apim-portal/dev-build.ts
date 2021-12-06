import s from 'shelljs';
import fs from 'fs';
import path from 'path';

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

type TAbout = {
  name: string;
  description: string;
  repository: {
      type: string;
      url: string;
      revision: {
          sha1: string
      }
  },
  issues_url: string;
  author: string;
  license: string;
  version: string;
  'apim-server-openapi-version': string;
}

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-f', outputAdminPortalAboutFile).code !== 0) process.exit(1);
  if(s.rm('-f', outputDeveloperPortalAboutFile).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const getApimServerOpenApiVersion = (): string => {
  const x = s.exec(`npm list ${ApimServerOpenApiBrowserPackageName}`).stdout;
  const idx: number = x.lastIndexOf(ApimServerOpenApiBrowserPackageName);
  const y = x.slice(idx).replace(/\s/g, '' );
  return y;
}

const buildAbouts = () => {
  const funcName = 'buildAbouts';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const buildAbout = (name: string, description: string, packageJson: any, sha1: string): TAbout => {
    const about: TAbout = {
      name: name,
      description: description,
      author: packageJson.author,
      license: packageJson.license,
      version: packageJson.version,
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
  const copyAbout = (about: TAbout, outputFile: string) => {
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
  const adminPortalAbout: TAbout = buildAbout(AdminPortalName, AdminPortalDescription, packageJson, sha1);
  console.log(`${logName}: adminPortalAbout = ${JSON.stringify(adminPortalAbout, null, 2)}`);
  copyAbout(adminPortalAbout, outputAdminPortalAboutFile);
  const developerPortalAbout: TAbout = buildAbout(DeveloperPortalName, DeveloperPortalDescription, packageJson, sha1);
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
