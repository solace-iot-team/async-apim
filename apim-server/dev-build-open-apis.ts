import s from 'shelljs';
import path from 'path';
import { HttpClient } from 'openapi-typescript-codegen';
const OpenAPI = require('openapi-typescript-codegen');

// const ENV_VAR_APIM_RELEASE_ALPHA_VERSION = "APIM_RELEASE_ALPHA_VERSION";
// const AlphaVersion: string | undefined = process.env[ENV_VAR_APIM_RELEASE_ALPHA_VERSION];
// const createVersion = (version: string): string => {
//   if(AlphaVersion) return `${version}-${AlphaVersion}`;
//   return version;
// }
const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
// files & dirs
const inputApiSpecFile = './server/common/api.yml';
const outputOpenApiNodeClientDir = 'src/@solace-iot-team/apim-server-openapi-node';
const outputOpenApiBrowserClientDir = 'src/@solace-iot-team/apim-server-openapi-browser';

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', outputOpenApiNodeClientDir).code !== 0) process.exit(1);
  if(s.rm('-rf', outputOpenApiBrowserClientDir).code !== 0) process.exit(1);
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
      useOptions: true
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
      exportSchemas: true,
      useOptions: true
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

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  prepare();
  generateOpenApiNodeClient();
  generateOpenApiBrowserClient();
  console.log(`${logName}: success.`);
}

main();
