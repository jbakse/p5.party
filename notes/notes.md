# Sites Referenced

https://www.gabrielgambetta.com/client-server-game-architecture.html

https://gist.github.com/tracker1/59f2c13044315f88bee9

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

# Invalid State Transition

So, pretty sure this is the issue.

Client A: updates record frequenctly 60hz
Client B: updates same record once (merge conflict detected resolved)
Client B: updates same reocrd twice quickly (merge conflicts are detected and they both try to resolve. First one resolves marks state READY via MERGED, then second one resolves tries to mark READY via MERGED but already ready.

state-machine.js:36 Invalid state transition.
Details: {"transition":"MERGED","state":"READY"}
History:
From - to LOADING_OFFLINE via -
From LOADING_OFFLINE to SUBSCRIBING via 23
From SUBSCRIBING to READY via 4
From READY to MERGING via INVALID_VERSION
From MERGING to READY via MERGED
From READY to MERGING via INVALID_VERSION
From MERGING to READY via MERGED
From READY to MERGING via INVALID_VERSION
From MERGING to READY via MERGED
From READY to MERGING via INVALID_VERSION
From MERGING to READY via MERGED
