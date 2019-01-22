# Netlify Locked Publish

This package uses the Netlify api to publish the most recent deploy on Netlify while keeping auto publishes locked.

## Install

```
$ npm install netlify-locked-publish
```

## Usage

```
$   node ./node_modules/netlify-locked-publish --help
    netlify-locked-publish [options]

    Deploy the most recent publish on Netlify and keep auto publishes locked.

    Options:
        --help       Show help                                               [boolean]
        --token, -t  Access token for Netlify, likely stored in CircleCI env variables
        --user, -u   The user associated with the given access token
        --site, -s   A Netlify site that the given user has access to
```

This script publishes the most recent deploy for a given site.  This function is meant for
sites that intend to keep auto publishes locked.  After publishing the most recent
deploy, this function will re-lock all auto publishes.
