committeeApp.controller("resetCtrl", function ($scope, $location, userSrv) {

    // $scope.username = "xerave1";
    // $scope.pwd = "123";
    $scope.username = "luba";
    $scope.pwd = "123";

    $scope.reset = function () {
        // $scope.invalidLogin = false;
        $scope.successReset = false;
        userSrv.resetPassword($scope.email).then(() => {
            $scope.$apply(() => {
                $scope.successReset = true;
            });
        }, (error) => {
            // $scope.errorMsg = error.message;
            // $scope.$apply(() => {
            //     $scope.invalidLogin = true;
            // });

            $scope.$apply(() => {
                $scope.successReset = true;
            });
        })

    }

    $scope.login = function () {
        $location.path("/myCommittee/login");
    }
    // $scope.isInvalid = () => {
    //     return $scope.invalidLogin;
    // }
})