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

    $scope.isCommitteeMember = function () {
        return userSrv.isCommitteeMember();
    }

    $scope.isSignupNeeded = function () {
        if (userSrv.isLoggedIn() ||
            $location.path() == "/myCommittee/signup")
            return false;
        else
            return true;
    }
})