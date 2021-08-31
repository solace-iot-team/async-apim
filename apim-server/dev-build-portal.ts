import s from 'shelljs';
import fs from 'fs';
import path from 'path';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);
// files & dirs
const apimPortalDir = `${scriptDir}/../apim-portal`;
const outputAboutFile = `${apimPortalDir}/public/apim-portal-about.json`;
import packageJson from '../apim-portal/package.json';

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
        'apim-portal': string
    }
}

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-f', outputAboutFile).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const buildAbout = (): TAbout => {
  const funcName = 'buildAbout';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: generating about.json ...`);
  let sha1 = s.exec('git rev-parse HEAD').stdout.slice(0, -1);
  const about: TAbout = {
      name: packageJson.name,
      description: packageJson.description,
      author: packageJson.author,
      license: packageJson.license,
      version: {
          "apim-portal": packageJson.version
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
  copyAssets(about);
  console.log(`${logName}: success.`);
}

main();
