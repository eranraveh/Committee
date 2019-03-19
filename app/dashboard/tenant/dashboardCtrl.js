committeeApp.controller("dashboardTenantCtrl", function ($scope, $location, userSrv, messagesSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }


});