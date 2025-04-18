# How to work on site + examples

Use VS Code + the Live Server extension. Live Server is configured to use `public/` as the root in `.vscode/settings.json`.

1. Install the Live Server extension
1. Open the project in VS Code
1. Click "Go Live" in the status bar.
1. Navigate to `http://127.0.0.1:5500/` in your browser.

# How to build the library

- `npm run start` to build+watch+rebuild
- `npm run build` to build once

# How to run tests on CLI

1. `npm run serve` to start local version of the backend server
1. leave server running
1. open another terminal window
1. `npm run test` to run the test suite

# How to run tests in VS Code

1. `npm run serve` to start local version of the backend server
1. leave server running
1. run tests from VS Code interface with `Jest` extension

# How To Release a new Version of p5.Party

Releases are semi-automated using `np`.

1. Make sure the code is working.
1. Make sure local ds server is running so tests can run.
1. Make sure your working directory is clean.
1. Make sure your commits are pushed.
1. Make sure you are up to date with origin.
1. Make sure you have your phone, for the one-time-password.
1. `npm run release` to start release
1. Enter one-time password from Duo Mobile
1. Browser should open github release page
1. Enter name for release (or leave blank to use release number)
1. ~~Attach p5.party.zip (generated by build in your working directory)~~
1. attach dist/\* to release
1. Check pre-release checkbox
1. Click "publish"

# How to use a feature branch

Create Feature Branch

```bash
git branch feature-branch # create a new feature branch
git checkout feature-branch # switch to the feature branch
# ... commit changes ...
```

Merge with squash

```bash
git checkout feature-branch # switch to the feature branch, if needed
git rebase master # rebase your changes on top of master
git checkout master # switch back to master


git merge --squash feature-branch # merge your changes into master via a squash
                                  # commit ALL the changes as one commit.

# git won't know your branch has been merged, so...
git branch -d feature-branch
# ...will warn you and tell you you need to ...
git branch -D feature-branch
# and remove from origin (e.g. github)
git push origin :feature-branch
```

Merge without squash

```bash
git checkout feature-branch
git rebase master
git checkout master
git merge feature-branch
git branch --merged # show the branches that you've merged
git branch -d feature-branch
git push origin :feature-branch
```

# How to update dependencies

```bash
# check to see whats out of date
npm outdated

# update all the things (just minor and patch versions)
npm update

# update a specific package to latest major version
npm install xxx@latest

```

# How to update your local fork with upstream changes

You have forked p5.party and cloned it to your own machine.

You made a change (a bug fix or new feature).

You want to update your fork (both the local clone and on github) with the latest changes from the main p5.party repo.

[Github Docs — Collaborating with Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
[Github Docs — Syncing a Fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork)

To prepare, if you haven't added the upstream branch:

```
 git remote add upstream https://github.com/jbakse/p5.party.git
```

Make sure you are on the local master branch.

```
git checkout main
```

Fetch the commits from your "upstream" remote that points to p5.party

```
git fetch upstream
```

Merge them in

```
git merge upstream/master
```

# Expose the local server to the internet

npx localtunnel --port 8000
curl https://loca.lt/mytunnelpassword
