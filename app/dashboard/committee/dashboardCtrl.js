committeeApp.controller("dashboardCommitteeCtrl", function ($scope, $location, $controller, userSrv, messagesSrv, issuesSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    $controller("issuesCtrl", {$scope: $scope});
    
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


    // descending order
    $scope.issuesSort = "-postingDate";

    $scope.issues = [];
    issuesSrv.getIssues().then((issues) => {
        $scope.newIssues = issues.filter(issue => !issue.wasRead);

        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 2);
        $scope.weekOldIssues = issues.filter(issue => issue.status != issueStatus.CLOSE && issue.postingDate < oneWeekAgo);

    }).catch((err) => {
        console.error(err);
    });

});



//=================================================================



// function DashboardCommitteeCtrl($scope, $location, userSrv, messagesSrv, issuesSrv, issueCommentsSrv) {
//     IssuesCtrl.call(this, $scope, $location, userSrv, issuesSrv, issueCommentsSrv);

//     if (!userSrv.isLoggedIn()) {
//         $location.path("/");
//         return;
//     }

//     const issueStatus = {
//         NEW: "New",
//         IN_PROGRESS: "In progress",
//         CLOSE: "Closed"
//     }
//     const issueUrgency = {
//         URGENT: "1",
//         IMPORTANT: "2",
//         NORMAL: "3"
//     }


//     // descending order
//     $scope.issuesSort = "-postingDate";

//     $scope.issues = [];

//     // function loadData() {
//     //     issuesSrv.getIssues().then((issues) => {
//     //         $scope.newIssues = issues.filter(issue => !issue.wasRead);

//     //         var oneWeekAgo = new Date();
//     //         oneWeekAgo.setDate(oneWeekAgo.getDate() - 2);
//     //         $scope.weekOldIssues = issues.filter(issue => issue.status != issueStatus.CLOSE && issue.postingDate < oneWeekAgo);

//     //     }).catch((err) => {
//     //         console.error(err);
//     //     });
//     // }

// }
// DashboardCommitteeCtrl.prototype = Object.create(IssuesCtrl.prototype);
// DashboardCommitteeCtrl.prototype.loadData = function () {
//     issuesSrv.getIssues().then((issues) => {
//         $scope.newIssues = issues.filter(issue => !issue.wasRead);

//         var oneWeekAgo = new Date();
//         oneWeekAgo.setDate(oneWeekAgo.getDate() - 2);
//         $scope.weekOldIssues = issues.filter(issue => issue.status != issueStatus.CLOSE && issue.postingDate < oneWeekAgo);

//     }).catch((err) => {
//         console.error(err);
//     });
//     //     this.commonMethod1();
// };

// committeeApp.controller("dashboardCommitteeCtrl", DashboardCommitteeCtrl);



// ==================================================


// committeeApp.controller("dashboardCommitteeCtrl", function ($scope, $location, userSrv, messagesSrv, issuesSrv) {

//     if (!userSrv.isLoggedIn()) {
//         $location.path("/");
//         return;
//     }

//     const issueStatus = {
//         NEW: "New",
//         IN_PROGRESS: "In progress",
//         CLOSE: "Closed"
//     }
//     const issueUrgency = {
//         URGENT: "1",
//         IMPORTANT: "2",
//         NORMAL: "3"
//     }


//     // descending order
//     $scope.issuesSort = "-postingDate";

//     $scope.issues = [];
//     issuesSrv.getIssues().then((issues) => {
//         $scope.newIssues = issues.filter(issue => !issue.wasRead);

//         var oneWeekAgo = new Date();
//         oneWeekAgo.setDate(oneWeekAgo.getDate() - 2);
//         $scope.weekOldIssues = issues.filter(issue => issue.status != issueStatus.CLOSE && issue.postingDate < oneWeekAgo);

//     }).catch((err) => {
//         console.error(err);
//     });

// });