import s from 'shelljs';
import path from 'path';
const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
// files & dirs
const inputApiSpecFile = './server/common/api.yml';
const outputTypesDir = './server/@types';
const outputApiTypesFile = `${outputTypesDir}/api/index.d.ts`;

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', outputTypesDir).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const generateOpenApiTypes = () => {
  const funcName = 'generateOpenApiTypes';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: generating OpenAPI types for server ...`);
  if(s.exec(`npx dtsgen --out ${outputApiTypesFile} ${inputApiSpecFile}`).code !== 0) process.exit(1);
  console.log(`${logName}: file:${outputApiTypesFile}`);
  console.log(`${logName}: success.`); 
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  prepare();
  generateOpenApiTypes();
  console.log(`${logName}: success.`);
}

main();
