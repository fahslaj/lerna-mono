import { exec } from 'child_process';
import yargs from 'yargs';

interface VersionMatrixArgs {
  pkg: string;
  dep: string;
}

void yargs
  .command<VersionMatrixArgs>(
    'print <pkg> <dep>',
    'print a version matrix for the given package and dependency',
    (yargs) =>
      yargs
        .positional('pkg', {
          type: 'string',
          description: 'the package name',
        })
        .positional('dep', {
          type: 'string',
          description: 'the dependency name',
        }),
    async (argv) => {
      const versions = await execa(`npm view ${argv.pkg} versions --json`);
      const versionsResult = JSON.parse(
        new String(versions).toString()
      ) as string[];

      const versionSupport: Record<string, string> = {};
      let i = versionsResult.length;
      console.log(`Checking ${i} versions...`);

      const promises = versionsResult.map((v) =>
        execa(`npm view ${argv.pkg}@${v} dependencies.${argv.dep} --json`).then(
          (s) => {
            const str = new String(s)
              .toString()
              .split('\n')[0]
              .replace(/"/g, '');
            console.log(`Checking ${--i} versions...`);
            versionSupport[v] = str.length > 0 ? str : '<none>';
          }
        )
      );

      await Promise.all(promises);

      const output: Record<string, string> = versionsResult.reduce((acc, v) => {
        acc[v] = versionSupport[v];
        return acc;
      }, {} as Record<string, string>);

      console.log(output);
    }
  )
  .help()
  .parse();

function execa(command: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}
