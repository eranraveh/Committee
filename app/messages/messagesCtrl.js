committeeApp.controller("messagesCtrl", function ($scope, $location, userSrv, messagesSrv, commentsSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    let unread = 0;
    $scope.messages = [];
    $scope.newComment = []

    messagesSrv.getActiveUserMessages().then((messages) => {
        unread = 0;
        $scope.messages = messages;

    }).catch((err) => {
        $log.error(err);
    });

    $scope.queryFilter = function (message, index) {
        if (index === 0) {
            unread = 0;
        }

        if (!$scope.query) {
            if (!$scope.importance || message.priority === "1") {
                isMessageUnread(message);
                return true;
            } else {
                return false;
            }
        } else if ((message.title.toLowerCase().includes($scope.query.toLowerCase()) ||
                message.details.toLowerCase().includes($scope.query.toLowerCase())) &&
            (!$scope.importance || message.priority === "1")) {
            isMessageUnread(message);
            return true;
        } else {
            return false;
        }
    }

    function isMessageUnread(message) {
        if (!message.wasRead)
            unread++;
    }

    $scope.getUnreadMessagesCount = () => {
        return unread;
    };

    $scope.onMessageOpen = function (message, index) {
        $scope.newComment[index] = "";
        $('#collapseComment' + index).collapse("hide");

        if (!message.wasRead) {
            var addMessagePromise = userSrv.addOpenedMessages(message.messageId);
            addMessagePromise.then(wasAdded => {
                if (wasAdded) {
                    message.wasRead = true;
                }
            }, error => {

            });
        };

        if (!message.commentsObject.wasLoaded) {
            var getCommentsPromise = commentsSrv.getMessageComments(message);
            getCommentsPromise.then(comments => {
                message.commentsObject.wasLoaded = true;
                message.commentsObject.comments = comments;
            }, error => {

            });
        }
    }

    $scope.postComment = function (index, message) {
        var text = $scope.newComment[index];
        if (!text) {
            alert("Enter a comment text");
            return;
        }

        commentsSrv.createComment(text, message).then((comment) => {
            message.commentsObject.comments.unshift(comment);
            $scope.newComment[index] = "";
            $('#collapseComment' + index).collapse("hide");
        }, (error) => {
            alert("Failed post comment to server. Please try again");
        });
    }
})