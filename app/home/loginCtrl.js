committeeApp.controller("loginCtrl", function ($scope, $location, userSrv) {

    $scope.invalidLogin = false;

    // $scope.username = "xerave1";
    // $scope.pwd = "123";
    $scope.username = "luba";
    $scope.pwd = "123";

    $scope.login = function () {
        userSrv.login($scope.username, $scope.pwd).then(function (user) {
            $("#loginForm").modal("hide");
            $location.path("/myCommittee/polls");

        }, function (error) {
            $scope.invalidLogin = true;
            alert(error.message);
        });
    }

    $scope.onSignup = function() {
        $("#loginForm").modal("hide");
    }
})