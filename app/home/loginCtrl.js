committeeApp.controller("loginCtrl", function ($scope, $location, userSrv) {

    $scope.invalidLogin = false;
    $scope.username = "luba";
    $scope.pwd = "123";

    $scope.login = function () {
        if ($scope.loginForm.$invalid)
            return false;

        userSrv.login($scope.username, $scope.pwd).then(function (user) {
                if (userSrv.isCommitteeMember()) {
                    $location.path("/myCommittee/dashboard/committee");
                } else {
                    $location.path("/myCommittee/dashboard/tenant");
                }


                // todo: remove
                $location.path("/myCommittee/issues");

            },
            function (error) {
                $scope.invalidLogin = true;
            });
    }

    // $scope.login();
})