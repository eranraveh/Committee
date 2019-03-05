committeeApp.controller("loginCtrl", function ($scope, $location, userSrv) {

    $scope.invalidLogin = false;

    $scope.email = "eran@eran.com";
    $scope.pwd = "123";

    $scope.login = function () {
        userSrv.login($scope.email, $scope.pwd).then(function (user) {
            $location.path("/myCommittee/messages");

        }, function (error) {
            $scope.invalidLogin = true;
        });
    }

})