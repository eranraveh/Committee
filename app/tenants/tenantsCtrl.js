committeeApp.controller("tenantsCtrl", function ($scope, $location, userSrv) {

    let shownUsers = 0;
    if (!userSrv.isLoggedIn() || !userSrv.isCommitteeMember()) {
        $location.path("/");
        return;
    }

    userSrv.getUsers().then((users) => {
        shownUsers = 0;
        $scope.users = users;

    }).catch((err) => {
        $log.error(err);
    });

    $scope.queryFilter = function (user, index) {
        if (index === 0) {
            shownUsers = 0;
        }

        if (!$scope.query) {
            if (!$scope.isCommitteeOnly || user.isCommitteeMember) {
                shownUsers++;
                return true;
            } else {
                return false;
            }
        } else if ((user.name.toLowerCase().includes($scope.query.toLowerCase()) ||
                user.email.toLowerCase().includes($scope.query.toLowerCase()) ||
                user.apt.toLowerCase().includes($scope.query.toLowerCase())) &&
            (!$scope.isCommitteeOnly || user.isCommitteeMember)) {
            shownUsers++;
            return true;
        } else {
            return false;
        }
    }

    $scope.newTenantOpen = function () {
        $scope.editMode = false;
        $scope.editedUser = null
        resetForm();
    }

    function resetForm() {
        $scope.newTenant = {
            name: null,
            password: null,
            email: null,
            apt: null, 
            isCommitteeMember: false
        };
    }
    $scope.createTenant = function () {
        if ($scope.newTenantForm.$invalid)
            return false;

        userSrv.addUser("", $scope.newTenant.email.toLowerCase(), toTitleCase($scope.newTenant.name), $scope.newTenant.apt, userSrv.getActiveUserCommitteeId(), $scope.newTenant.password, $scope.newTenant.isCommitteeMember).then((user) => {
            // $location.path("/myCommittee/issues");
            // add "new" message
            $scope.users.unshift(user);

            // open the message just been updated/added (located first in the array)
            // $('#collapse' + 0).collapse("show");

            resetForm();

            $("#newTenantForm").modal("hide");
        }, (error) => {
            alert(error.message)
        });
    }

    $scope.getTenantsCount = function () {
        return shownUsers;
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

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
})