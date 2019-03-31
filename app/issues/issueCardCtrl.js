committeeApp.controller("issueCardCtrl", function ($scope, userSrv, issuesSrv, issueCommentsSrv) {
    // const issueStatus = {
    //     NEW: "New",
    //     IN_PROGRESS: "In progress",
    //     CLOSE: "Closed"
    // }
    // const issueUrgency = {
    //     URGENT: "1",
    //     IMPORTANT: "2",
    //     NORMAL: "3"
    // }

    // // trigger tooltip on hover only when data-toggle in use for other then tooltip
    // $('[rel="tooltip"]').tooltip({
    //     trigger: "hover"
    // });

    // $('.dropdown-menu').click(function (e) {
    //     e.stopPropagation();
    // });

    // $scope.issues = [];
    // $scope.newComment = [];
    $scope.newComment = "";
    // $scope.editMode = false;
    // let editedIssue = null;


    $scope.onIssueOpen = function (issue, index, parent) {
        // $scope.openIssue = issue.parseIssue.id;
        $scope.editMode = false;

        if (!$scope.toggleCard(issue))
            return;

        $scope.newComment = "";
        $('#' + parent + 'CollapseComment' + index).collapse("hide");

        if (!issue.wasRead) {
            var addIssuePromise = userSrv.addOpenedIssues(issue.parseIssue.id);
            addIssuePromise.then(wasAdded => {
                // if the unread filter is on, the issue will disapear when open it
                issue.wasRead = true;

                // open new read issue
                $scope.openReadIssue = issue;
            }, error => {

            });
        }


        if (!issue.commentsObject.wasLoaded) {
            var getCommentsPromise = issueCommentsSrv.getIssueComments(issue);
            getCommentsPromise.then(comments => {
                issue.commentsObject.wasLoaded = true;
                issue.commentsObject.comments = comments;
            }, error => {

            });
        }

    }

    $scope.editIssue = function (issue) {
        $scope.editedIssue.title = issue.title;
        $scope.editedIssue.issueBody = issue.details;
        $scope.editedIssue.priority = issue.priority;
        $scope.editedIssue.status = issue.status;
        $scope.editedIssue.oldIssue = issue;
        // $scope.editedIssue = {
        //     title: issue.title,
        //     issueBody: issue.details,
        //     priority: issue.priority,
        //     status: issue.status
        // };

        $scope.editMode = true;
        // editedIssue = issue;
        $scope.isReadOnly = !issue.isMyIssue;

        // $("#newIssueForm").modal("show");
    }

    $scope.deleteIssue = function (issue) {
        $scope.$parent.deleteIssue(issue);
    }
    // $scope.deleteIssue = function (issue, issuesArr) {
    //     issuesSrv.deleteIssue(issue).then(() => {

    //         issueCommentsSrv.deleteIssueComments(issue.commentsObject.comments).then(([successCounter, failCounter]) => {
    //             console.log(successCounter + " comments deleted and " + failCounter + " comments failed")
    //         }, (error) => {

    //         });

    //         var reomveIndex = issuesArr.indexOf(issue);
    //         if (reomveIndex > -1)
    //             issuesArr.splice(reomveIndex, 1);
    //     }, () => {
    //         alert("Failed delete issue from server. Please try again");
    //     });

    // }

    // $scope.newIssueOpen = function () {
    //     $scope.editMode = false;
    //     editedIssue = null;
    //     $scope.isReadOnly = false;
    //     resetForm();
    //     // priority Normal is default
    //     $("#priority > label:last-child").addClass("active");
    //     $scope.newIssue.priority = issueUrgency.NORMAL;
    //     $scope.newIssue.status = issueStatus.NEW;
    // }

    // function resetForm() {
    //     $scope.newIssue = {
    //         title: null,
    //         issueBody: null,
    //         priority: "",
    //         status: ""
    //     };

    //     $("#priority>label").removeClass("active");
    // }

    $scope.postIssue = function () {
        $scope.$parent.postIssue();

        // if ($scope.newIssueForm.$invalid)
        //     return;

        // var promise = issuesSrv.postIssue($scope.newIssue.title, $scope.newIssue.issueBody, $scope.newIssue.priority, $scope.newIssue.status, editedIssue);

        // promise.then((issue) => {
        //     // remove "old" issue
        //     if (editedIssue != null) {
        //         var reomveIndex = $scope.issues.indexOf(editedIssue);
        //         if (reomveIndex > -1)
        //             $scope.issues.splice(reomveIndex, 1);
        //     }

        //     // add "new" issue
        //     $scope.issues.unshift(issue);

        //     // open the issue just been updated/added (located first in the array)
        //     // $('#collapse' + 0).collapse("show");

        //     resetForm();

        //     $("#newIssueForm").modal("hide");
        // }, (error) => {
        //     alert("Posting issue failed");
        // });

    }

    $scope.clearComment = function () {
        $scope.newComment = "";
    }

    $scope.postIssueComment = function (index, issue, parent) {
        var text = $scope.newComment;
        if ($scope.$parent.postIssueComment(text, issue, '#' + parent + 'CollapseComment' + index)) {
            $scope.newComment = "";
        }
        // var text = $scope.newComment;
        // if (!text) {
        //     alert("Enter a comment text");
        //     return;
        // }

        // issueCommentsSrv.createComment(text, issue).then((comment) => {
        //     issue.commentsObject.comments.unshift(comment);
        //     $scope.newComment = "";
        //     $('#' + parent + 'CollapseComment' + index).collapse("hide");
        // }, (error) => {
        //     alert("Failed post comment to server. Please try again");
        // });
    }
    // $scope.postIssueComment = function (index, issue, parent) {
    //     var text = $scope.newComment;
    //     if (!text) {
    //         alert("Enter a comment text");
    //         return;
    //     }

    //     issueCommentsSrv.createComment(text, issue).then((comment) => {
    //         issue.commentsObject.comments.unshift(comment);
    //         $scope.newComment = "";
    //         $('#' + parent + 'CollapseComment' + index).collapse("hide");
    //     }, (error) => {
    //         alert("Failed post comment to server. Please try again");
    //     });
    // }


    // $scope.isCommitteeMember = function () {
    //     return userSrv.isCommitteeMember();
    // }

    $scope.canEditIssue = function (issue) {
        canEditIssue = (issue.isMyIssue || userSrv.isCommitteeMember());
        return canEditIssue;
    }
})