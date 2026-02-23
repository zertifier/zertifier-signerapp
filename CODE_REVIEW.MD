# How to:
1) Find the comments in the pull request DIFF:
   * Any doubts can be discussed in the pull request comment section

2) Pull the CODE_REVIEW branch:
   * New commits to this branch will automatically be added to pull request

3) Consider necessary changes:
    - remove comment if no changes needed
    - change the code

4) After looking through all the code review comments either:
   - Merge pull request
   - Merge with squashing (collapse all commits to 1)
   - Deny pull request


# random bullshit:
1) package.json:
  - script get:proxy to automatically build proxies BEFORE angular build
  - karma is for tests - remove
  - Jasmin is for tests - remove
  - ^20.3 versioning can introduce bugs, a lot of devs remove this symbol to
have always exact version - 20.3
  - prettier usually in the separate file, duno what's better to do with it

2) angular.json:
  - new version using zoneless rendering - [docs](https://angular.dev/guide/zoneless)
  - "JSON standard does not allow trailing comma" errors

3) .idea was pushed to the repo bad badly configured, intellij was lost and was not able to resolve the classes ->
  folders should be marked as excluded or source

4) src/app/core I am too lazy to read it, I hope its fine (probably not). But it WILL need to be revied before production anyway, so its a job for a future you.
