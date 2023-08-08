const package = 'lerna';
const dependency = 'nx';

(async () => {
  const { execSync } = require('child_process');

  const versions = execSync(`npm view ${package} versions --json`);

  const result = JSON.parse(new String(versions));

  const versionSupport = {};

  for (let i = 0; i < result.length; i++) {
    const v = result[i];
    const s = execSync(
      `npm view ${package}@${v} dependencies.${dependency} --json`
    );
    const str = new String(s);
    versionSupport[v] = str.length > 0 ? str : null;
  }

  console.log(versionSupport);
})();
