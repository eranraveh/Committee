committeeApp.controller("dashboardCommitteeCtrl", function ($scope, $location, userSrv, messagesSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    const issueStatus = {
        NEW: "New",
        IN_PROGRESS: "In progress",
        CLOSE: "Closed"
    }
    const issueUrgency = {
        URGENT: "1",
        IMPORTANT: "2",
        NORMAL: "3"
    }


    $scope.issues = [];
    issuesSrv.getIssues().then((issues) => {
        $scope.undreadIssues = issues.fiter(issue => !issue.wasRead);
        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        $scope.weekOldIssues = issues.fiter(issue => issue.status != issueStatus.CLOSE && issue.postingDate < oneWeekAgo);

    }).catch((err) => {
        console.error(err);
    });

});