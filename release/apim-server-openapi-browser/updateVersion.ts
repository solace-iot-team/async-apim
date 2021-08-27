import s from 'shelljs';
import fs from 'fs';
import yaml from 'js-yaml';
const config = require('./tsconfig.json');

const packageJsonFile = './package.json';
const packageJson = require(`${packageJsonFile}`);
const inputApiSpecFile = `./apim-server/server/common/api.yml`;

// const outputSrcDir = `./src`;

const loadYamlFileAsJson = (apiSpecPath: string): any => {
    const b: Buffer = fs.readFileSync(apiSpecPath);
    return yaml.load(b.toString());
}
const getApiVersion = (): string => {
    let apiSpec = loadYamlFileAsJson(inputApiSpecFile);
    let version = apiSpec.info.version;
    return version;
}
const updateVersion = (newVersion: string) => {
    packageJson.version = newVersion;
    let newPackageJsonString = JSON.stringify(packageJson, null, 2);
    s.cp(`${packageJsonFile}`, `.package.json`);
    fs.writeFileSync(packageJsonFile, newPackageJsonString);
}
const main = () => {
    let apiVersion = getApiVersion();
    console.log(`api version='${apiVersion}'`);
    updateVersion(apiVersion);
}

main();

