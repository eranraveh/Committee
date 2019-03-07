committeeApp.controller("messagesCtrl", function ($scope, $location, userSrv, messagesSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    $scope.messages = [];
    
    messagesSrv.getActiveUserMessages().then((messages) => {
        $scope.messages = messages;
    }).catch((err) => {
        $log.error(err);
    });

})