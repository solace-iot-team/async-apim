import s from 'shelljs';
import fs from 'fs';
import yaml from 'js-yaml';
import packageJson from './package.json';
import { HttpClient } from 'openapi-typescript-codegen';
import path from 'path';
// import OpenAPI from 'openapi-typescript-codegen';
const OpenAPI = require('openapi-typescript-codegen');
const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
// files & dirs
const inputApiSpecFile = './server/common/api.yml';
const outputTypesDir = './server/@types';
const outputApiTypesFile = `${outputTypesDir}/api/index.d.ts`;
const outputAboutFile = './public/apim-server-about.json';
const outputOpenApiNodeClientDir = 'src/@solace-iot-team/apim-server-openapi-node';
const outputOpenApiBrowserClientDir = 'src/@solace-iot-team/apim-server-openapi-browser';

type TAbout = {
    name: string,
    description: string,
    repository: {
        type: string,
        url: string,
        revision: {
            sha1: string
        }
    },
    issues_url: string,
    author: string,
    license: string,
    version: {
        'apim-server-openapi': string,
        'apim-server': string
    }
}
const loadYamlFileAsJson = (apiSpecPath: string): any => {
    const b: Buffer = fs.readFileSync(apiSpecPath);
    return yaml.load(b.toString());
}
const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', outputTypesDir).code !== 0) process.exit(1);
  if(s.rm('-rf', outputOpenApiNodeClientDir).code !== 0) process.exit(1);
  if(s.rm('-rf', outputOpenApiBrowserClientDir).code !== 0) process.exit(1);
  if(s.rm('-f', outputAboutFile).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}
const buildAbout = (): TAbout => {
  const funcName = 'buildAbout';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: generating about.json ...`);
  let apiSpec = loadYamlFileAsJson(inputApiSpecFile);
  let sha1 = s.exec('git rev-parse HEAD').stdout.slice(0, -1);
  const about: TAbout = {
      name: packageJson.name,
      description: packageJson.description,
      author: packageJson.author,
      license: packageJson.license,
      version: {
          "apim-server-openapi": apiSpec.info.version,
          "apim-server": packageJson.version
      },
      repository: {
          type: packageJson.repository.type,
          url: packageJson.repository.url,
          revision: {
              sha1: sha1
          }
      },
      issues_url: packageJson.bugs.url
  }
  console.log(`${logName}: about = \n${JSON.stringify(about, null, 2)}`);
  console.log(`${logName}: success.`);
  return about;
}
const generateOpenApiTypes = () => {
  const funcName = 'generateOpenApiTypes';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: generating OpenAPI types for server ...`);
  if(s.exec(`npx dtsgen --out ${outputApiTypesFile} ${inputApiSpecFile}`).code !== 0) process.exit(1);
  console.log(`${logName}: file:${outputApiTypesFile}`);
  console.log(`${logName}: success.`); 
}
const generateOpenApiNodeClient = () => {
  const funcName = 'generateOpenApiNodeClient';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: generating Node OpenAPI Client ...`);

  OpenAPI.generate({
      input: inputApiSpecFile,
      output: outputOpenApiNodeClientDir,
      httpClient: HttpClient.NODE,
      exportSchemas: true,
      // request: './custom/request.ts'      
  })
  .then(() => {
    return;
  })
  .catch((error: any) => {
    console.log(error);
    process.exit(1);
  });
  console.log(`${logName}: dir: ${outputOpenApiNodeClientDir}`);
  console.log(`${logName}: success.`);
}
const generateOpenApiBrowserClient = () => {
  const funcName = 'generateOpenApiBrowserClient';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: generating Browser OpenAPI Client ...`);
  OpenAPI.generate({
      input: inputApiSpecFile,
      output: outputOpenApiBrowserClientDir,
      exportSchemas: true
  })
  .then(() => {
    return;
  })
  .catch((error: any) => {
    console.log(error);
    process.exit(1);
  });
  console.log(`${logName}: dir: ${outputOpenApiBrowserClientDir}`);
  console.log(`${logName}: success.`);
}
const copyAssets = (about: TAbout) => {
  const funcName = 'copyAssets';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  try {
      fs.writeFileSync(outputAboutFile, JSON.stringify(about, null, 2));
  } catch(e) {
      console.log(`error writing about file: ${outputAboutFile}:\n`, JSON.stringify(e, null, 2));
      process.exit(1);
  }
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  prepare();
  const about: TAbout = buildAbout();
  generateOpenApiTypes();
  generateOpenApiNodeClient();
  generateOpenApiBrowserClient();
  copyAssets(about);
  console.log(`${logName}: success.`);
}

main();
