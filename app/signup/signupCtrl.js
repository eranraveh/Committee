committeeApp.controller("signupCtrl", function ($scope, $location, userSrv, committeeSrv) {

    $scope.signup = function () {

        if (!validPassword())
            return;

        if ($scope.signupForm.$invalid)
            return false;

        committeeSrv.createCommittee(toTitleCase($scope.city), toTitleCase($scope.address), $scope.img).then((committee) => {

            userSrv.signup($scope.username.toLowerCase(), $scope.email.toLowerCase(), toTitleCase($scope.name), $scope.apt, committee, $scope.password).then((user) => {
                $location.path("/myCommittee/issues");
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
        if ($scope.password != $scope.confirmPassword) {
            alert("Confirm Password not match");

            return false;
        }

            // obsolite after added password pattern attr
        // if ($scope.password.match("/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/")) {
        //     alert("password not comply with restrictions");

        //     return false;
        // }

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