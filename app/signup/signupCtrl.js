committeeApp.controller("signupCtrl", function ($scope, $location, userSrv) {

    $scope.invalidLogin = false;

    // $scope.username = "xerave1";
    // $scope.pwd = "123";
    $scope.username = "luba";
    $scope.pwd = "123";

    $scope.login = function () {
        userSrv.login($scope.username, $scope.pwd).then(function (user) {
            $("#loginForm").modal("hide");
            $location.path("/myCommittee/issues");

        }, function (error) {
            $scope.invalidLogin = true;
        });
    }

    $(".toggle-password").click(function () {

        // switch the eye <--> eye-slash
        $(this).toggleClass("fa-eye fa-eye-slash");
        // can the field the eye is toggling
        var input = $($(this).attr("toggle"));

        // toggle the type attr   password <--> text
        if (input.attr("type") == "password") {
            input.attr("type", "text");
        } else {
            input.attr("type", "password");
        }
    });
})