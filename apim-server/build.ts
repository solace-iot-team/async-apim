// import s from 'shelljs';
// import config from './tsconfig.json';
// const outDir = config.compilerOptions.outDir;

// s.rm('-rf', outDir);
// s.mkdir(outDir);
// s.cp('.env', `${outDir}/.env`);
// s.mkdir('-p', `${outDir}/common/swagger`);
// s.cp('server/common/api.yml', `${outDir}/common/api.yml`);


import s from 'shelljs';
import fs from 'fs';
import yaml from 'js-yaml';
import tsconfig from './tsconfig.json';
import packageJson from './package.json';
const outDir = tsconfig.compilerOptions.outDir;
const inputApiSpecFile = './server/common/api.yml';

type TAbout = {
    name: string,
    description: string,
    homepage: string,
    repository: {
        type: string,
        url: string,
        revision: {
            sha1: string
        }
    },
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
    if(s.rm('-rf', outDir).code !== 0) process.exit(1);
    if(s.mkdir('-p', outDir).code !== 0) process.exit(1);
}
const buildAbout = (): TAbout => {
    let apiSpec = loadYamlFileAsJson(inputApiSpecFile);
    let sha1 = s.exec('git rev-parse HEAD').stdout.slice(0, -1);
    const about: TAbout = {
        name: packageJson.name,
        description: packageJson.description,
        homepage: packageJson.homepage,
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
        }
    }
    console.log(`about = \n${JSON.stringify(about, null, 2)}`);
    return about;
}
const copyAssets = (about: TAbout) => {
    if(s.mkdir('-p', `${outDir}/server/common`).code !== 0) process.exit(1);
    // open api spec
    if(s.cp(`${inputApiSpecFile}`, `${outDir}/server/common/api.yml`).code !== 0) process.exit(1);
    // public
    if(s.cp('-rf', 'public', `${outDir}/public`).code !== 0) process.exit(1);
    // not required, url already in the swagger ui
    // if(s.cp(`${inputApiSpecFile}`, `${outDir}/public`).code !== 0) process.exit(1);
    try {
        fs.writeFileSync(`${outDir}/public/about.json`, JSON.stringify(about, null, 2));
    } catch(e) {
        console.log('error writing about file: ', JSON.stringify(e, null, 2));
        process.exit(1);
    }
}
const main = () => {
    prepare();
    const about: TAbout = buildAbout();
    copyAssets(about);
}

main();
