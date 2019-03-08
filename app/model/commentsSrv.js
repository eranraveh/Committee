committeeApp.factory("commentsSrv", function ($q, $log, userSrv) {

    class Comment {
        constructor(parseComment) {
            this.text = parseComment.get("text");
            this.username = parseComment.get("userId").get("name");

            this.date = parseComment.get("createdAt");
            this.commentId = parseComment.id;
        }
    }

    function getMessageComments(message) {
        var async = $q.defer();

        var comments = [];

        const MessageComment = Parse.Object.extend('MessageComment');
        const query = new Parse.Query(MessageComment);
        query.equalTo("messageId", message.parseMessage);
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

    function createComment(text, message) {
        var async = $q.defer();

        const MessageComment = Parse.Object.extend('MessageComment');
        const myNewComment = new MessageComment();

        myNewComment.set('text', text);
        myNewComment.set('messageId', message.parseMessage);
        myNewComment.set('userId', Parse.User.current());

        myNewComment.save().then(
            (result) => {
                var comment = new Comment(result);
                async.resolve(comment);
            },
            (error) => {
                async.reject(error);
                console.error('Error while creating MessageComment: ', error);
            }
        );

        return async.promise;
    }

    function deleteMessageComments(message) {
        var async = $q.defer();

        var commentPromises = []
        message.commentsObject.comments.forEach((comment) =>
            commentPromises.push(deleteComment(comment.commentId))
        );

        // neutralize rejected deletetions
        commentPromises = commentPromises.map(
            promise => promise.catch(() => null)
        );

        // wait for all promises, while the neutrailized promises (which rejected...) 
        $q.all(commentPromises, results => {
            var successCounter = 0;
            var failCounter = 0;
            for (let index = 0; index < results.length; index++) {
                if (results[index] == null || !results[index])
                    failCounter++;
                else
                    successCounter++;
            }
            async.resolve(successCounter, failCounter);
        });

        return async.promise;
    }

    function deleteComment(commentId) {
        var async = $q.defer();

        const MessageComment = Parse.Object.extend('MessageComment');
        const query = new Parse.Query(MessageComment);
        // here you put the objectId that you want to delete
        query.get(commentId).then((object) => {
            object.destroy().then((response) => {
                console.log('Deleted MessageComment', response);
                async.resolve(commentId);
            }, (error) => {
                console.error('Error while deleting MessageComment', error);
                (error) => async.reject(error);
            });
        });

    }

    return {
        getMessageComments: getMessageComments,
        createComment: createComment,
        deleteMessageComments: deleteMessageComments
    }

})