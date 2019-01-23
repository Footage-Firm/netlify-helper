import axios from 'axios';
import * as yargs from 'yargs';

async function getNetlifyDeployId(axiosInstance: any, siteId: string, accessToken: string) {
  let deployObject;
  let currentPage = 1;
  const pageSize = 20;
  let { data } = await axiosInstance.get(
    `/sites/${siteId}/deploys?access_token=${accessToken}&per_page=${pageSize}&page=${currentPage}`,
  );

  // Use a loop + pagination to ensure we always find the most recent production deploy.
  while (data.length) {
    deployObject = data.find((deploy: any) => deploy.context === 'production');
    if (deployObject) {
      break;
    }
    currentPage += 1;
    const response = await axiosInstance.get(
      `/sites/${siteId}/deploys?access_token=${accessToken}&per_page=${pageSize}&page=${currentPage}`,
    );
    ({ data } = response);
  }

  if (!deployObject) {
    throw Error(
      'No Production deployId found. This is weird. Something is wrong.  Sign in to Netlify and check it out.',
    );
  }

  console.info(`Successfully found production deploy with id: ${deployObject.id} on Netlify`);
  return deployObject.id;
}

async function publishDeploy(axiosInstance: any, siteId: string, deployId: string, accessToken: string): Promise<void> {
  console.info(`Now publishing production deploy id: ${deployId}`);
  await axiosInstance.post(`/sites/${siteId}/deploys/${deployId}/restore?access_token=${accessToken}`);
  console.info('Production deploy published');
}

async function lockAutoPublishes(axiosInstance: any, siteId: string, deployId: string, accessToken: string): Promise<void> {
  console.info('Locking Netlify auto publishes');
  await axiosInstance.post(`/deploys/${deployId}/lock?access_token=${accessToken}`);
  console.info('Successfully locked Netlify auto publishes');
}

/**
 * Publishes the most recent deploy for a given site.  This function is meant for sites that intend
 * to keep auto publishes locked.  After publishing the most recent deploy, this function will
 * re-lock all auto publishes.
 * @param {string} accessToken - The access token for a given Netlify user.
 * @param {string} user - The user associated with the given access token.
 * @param {string} siteId - A Netlify site that the given user has access to.
 * @returns {Null}
 */
async function publishMostRecentBuild(accessToken: string, user: string, siteId: string): Promise<void> {
  const axiosInstance = axios.create({
    baseURL: 'https://api.netlify.com/api/v1/',
    headers: { 'User-Agent': `MyApp (${user})` },
  });

  try {
    const deployId = await getNetlifyDeployId(axiosInstance, siteId, accessToken);
    await publishDeploy(axiosInstance, siteId, deployId, accessToken);
    await lockAutoPublishes(axiosInstance, siteId, deployId, accessToken);
  } catch (err) {
    console.error(err);
  }
}

// Command line argument parsing
const argv = yargs
    .usage(
        '$0 [options]',
        'Deploy the most recent publish on Netlify and keep auto publishes locked.',
        /* tslint:disable-next-line:no-shadowed-variable */
        yargs => {
          return yargs
              .option('token', {
                alias: 't',
                describe: 'Access token for Netlify, likely stored in CircleCI env variables',
              })
              .option('user', {
                alias: 'u',
                describe: 'The user associated with the given access token',
              })
              .option('site', {
                alias: 's',
                describe: 'A Netlify site that the given user has access to',
              });
        },
        /* tslint:disable-next-line:no-shadowed-variable */
        (argv: any) => publishMostRecentBuild(argv.t, argv.u, argv.s),
    )
    .version(false)
    .help().argv;
