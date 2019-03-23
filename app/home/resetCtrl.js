committeeApp.controller("resetCtrl", function ($scope, $location, userSrv) {

    $scope.reset = function () {
        if ($scope.resetForm.$invalid)
            return false;


        $scope.successReset = false;
        userSrv.resetPassword($scope.email).then(() => {
            $scope.$apply(() => {
                $scope.successReset = true;
            });
        }, (error) => {

            $scope.$apply(() => {
                $scope.successReset = true;
            });
        })
    }

    $scope.login = function () {
        $location.path("/myCommittee/login");
    }
})