committeeApp.controller("loginCtrl", function($scope, $location) {

    $scope.invalidLogin = false;

    $scope.login = function() {
        if ($scope.email === "eran@eran.com" && $scope.pwd === "123") {
            $location.path("/myCommittee1/messages");
        } else {
            $scope.invalidLogin = true;
        }
    }

})