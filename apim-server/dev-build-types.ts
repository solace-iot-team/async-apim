import s from 'shelljs';
import path, { dirname } from 'path';
import { default as dtsgenerator, parseSchema } from 'dtsgenerator';
import fs from 'fs';
import yaml from 'js-yaml';

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
  // if(s.mkdir('-p', outputTypesDir).code !==0) process.exit(1);
  console.log(`${logName}: success.`);
}

const loadYamlFileAsJson = (apiSpecPath: string): any => {
  const b: Buffer = fs.readFileSync(apiSpecPath);
  return yaml.load(b.toString());
}

const generateOpenApiTypes = async () => {
  const funcName = 'generateOpenApiTypes';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: generating OpenAPI types for server ...`);

  const apiSpecJSON = loadYamlFileAsJson(inputApiSpecFile);

  const result = await dtsgenerator({
    contents: [parseSchema(apiSpecJSON)],
    config: {
      // input: {
      //   files: [inputApiSpecFile],
      //   stdin: false,
      //   urls: []
      // },
      outputFile: outputApiTypesFile
    }
  });
  // seems to be a bug, doesn't write to outputFile, write here instead
  fs.mkdirSync(dirname(outputApiTypesFile), { recursive: true });
  fs.writeFileSync(outputApiTypesFile, result, {encoding: 'utf-8'});
  // if(s.exec(`npx dtsgen --out ${outputApiTypesFile} ${inputApiSpecFile}`).code !== 0) process.exit(1);
  console.log(`${logName}: file:${outputApiTypesFile}`);
  console.log(`${logName}: success.`); 
}

const main = async () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  prepare();
  await generateOpenApiTypes();
  console.log(`${logName}: success.`);
}

main();
