committeeApp.controller("tenantsCtrl", function ($scope, $location, userSrv) {

    let shownUsers = 0;
    if (!userSrv.isLoggedIn() || !userSrv.isCommitteeMember()) {
        $location.path("/");
        return;
    }

    $scope.sortType = "name";
    $scope.sortReverse = false;
    let activeUserId = userSrv.getActiveUser().id;

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
                user.apartment.toLowerCase().includes($scope.query.toLowerCase())) &&
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

        var promise;
        if ($scope.editMode)
            promise = user.updateUser(editedUser, $scope.newTenant.email.toLowerCase(), toTitleCase($scope.newTenant.name), $scope.newTenant.apt, $scope.newTenant.isCommitteeMember);
        else
            userSrv.addUser("", $scope.newTenant.email.toLowerCase(), toTitleCase($scope.newTenant.name), $scope.newTenant.apt, userSrv.getActiveUserCommitteeId(), $scope.newTenant.password, $scope.newTenant.isCommitteeMember)

        promise.then((user) => {
            // remove "old" user
            if ($scope.editedMode) {
                var reomveIndex = $scope.issues.indexOf($scope.editedUser);
                if (reomveIndex > -1)
                    $scope.issues.splice(reomveIndex, 1);
            }

            // add new/updated user
            $scope.users.unshift(user);

            resetForm();

            $("#newTenantForm").modal("hide");
        }, (error) => {
            alert(error.message)
        });
    }

    $scope.editUser = function (user) {
        $scope.newTenant = {
            username: user.username,
            name: user.name,
            password: user.password,
            apt: user.apartment,
            isCommitteeMember: user.isCommitteeMember
        };

        $scope.editMode = true;
        $scope.editedUser = user;

        $("#newTenantForm").modal("show");
    }

    $scope.deleteUser = function (user) {
        userSrv.deleteUser(user).then((deletedUser) => {
            var reomveIndex = $scope.users.indexOf(user);
            if (reomveIndex > -1)
                $scope.users.splice(reomveIndex, 1);
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

    $scope.canDeleteUser = function (user) {
        return (user.id != activeUserId)
    }

    $scope.sort = function (column) {
        if ($scope.sortType != column) {
            $scope.sortReverse = false;
            $scope.sortType = column;
        } else
            $scope.sortReverse = !$scope.sortReverse;
    }
})