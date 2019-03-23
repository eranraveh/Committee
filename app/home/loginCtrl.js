committeeApp.controller("loginCtrl", function ($scope, $location, userSrv) {

    $scope.invalidLogin = false;

    $scope.login = function () {
        if ($scope.loginForm.$invalid)
            return false;

        userSrv.login($scope.username, $scope.pwd).then(function (user) {
                if (userSrv.isCommitteeMember()) {
                    $location.path("/myCommittee/dashboard/committee");
                } else {
                    $location.path("/myCommittee/dashboard/tenant");
                }
            },
            function (error) {
                $scope.invalidLogin = true;
            });
    }
})