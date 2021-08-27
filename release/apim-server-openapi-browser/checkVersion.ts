import s from 'shelljs';
import fs from 'fs';
import yaml from 'js-yaml';
const config = require('./tsconfig.json');

const packageJsonFile = './package.json';
const packageJson = require(`${packageJsonFile}`);
const inputApiSpecFile = `./apim-server/server/common/api.yml`;

const loadYamlFileAsJson = (apiSpecPath: string): any => {
    const b: Buffer = fs.readFileSync(apiSpecPath);
    return yaml.load(b.toString());
}

const getNpmLatestVersion = (): string => {
    let packageName = packageJson.name;
    let latestVersion = s.exec(`npm view ${packageName} version`).stdout.slice(0, -1);
    return latestVersion;
}
const getNewVersion = (): string => {
    let apiSpec = loadYamlFileAsJson(inputApiSpecFile);
    let version = apiSpec.info.version;
    return version;
}

const main = () => {
    const npmVersion = getNpmLatestVersion();
    const newVersion = getNewVersion();
    console.log(`npm version='${npmVersion}', new version='${newVersion}'`);
    if(newVersion === npmVersion) {
        console.log('nothing to do, exiting.');
        process.exit(2);
    }
}

main();

