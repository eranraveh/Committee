committeeApp.controller("issuesCtrl", function ($scope, $location, userSrv, issuesSrv, issueCommentsSrv) {
    // const issueStatus = {
    //     NEW: "New",
    //     IN_PROGRESS: "In progress",
    //     CLOSE: "Closed"
    // }
    // issueUrgency = issuesSrv.issueUrgency;

    $scope.newIssue = {
        title: "",
        issueBody: "",
        priority: "",
        status: ""
    };

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    // // trigger tooltip on hover only when data-toggle in use for other then tooltip
    // $('[rel="tooltip"]').tooltip({
    //     trigger: "hover"
    // });

    // $('.dropdown-menu').click(function (e) {
    //     e.stopPropagation();
    // });

    // $scope.newIssue = {};
    let unreadIssues = 0;
    let openIssues = 0;
    let myIssues = 0;
    $scope.issues = [];
    $scope.editMode = true;
    // $scope.newComment = [];
    // $scope.editMode = false;
    // let editedIssue = null;

    // descending order
    $scope.sort = "-postingDate";

    function loadData(params) {
        issuesSrv.getIssues().then((issues) => {
            $scope.issues = issues;

        }).catch((err) => {
            console.error(err);
        });
    }
    loadData();

    // $scope.openReadIssue = null;

    $scope.queryFilter = function (issue, index) {
        // reset the unread counter on first object being checked in filter
        if (index === 0)
            resetCounters();

        if (!$scope.query) {
            return shouldBeShown(issue);
            // // show only important issue
            // if ((!$scope.importance || issue.priority === issueUrgency.URGENT) &&
            //     // show only unread issue
            //     (!$scope.unread || !issue.wasRead || (openReadIssue != null && openReadIssue == issue)) &&
            //     // show only my issue
            //     (!$scope.myIssues || issue.isMyIssue)) {
            //     checkIssueCounters(issue);
            //     return true;
            // } else {
            //     return false;
            // }
        } else if ((issue.title.toLowerCase().includes($scope.query.toLowerCase()) ||
                issue.details.toLowerCase().includes($scope.query.toLowerCase())) &&
            shouldBeShown(issue)) {
            // // show only important issue
            // (!$scope.importance || issue.priority === issueUrgency.URGENT) &&
            // // show only unread issue
            // (!$scope.unread || !issue.wasRead || (openReadIssue != null && openReadIssue == issue)) &&
            // // show only unread issue
            // (!$scope.myIssues || issue.isMyIssue)) {
            // checkIssueCounters(issue);
            return true;
        } else {
            return false;
        }
    }

    function shouldBeShown(issue) {
        // show only important issue
        if ((!$scope.importance || issue.priority === issuesSrv.issueUrgency.URGENT) &&
            // show only unread issue
            (!$scope.unread || !issue.wasRead || ($scope.openReadIssue != null && $scope.openReadIssue == issue)) &&
            // show only my issue
            (!$scope.myIssues || issue.isMyIssue)) {
            checkIssueCounters(issue);
            return true;
        } else {
            return false;
        }

    }

    function checkIssueCounters(issue) {
        if (!issue.wasRead)
            unreadIssues++;
        if (issue.status != issuesSrv.issueStatus.CLOSE)
            openIssues++;
        if (issue.isMyIssue)
            myIssues++;
    }

    function resetCounters() {
        unreadIssues = 0;
        openIssues = 0;
        myIssues = 0;
    }

    $scope.getUnreadIssuesCount = () => {
        return unreadIssues;
    };

    $scope.getOpenIssuesCount = () => {
        return openIssues;
    };

    $scope.getMyIssuesCount = () => {
        return myIssues;
    };

    // // var openReadIssue = null;
    // // $scope.onIssueOpen = function (issue, index, parent) {

    // //     $scope.newComment[index] = "";
    // //     $('#' + parent + 'CollapseComment' + index).collapse("hide");

    // //     if (!issue.wasRead) {
    // //         var addIssuePromise = userSrv.addOpenedIssues(issue.parseIssue.id);
    // //         addIssuePromise.then(wasAdded => {
    // //             // if the unread filter is on, the issue will disapear when open it
    // //             issue.wasRead = true;

    // //             // open new read issue
    // //             openReadIssue = issue;
    // //         }, error => {

    // //         });
    // //     }


    // //     if (!issue.commentsObject.wasLoaded) {
    // //         var getCommentsPromise = issueCommentsSrv.getIssueComments(issue);
    // //         getCommentsPromise.then(comments => {
    // //             issue.commentsObject.wasLoaded = true;
    // //             issue.commentsObject.comments = comments;
    // //         }, error => {

    // //         });
    // //     }

    // // }

    // // $scope.editIssue = function (issue) {
    // //     $scope.newIssue = {
    // //         title: issue.title,
    // //         issueBody: issue.details,
    // //         priority: issue.priority,
    // //         status: issue.status
    // //     };

    // //     $("#priority > label").removeClass("active");
    // //     if ($scope.newIssue.priority === issueUrgency.URGENT)
    // //         $("#priority > label:first-child").addClass("active");
    // //     else if ($scope.newIssue.priority === issueUrgency.IMPORTANT)
    // //         $("#priority > label:nth-child(2)").addClass("active");
    // //     else
    // //         $("#priority > label:last-child").addClass("active");

    // //     $scope.editMode = true;
    // //     editedIssue = issue;
    // //     $scope.isReadOnly = !issue.isMyIssue;

    // //     $("#newIssueForm").modal("show");
    // // }

    // // $scope.deleteIssue = function (issue) {
    // //     issuesSrv.deleteIssue(issue).then(() => {

    // //         issueCommentsSrv.deleteIssueComments(issue.commentsObject.comments).then(([successCounter, failCounter]) => {
    // //             console.log(successCounter + " comments deleted and " + failCounter + " comments failed")
    // //         }, (error) => {

    // //         });

    // //         var reomveIndex = $scope.issues.indexOf(issue);
    // //         if (reomveIndex > -1)
    // //             $scope.issues.splice(reomveIndex, 1);
    // //     }, () => {
    // //         alert("Failed delete issue from server. Please try again");
    // //     });

    // // }

    $scope.closeModal = function () {
        $scope.editMode = true;
    }

    // $scope.newIssueOpen = function () {
    //     $scope.editMode = false;
    //     $scope.newIssue.editedIssue = null;
    //     $scope.isReadOnly = false;
    //     resetForm();
    //     // priority Normal is default
    //     // $("#priority > label:last-child").addClass("active");
    //     // $scope.newIssue.priority = issueUrgency.NORMAL;
    //     // $scope.newIssue.status = issueStatus.NEW;
    // }

    // function resetForm() {
    //     $scope.newIssue.title = null;
    //     $scope.newIssue.issueBody = null;
    //     $scope.newIssue.priority = issuesSrv.issueUrgency.NORMAL;
    //     $scope.newIssue.status = issuesSrv.issueStatus.NEW;

    //     // priority Normal is default
    //     $("#priority>label").removeClass("active");
    //     $("#priority > label:last-child").addClass("active");
    // }

    // $scope.postIssue = function () {
    //     if ($scope.newIssueForm.$invalid)
    //         return;

    //     var promise = issuesSrv.postIssue($scope.newIssue.title, $scope.newIssue.issueBody, $scope.newIssue.priority, $scope.newIssue.status, $scope.newIssue.editedIssue);

    //     promise.then((issue) => {
    //         // remove "old" issue
    //         if (editedIssue != null) {
    //             var reomveIndex = $scope.issues.indexOf(editedIssue);
    //             if (reomveIndex > -1)
    //                 $scope.issues.splice(reomveIndex, 1);
    //         }

    //         // add "new" issue
    //         $scope.issues.unshift(issue);

    //         // open the issue just been updated/added (located first in the array)
    //         // $('#collapse' + 0).collapse("show");

    //         resetForm();

    //         $("#newIssueForm").modal("hide");
    //         $scope.editMode = true;
    //     }, (error) => {
    //         alert("Posting issue failed");
    //     });

    // }

    // // $scope.postIssueComment = function (index, issue, parent) {
    // //     var text = $scope.newComment[index];
    // //     if (!text) {
    // //         alert("Enter a comment text");
    // //         return;
    // //     }

    // //     issueCommentsSrv.createComment(text, issue).then((comment) => {
    // //         issue.commentsObject.comments.unshift(comment);
    // //         $scope.newComment[index] = "";
    // //         $('#' + parent + 'CollapseComment' + index).collapse("hide");
    // //     }, (error) => {
    // //         alert("Failed post comment to server. Please try again");
    // //     });
    // // }


    // // $scope.isCommitteeMember = function () {
    // //     return userSrv.isCommitteeMember();
    // // }

    // // $scope.canEditIssue = function (issue) {
    // //     canEditIssue = (issue.isMyIssue || userSrv.isCommitteeMember());
    // //     return canEditIssue;
    // // }
})