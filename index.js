const axios = require('axios');

let siteId;
let axiosInstance;

async function getNetlifyDeployId(accessToken) {
  let deployObject;
  let currentPage = 1;
  const pageSize = 20;
  let { data } = await axiosInstance.get(`/sites/${siteId}/deploys?access_token=${accessToken}&per_page=${pageSize}&page=${currentPage}`);

  // Use a loop + pagination to ensure we always find the most recent production deploy.
  while (data.length) {
    deployObject = data.find(deploy => deploy.context === 'production');
    if (deployObject) {
      break;
    }
    currentPage += 1;
    const response = await axiosInstance.get(`/sites/${siteId}/deploys?access_token=${accessToken}&per_page=${pageSize}&page=${currentPage}`);
    ({ data } = response);
  }

  if (!deployObject) {
    throw Error('No Production deployId found. This is weird. Something is wrong.  Sign in to Netlify and check it out.');
  }

  console.info(`Successfully found production deploy with id: ${deployObject.id} on Netlify`);
  return deployObject.id;
}

async function publishDeploy(deployId, accessToken) {
  console.info(`Now publishing production deploy id: ${deployId}`);
  await axiosInstance.post(`/sites/${siteId}/deploys/${deployId}/restore?access_token=${accessToken}`);
  console.info('Production deploy published');
}

async function lockAutoPublishes(deployId, accessToken) {
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
 * @param {string} site - A Netlify site that the given user has access to.
 * @returns {Null}
 */
async function publishBuildMostRecentBuild(accessToken, user, site) {
  axiosInstance = axios.create({
    baseURL: 'https://api.netlify.com/api/v1/',
    headers: { 'User-Agent': `MyApp (${user})` },
  });
  siteId = site;

  try {
    const deployId = await getNetlifyDeployId(accessToken);
    await publishDeploy(deployId, accessToken);
    await lockAutoPublishes(deployId, accessToken);
  } catch (err) {
    console.error(err);
  }
}

exports.publishBuildMostRecentBuild = publishBuildMostRecentBuild;
