committeeApp.controller("issueCardCtrl", function ($scope, userSrv, issuesSrv, issueCommentsSrv) {
    // // trigger tooltip on hover only when data-toggle in use for other then tooltip
    // $('[rel="tooltip"]').tooltip({
    //     trigger: "hover"
    // });

    // $('.dropdown-menu').click(function (e) {
    //     e.stopPropagation();
    // });

    $scope.newComment = "";

    $scope.onIssueOpen = function (issue, index, parent) {
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

        $scope.editMode = true;
        $scope.isReadOnly = !issue.isMyIssue;
    }

    $scope.deleteIssue = function (issue) {
        $scope.$parent.deleteIssue(issue);
    }
    $scope.postIssue = function () {
        $scope.$parent.postIssue();
    }

    $scope.clearComment = function () {
        $scope.newComment = "";
    }

    $scope.postIssueComment = function (index, issue, parent) {
        var text = $scope.newComment;
        if ($scope.$parent.postIssueComment(text, issue, '#' + parent + 'CollapseComment' + index)) {
            $scope.newComment = "";
        }
    }

    $scope.canEditIssue = function (issue) {
        if (!issue) {
            return false;
        }

        canEditIssue = (issue.isMyIssue || userSrv.isCommitteeMember());
        return canEditIssue;
    }
})