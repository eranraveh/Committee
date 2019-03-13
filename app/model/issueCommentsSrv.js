committeeApp.factory("issueCommentsSrv", function ($q) {

    class Comment {
        constructor(parseComment) {
            this.text = parseComment.get("text");
            this.username = parseComment.get("userId").get("name");

            this.date = parseComment.get("createdAt");
            this.commentId = parseComment.id;
        }
    }

    function getIssueComments(issue) {
        var async = $q.defer();

        var comments = [];

        const IssueComment = Parse.Object.extend('IssueComment');
        const query = new Parse.Query(IssueComment);
        query.equalTo("issueId", issue.parseIssue);
        query.find().then((results) => {
            results.forEach(parseComment => {
                var comment = new Comment(parseComment);

                comments.push(comment)
            });

            comments.sort(function (a, b) {
                return b.date - a.date;
            });

            async.resolve(comments);
        }, (error) => {
            async.reject(error);
        });

        return async.promise;
    }

    function createComment(text, issue) {
        var async = $q.defer();

        const IssueComment = Parse.Object.extend('IssueComment');
        const myNewComment = new IssueComment();

        myNewComment.set('text', text);
        myNewComment.set('issueId', issue.parseIssue);
        myNewComment.set('userId', Parse.User.current());

        myNewComment.save().then(
            (result) => {
                var comment = new Comment(result);
                async.resolve(comment);
            },
            (error) => {
                async.reject(error);
                console.error('Error while creating IssueComment: ', error);
            }
        );

        return async.promise;
    }

    function deleteIssueComments(comments) {
        var async = $q.defer();

        var commentPromises = []
        comments.forEach((comment) =>
            commentPromises.push(deleteComment(comment.commentId))
        );

        // neutralize rejected deletetions
        commentPromises = commentPromises.map(
            promise => promise.catch(() => null)
        );

        // wait for all promises, while the neutrailized promises (which rejected...) 
        $q.all(commentPromises).then(results => {
            var successCounter = 0;
            var failCounter = 0;
            for (let index = 0; index < results.length; index++) {
                if (results[index] == null || !results[index])
                    failCounter++;
                else
                    successCounter++;
            }
            async.resolve([successCounter, failCounter]);
        });

        return async.promise;
    }

    function deleteComment(commentId) {
        var async = $q.defer();

        const IssueComment = Parse.Object.extend('IssueComment');
        const query = new Parse.Query(IssueComment);
        // here you put the objectId that you want to delete
        query.get(commentId).then((object) => {
            object.destroy().then((response) => {
                // console.log('Deleted IssueComment', response);
                async.resolve(commentId);
            }, (error) => {
                console.error('Error while deleting IssueComment', error);
                (error) => async.reject(error);
            });
        }, (error) => {
            console.error('Error while getting IssueComment', error);
            async.reject(error);
        });

        return async.promise;
    }

    return {
        getIssueComments: getIssueComments,
        createComment: createComment,
        deleteIssueComments: deleteIssueComments
    }

})