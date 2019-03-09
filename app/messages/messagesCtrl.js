committeeApp.controller("messagesCtrl", function ($scope, $location, userSrv, messagesSrv, commentsSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    $('[rel="tooltip"]').tooltip({
        trigger: "hover"
    });
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

    $scope.editMessage = function (message) {

    }

    $scope.deleteMessage = function (message) {
        messagesSrv.deleteMessage(message).then(() => {

            commentsSrv.deleteMessageComments(message).then(([successCounter, failCounter]) => {
                console.log(successCounter + " comments deleted and " + failCounter + " comments failed")
            }, (error) => {

            });

            var reomveIndex = $scope.messages.indexOf(message);
            if (reomveIndex > -1)
                $scope.messages.splice(reomveIndex, 1);
        }, () => {
            alert("Failed delete message from server. Please try again");
        });

    }

    $scope.newMessageOpen = function () {
        resetForm();
    }

    function resetForm() {
        $scope.newMessage = {
            title: null,
            message: null,
            priority: false
        };
        // $scope.newMessage.title = null;
        // $scope.newMessage.message = null;
        $("#priority>label").removeClass("active");
        // $scope.newMessage.priority = false;

    }

    $scope.postMessage = function () {
        if ($scope.newMessageForm.$invalid)
            return;

        messagesSrv.postMessage($scope.newMessage.title, $scope.newMessage.message, $scope.newMessage.priority === "high").then((message) => {
            $scope.messages.unshift(message);
            resetForm();
            $("#newMessageForm").modal("hide");
        }, (error) => {
            alert("Posting message failed");
        });
    }

    $scope.isCommitteeMember = function () {
        return userSrv.isCommitteeMember();
    }
})