committeeApp.controller("messagesCtrl", function ($scope, $location, userSrv, messagesSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    let unread = 0;
    $scope.messages = [];
    let lastQuery = "";
    // $scope.query = "";

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
})