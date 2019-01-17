# Netlify Helper

This package uses the Netlify api to manage/edit sites hosted by Netlify.

## Public Functions

```
async function publishBuildMostRecentBuild(accessToken, user, site)
```

This function publishes the most recent deploy for a given site.  This function is meant for
sites that intend to keep auto publishes locked.  After publishing the most recent
deploy, this function will re-lock all auto publishes.

@param {string} accessToken - The access token for a given Netlify user.  
@param {string} user - The user associated with the given access token.  
@param {string} site - A Netlify site that the given user has access to.  
