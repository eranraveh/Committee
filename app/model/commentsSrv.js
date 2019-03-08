committeeApp.factory("commentsSrv", function ($q, $log, userSrv) {

    class Comment {
        constructor(parseComment) {
            this.text = parseComment.get("text");
            this.username = parseComment.get("userId").get("name");

            this.date = parseComment.get("createdAt");
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

    return {
        getMessageComments: getMessageComments,
        createComment: createComment
    }

})