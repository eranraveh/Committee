committeeApp.controller("navbarCtrl", function ($scope, userSrv, $location) {

    $scope.isUserLoggedIn = function () {
        return userSrv.isLoggedIn();
    }

    $scope.getUserName = function () {
        var user = userSrv.getActiveUser();

        return user == null ? "" : user.name;
    }
    
    $scope.logout = function () {
        userSrv.logout();
        $location.path("/");
    }
})