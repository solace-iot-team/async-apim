import s from 'shelljs';
import fs from 'fs';
import path from 'path';
import { TAPPortalAppAbout } from './src/utils/Globals';
import { OpenAPI as ApimConnectorOpenApi } from '@solace-iot-team/apim-connector-openapi-browser';
import { Constants } from './devel/lib/Constants';


const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const CONSTANTS = new Constants(scriptDir);
const createVersion = (version: string): string => {
  if(CONSTANTS.AlphaVersion) return `${version}-${CONSTANTS.AlphaVersion}`;
  return version;
}

// names
const AdminPortalName = 'async-apim-admin-portal';
const AdminPortalDescription = 'Solace Async API Management Admin Portal';
const DeveloperPortalName = 'async-apim-developer-portal';
const DeveloperPortalDescription = 'Solace Async API Management Developer Portal';

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  if(s.rm('-rf', CONSTANTS.OutputGeneratedApimServerOpenApiSrcDir).code !== 0) process.exit(1);
  if(s.rm('-f', CONSTANTS.OutputAdminPortalAboutFile).code !== 0) process.exit(1);
  if(s.rm('-f', CONSTANTS.OutputDeveloperPortalAboutFile).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copyApimServerSourcesToWorkingDir = () => {
  const funcName = 'copyApimServerSourcesToWorkingDir';
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

const copyApimServerAssets = () => {
  const funcName = 'copyApimServerAssets';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const copySrcs = (srcDir: string, outDir: string) => {
    console.log(`${logName}: copy ${srcDir}`);
    if(s.rm('-rf', `${outDir}`).code !== 0) process.exit(1);
    if(s.mkdir('-p', outDir).code !== 0) process.exit(1);
    if(s.cp('-r', `${srcDir}/*`, `${outDir}`).code !== 0) process.exit(1);  
  }

  console.log(`${logName}: starting ...`);

  copySrcs(CONSTANTS.GeneratedApimServerOpenApiSrcDir, CONSTANTS.OutputGeneratedApimServerOpenApiSrcDir);

  console.log(`${logName}: success.`);
}

const getApimServerOpenApiVersion = (): string => {
  const funcName = 'getApimServerOpenApiVersion';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  const x = require(`${CONSTANTS.OutputGeneratedApimServerOpenApiSrcDir}/core/OpenAPI.ts`);
  return x.OpenAPI.VERSION;
  }

const getApimConnectorOpenApiVersion = (): string => {
  const funcName = 'getApimConnectorOpenApiVersion';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  return ApimConnectorOpenApi.VERSION;

  // read from npm package
  // const x = s.exec(`npm list ${ApimConnectorOpenApiBrowserPackageName}`).stdout;
  // const invalidIdx: number = x.search('invalid');
  // if(invalidIdx > -1) throw new Error(`${logName}: invalid version of ${ApimConnectorOpenApiBrowserPackageName} in package.json`);
  // const idx: number = x.lastIndexOf(ApimConnectorOpenApiBrowserPackageName);
  // const y = x.slice(idx).replace(/\s/g, '' );
  // console.log(`${logName}: success.`);
  // return y;
}
const buildAbouts = () => {
  const funcName = 'buildAbouts';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const buildAbout = (name: string, description: string, packageJson: any, sha1: string): TAPPortalAppAbout => {
    const tsDate = new Date();
    const about: TAPPortalAppAbout = {
      name: name,
      description: description,
      author: packageJson.author,
      license: packageJson.license,
      version: createVersion(packageJson.version),
      build_date: tsDate.toUTCString(),
      "apim-connector-openapi-version": getApimConnectorOpenApiVersion(),
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
  const copyAbout = (about: TAPPortalAppAbout, outputFile: string) => {
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
  const packageJsonFile = `${CONSTANTS.ApimPortalDir}/package.json`;
  const packageJson = require(`${packageJsonFile}`);
  const sha1 = s.exec('git rev-parse HEAD').stdout.slice(0, -1);
  const adminPortalAbout: TAPPortalAppAbout = buildAbout(AdminPortalName, AdminPortalDescription, packageJson, sha1);
  console.log(`${logName}: adminPortalAbout = ${JSON.stringify(adminPortalAbout, null, 2)}`);
  copyAbout(adminPortalAbout, CONSTANTS.OutputAdminPortalAboutFile);
  const developerPortalAbout: TAPPortalAppAbout = buildAbout(DeveloperPortalName, DeveloperPortalDescription, packageJson, sha1);
  console.log(`${logName}: developerPortalAbout = ${JSON.stringify(developerPortalAbout, null, 2)}`);
  copyAbout(developerPortalAbout, CONSTANTS.OutputDeveloperPortalAboutFile);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  CONSTANTS.log();

  prepare();
  copyApimServerSourcesToWorkingDir();
  devBuildApimServer();
  copyApimServerAssets();
  buildAbouts();

  console.log(`${logName}: success.`);
}

main();
