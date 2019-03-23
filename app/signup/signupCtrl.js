committeeApp.controller("signupCtrl", function ($scope, $location, $route, userSrv, committeeSrv) {

    $scope.isSignup = $route.current.$$route.isSignup;
    $scope.isSuccessSubmit = !!$route.current.$$route.isSignup;

    // (is update account)
    if (!$scope.isSignup) {
        if (!userSrv.isLoggedIn()) {
            $location.path("/");
            return;
        }

        var user = userSrv.getActiveUser();

        $scope.username = user.username;
        $scope.email = user.email;
        $scope.name = user.name;
        $scope.apt = user.apartment;
        $scope.password = null;
        $scope.confirmPassword = null;

    }

    $scope.submitForm = function () {
        if ($scope.signupForm.$invalid)
            return false;

        if (!validPassword())
            return;

        if ($scope.isSignup) {
            signup();
        } else {
            update();
        }
    }

    function update() {

        $scope.isSuccessSubmit = true;

        userSrv.updateCurrentUser(userSrv.getActiveUser(), $scope.email.toLowerCase(), toTitleCase($scope.name), $scope.apt, null, null, null, $scope.username.toLowerCase(), $scope.password).then((user) => {
            $location.path("/myCommittee/account/success");
        }, (error) => {
            alert(error.message)
        });
    }

    function signup() {

        committeeSrv.createCommittee(toTitleCase($scope.city), toTitleCase($scope.address), $scope.img).then((committee) => {
            var username = !$scope.username ? "" : $scope.username.toLowerCase();
            userSrv.signup(username, $scope.email.toLowerCase(), toTitleCase($scope.name), $scope.apt, committee, $scope.password).then((user) => {
                $location.path("/myCommittee/dashboard/committee");
            }, (error) => {
                // console.error("error signing up user", error);
                alert(error.message)
                committeeSrv.deleteCommittee(committee).then(() => {

                }, (error) => {
                    console.error("error consolidate committee after user signup failed", error);
                    alert(error.message);
                });
                // alert("Creating account failed. Please try again.");
            });
        }, (error) => {
            alert(error.message);
        });
    }

    function validPassword() {

        if (!$scope.isSignup && !$scope.password && !$scope.confirmPassword) {
            return true;
        }

        if ($scope.password != $scope.confirmPassword) {
            alert("Confirm Password not match");

            return false;
        }

        return true;
    }

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    // show/hide password
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