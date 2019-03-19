committeeApp.factory("issuesSrv", function ($q, $log, userSrv) {

    class Issue {
        constructor(parseIssue) {
            this.title = parseIssue.get("title");
            this.details = parseIssue.get("details");
            this.priority = parseIssue.get("priority");
            this.status = parseIssue.get("status");
            this.parseUser = parseIssue.get("userId");
            this.postingDate = parseIssue.get("updatedAt");
            this.posterName = userSrv.GetUsername(this.parseUser.id);
            this.wasRead = (userSrv.getActiveUser().readMessages.indexOf(parseIssue.id) > -1);
            this.isMyIssue = (userSrv.getActiveUser().username === this.parseUser.get("username"));
            this.commentsObject = {
                wasLoaded: false,
                comments: []
            };
            this.parseIssue = parseIssue;
        }
    }

    function getIssues() {
        var async = $q.defer();

        var issues = [];

        const ParseIssue = Parse.Object.extend('Issue');
        const query = new Parse.Query(ParseIssue);

        // query.equalTo("isActive", true);
        query.equalTo("committeeId", userSrv.getActiveUserCommitteeId());
        query.find().then((results) => {
            results.forEach(parseIssue => {
                var issue = new Issue(parseIssue);

                issues.push(issue)
            });


            issues.sort(function (a, b) {
                return b.postingDate - a.postingDate
            });

            async.resolve(issues);

        }, function (error) {
            $log.error('Error while fetching issues', error);
            async.reject(error);
        });

        return async.promise;
    }

    function postIssue(title, issueBody, priority, status, oldIssue) {
        if (oldIssue != null) {
            return updateIssue(title, issueBody, priority, status, oldIssue);
        }

        var async = $q.defer();

        const ParseIssue = Parse.Object.extend('Issue');
        const newIssue = new ParseIssue();

        newIssue.set('title', title);
        newIssue.set('details', issueBody);
        newIssue.set('priority', priority);
        newIssue.set('status', status);
        newIssue.set('userId', Parse.User.current());
        newIssue.set('committeeId', userSrv.getActiveUserCommitteeId());

        newIssue.save().then(
            (result) => {
                // console.log('Issue created', result);
                var newIssueObj = new Issue(result);
                async.resolve(newIssueObj);
            },
            (error) => {
                console.error('Error while creating Issue: ', error);
                async.reject(error);
            }
        );

        return async.promise;
    }


    function updateIssue(title, issueBody, priority, status, oldIssue) {
        var async = $q.defer();

        const ParseIssue = Parse.Object.extend('Issue');
        const query = new Parse.Query(ParseIssue);

        query.get(oldIssue.parseIssue.id).then((updatedIssue) => {
            updatedIssue.set('title', title);
            updatedIssue.set('details', issueBody);
            updatedIssue.set('priority', priority );
            updatedIssue.set('status', status );
            updatedIssue.save().then(
                (result) => {
                    // console.log('Issue created', result);
                    var newIssueObj = new Issue(result);
                    async.resolve(newIssueObj);
                },
                (error) => {
                    console.error('Error while updating Issue: ', error);
                    async.reject(error);
                }
            );
        }, (error) => {
            console.error('Error while getting Issue', error);
            async.reject(error);
        });

        return async.promise;
    }

    function deleteIssue(issue) {
        var async = $q.defer();

        const Issue = Parse.Object.extend('Issue');
        const query = new Parse.Query(Issue);
        // here you put the objectId that you want to delete
        query.get(issue.parseIssue.id).then((object) => {

            object.destroy().then((response) => {
                // console.log('Deleted Issue', response);
                async.resolve(issue);
                // object.destroy promise error
            }, (error) => {
                console.error('Error while deleting Issue', error);
                (error) => async.reject(error);
            })
            // query.get promise error
        }, (error) => {
            console.error('Error while getting Issue', error);
            async.reject(error)
        });

        return async.promise;
    }

    return {
        getIssues: getIssues,
        postIssue: postIssue,
        deleteIssue: deleteIssue
    }

})