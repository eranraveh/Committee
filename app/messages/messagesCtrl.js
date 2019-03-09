committeeApp.controller("messagesCtrl", function ($scope, $location, userSrv, messagesSrv, messageCommentsSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    // trigger tooltip on hover only
    $('[rel="tooltip"]').tooltip({
        trigger: "hover"
    });

    let unread = 0;
    $scope.messages = [];
    $scope.newComment = []
    $scope.editMode = false;

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
            // show only important message
            if ((!$scope.importance || message.priority === "1") && 
            // show only unread message
            (!$scope.unread || !message.wasRead)) {
                isMessageUnread(message);
                return true;
            } else {
                return false;
            }
        } else if ((message.title.toLowerCase().includes($scope.query.toLowerCase()) ||
                message.details.toLowerCase().includes($scope.query.toLowerCase())) &&
            // show only important message
            (!$scope.importance || message.priority === "1") &&
            // show only unread message
            (!$scope.unread || !message.wasRead)) {
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
            var addMessagePromise = userSrv.addOpenedMessages(message.parseMessage.id);
            addMessagePromise.then(wasAdded => {
                if (wasAdded) {
                    message.wasRead = true;
                }
            }, error => {

            });
        };

        if (!message.commentsObject.wasLoaded) {
            var getCommentsPromise = messageCommentsSrv.getMessageComments(message);
            getCommentsPromise.then(comments => {
                message.commentsObject.wasLoaded = true;
                message.commentsObject.comments = comments;
            }, error => {

            });
        }
    }

    $scope.editMessage = function (message) {
        $scope.newMessage = {
            title: message.title,
            message: message.details,
            priority: message.priority === '1' ? "high" : "low"
        };

        if ($scope.newMessage.priority === "high") {
            $("#priority > label:first-child").addClass("active");
            $("#priority > label:last-child").removeClass("active");
        } else {
            $("#priority > label:first-child").removeClass("active");
            $("#priority > label:last-child").addClass("active");
        }
        $scope.editedMessage = message;

        $scope.editMode = true;
        $("#newMessageForm").modal("show");
    }

    $scope.deleteMessage = function (message) {
        messagesSrv.deleteMessage(message).then(() => {

            messageCommentsSrv.deleteMessageComments(message.commentsObject.comments).then(([successCounter, failCounter]) => {
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
        $scope.editMode = false;
        $scope.editedMessage = null
        resetForm();
    }

    function resetForm() {
        $scope.newMessage = {
            title: null,
            message: null,
            priority: false
        };

        $("#priority>label").removeClass("active");
    }

    $scope.postMessage = function () {
        if ($scope.newMessageForm.$invalid)
            return;

        var promise = messagesSrv.postMessage($scope.newMessage.title, $scope.newMessage.message, $scope.newMessage.priority === "high", $scope.editedMessage);

        promise.then((message) => {
            // remove "old" message
            if ($scope.editedMessage != null) {
                var reomveIndex = $scope.messages.indexOf($scope.editedMessage);
                if (reomveIndex > -1)
                    $scope.messages.splice(reomveIndex, 1);
            }

            // add "new" message
            $scope.messages.unshift(message);

            // open the message just been updated/added (located first in the array)
            // $('#collapse' + 0).collapse("show");

            resetForm();

            $("#newMessageForm").modal("hide");
        }, (error) => {
            alert("Posting message failed");
        });

    }

    $scope.postComment = function (index, message) {
        var text = $scope.newComment[index];
        if (!text) {
            alert("Enter a comment text");
            return;
        }

        messageCommentsSrv.createComment(text, message).then((comment) => {
            message.commentsObject.comments.unshift(comment);
            $scope.newComment[index] = "";
            $('#collapseComment' + index).collapse("hide");
        }, (error) => {
            alert("Failed post comment to server. Please try again");
        });
    }


    $scope.isCommitteeMember = function () {
        return userSrv.isCommitteeMember();
    }
})