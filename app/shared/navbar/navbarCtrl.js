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

    $scope.navigate = function () {
        if (userSrv.isLoggedIn()) {
            if (userSrv.isCommitteeMember()) {
                $location.path("/myCommittee/dashboard/committee");
            } else {
                $location.path("/myCommittee/dashboard/tenant");
            }
        } else {
            $location.path("/");
        }
    }

    $scope.isOnDashboard = function () {
        return $location.path().startsWith("/myCommittee/dashboard/");
    }

    $scope.isOnTenants = function () {
        return $location.path().startsWith("/myCommittee/tenants");
    }

    $scope.isOnMessages = function () {
        return $location.path().startsWith("/myCommittee/messages");
    }

    $scope.isOnIssues = function () {
        return $location.path().startsWith("/myCommittee/issues");
    }

    $scope.isOnPolls = function () {
        return $location.path().startsWith("/myCommittee/polls");
    }

})