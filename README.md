# Netlify Helper

This package uses the Netlify api to manage/edit sites hosted by Netlify.

## Public Functions

This function publishes the most recent deploy for a given site.  This function is meant for
sites that intend to keep auto publishes locked.  After publishing the most recent
deploy, this function will re-lock all auto publishes.
