import s from 'shelljs';
import path from 'path';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const ReleaseDirBrowser = `${scriptDir}/apim-server-openapi-browser`;
const ReleaseDirNode = `${scriptDir}/apim-server-openapi-node`;

const publishPackages = () => {
  const funcName = 'publishPackages';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const publish = (releaseDir: string) => {
    s.cd(`${releaseDir}`);
    // if(s.exec('npm publish --dry-run').code !== 0) process.exit(1);  
    if(s.exec('npm publish').code !== 0) process.exit(1);
  }

  publish(ReleaseDirBrowser);
  publish(ReleaseDirNode);

  console.log(`${logName}: success.`);

}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  publishPackages()
  console.log(`${logName}: success.`);
}

main();
