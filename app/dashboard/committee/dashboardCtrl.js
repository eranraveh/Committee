committeeApp.controller("dashboardCommitteeCtrl", function ($scope, $location, $controller, userSrv, messagesSrv, issuesSrv, issueCommentsSrv) {

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


    // descending order
    $scope.issuesSort = "-postingDate";

    function loadData() {
        $scope.issues = [];
        issuesSrv.getIssues().then((issues) => {
            $scope.newIssues = issues.filter(issue => !issue.wasRead);

            var oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 2);
            $scope.weekOldIssues = issues.filter(issue => issue.status != issueStatus.CLOSE && issue.postingDate < oneWeekAgo);

        }).catch((err) => {
            console.error(err);
        });
    }

    // from issuesCtrl :
    loadData();

    $scope.newComment = [];
    $scope.onIssueOpen = function (issue, index, parent) {
        $scope.newComment[index] = "";
        $('#' + parent + 'CollapseComment' + index).collapse("hide");

        if (!issue.wasRead) {
            var addIssuePromise = userSrv.addOpenedIssues(issue.parseIssue.id);
            addIssuePromise.then(wasAdded => {
                if (wasAdded) {
                    issue.wasRead = true;
                }
            }, error => {

            });
        };

        if (!issue.commentsObject.wasLoaded) {
            var getCommentsPromise = issueCommentsSrv.getIssueComments(issue);
            getCommentsPromise.then(comments => {
                issue.commentsObject.wasLoaded = true;
                issue.commentsObject.comments = comments;
            }, error => {

            });
        }
    }

    $scope.deleteIssue = function (issue) {
        issuesSrv.deleteIssue(issue).then(() => {

            issueCommentsSrv.deleteIssueComments(issue.commentsObject.comments).then(([successCounter, failCounter]) => {
                console.log(successCounter + " comments deleted and " + failCounter + " comments failed")
            }, (error) => {

            });

            var reomveIndex = $scope.issues.indexOf(issue);
            if (reomveIndex > -1)
                $scope.issues.splice(reomveIndex, 1);
        }, () => {
            alert("Failed delete issue from server. Please try again");
        });

    }

    $scope.postComment = function (index, issue, parent) {
        var text = $scope.newComment[index];
        if (!text) {
            alert("Enter a comment text");
            return;
        }

        issueCommentsSrv.createComment(text, issue).then((comment) => {
            issue.commentsObject.comments.unshift(comment);
            $scope.newComment[index] = "";
            $('#' + parent + 'CollapseComment' + index).collapse("hide");
        }, (error) => {
            alert("Failed post comment to server. Please try again");
        });
    }


    $scope.isCommitteeMember = function () {
        return userSrv.isCommitteeMember();
    }

    $scope.canEditIssue = function () {
        return false;
    }

});



//=================================================================



// function DashboardCommitteeCtrl($scope, $location, userSrv, messagesSrv, issuesSrv, issueCommentsSrv) {
//     IssuesCtrl.call(this, $scope, $location, userSrv, issuesSrv, issueCommentsSrv);

//     if (!userSrv.isLoggedIn()) {
//         $location.path("/");
//         return;
//     }

// $controller("issuesCtrl", {
//     $scope: $scope
// });
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