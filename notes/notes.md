# Sites Referenced

https://medium.com/@bluepnume/javascript-tree-shaking-like-a-pro-7bf96e139eb7

https://github.com/ai/nanoevents

https://deepstream.io/

Setting Up Deepstream on Heroku
: https://github.com/deepstreamIO/ds-demo-heroku

Creating p5 Libraries
: https://github.com/processing/p5.js/blob/master/contributor_docs/creating_libraries.md

Heroku Auto Idle
: https://elements.heroku.com/addons/autoidle

Github: Syncing a Fork
: https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork

Troubleshooting
: https://medium.com/code-oil/burning-questions-with-answers-to-why-webpack-dev-server-live-reload-does-not-work-6d6390277920

# Updating a local clone of a fork with upstream changes

If you haven't add the upstream branch

```
 git remote add upstream https://github.com/jbakse/deepstream_test.git
```

Make sure you are on the local master branch.

```
git fetch upstream
git branch -a
git merge upstream/master
```
