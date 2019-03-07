committeeApp.controller("messagesCtrl", function ($scope, $location, userSrv, messagesSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    $scope.messages = [];

    messagesSrv.getActiveUserMessages().then((messages) => {
        $scope.unread = 0;
        $scope.messages = messages;

    }).catch((err) => {
        $log.error(err);
    });

    $scope.queryFilter = function (message) {
        if (!$scope.query) {
            isMessageUnread();
            return true;
        } else if (message.title.toLowerCase().includes($scope.query.toLowerCase()) ||
            message.details.toLowerCase().includes($scope.query.toLowerCase())) {
            isMessageUnread();
            return true;
        } else {
            return false;
        }
    }

    function isMessageUnread() {
        if (!message.wasRead)
            $scope.unread++;
    }

    function onQueryChange() {
        $scope.unread = 0;
    }
    // $scope.getUnreadMessagesCount = () => {
    //     let unread = 0;
    //     $scope.messages.forEach(message => {
    //         if (!message.wasRead)
    //             unread++;
    //     });

    //     return unread;
    // };
})