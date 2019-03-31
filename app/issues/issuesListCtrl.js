committeeApp.controller("issuesListCtrl", function ($scope, issuesSrv, issueCommentsSrv) {

    if (!$scope.isDashboard) {
        $scope.isDashboard = false;
    }

    $scope.resetCounter = 0;

    $scope.newIssueOpen = function () {
        $scope.editMode = false;
        $scope.newIssue.oldIssue = null;
        $scope.isReadOnly = false;
        resetForm();
    }

    function resetForm() {
        $scope.newIssue.title = null;
        $scope.newIssue.issueBody = null;
        $scope.newIssue.priority = issuesSrv.issueUrgency.NORMAL;
        $scope.newIssue.status = issuesSrv.issueStatus.NEW;

        $scope.resetCounter++;
    }

    $scope.postIssue = function () {
        if ($scope.newIssueForm.$invalid)
            return;

        var promise = issuesSrv.postIssue($scope.newIssue.title, $scope.newIssue.issueBody, $scope.newIssue.priority, $scope.newIssue.status, $scope.newIssue.oldIssue);

        promise.then((issue) => {
            // remove "old" issue
            if ($scope.newIssue.oldIssue != null) {
                var reomveIndex = $scope.issuesArray.indexOf($scope.newIssue.oldIssue);
                if (reomveIndex > -1)
                    $scope.issuesArray.splice(reomveIndex, 1);
            }

            // add "new" issue
            $scope.issuesArray.unshift(issue);

            resetForm();

            $("#newIssueForm").modal("hide");
            $scope.editMode = true;
        }, (error) => {
            alert("Posting issue failed");
        });

    }



    $scope.openIssueId = "";
    // this is not an array because user might add new item and then the inxeding might change
    var isOpenIssue = {};
    var prevIssueIx = null;

    $scope.toggleCard = function (issue) {
        if (!isOpenIssue.hasOwnProperty(issue.parseIssue.id))
            isOpenIssue[issue.parseIssue.id] = false;

        isOpenIssue[issue.parseIssue.id] = !isOpenIssue[issue.parseIssue.id];

        if (prevIssueIx != null && prevIssueIx != issue.parseIssue.id)
            isOpenIssue[prevIssueIx] = false;

        prevIssueIx = issue.parseIssue.id;

        return isOpenIssue[issue.parseIssue.id];
    }

    $scope.deleteIssue = function (issue) {
        issuesSrv.deleteIssue(issue).then(() => {

            issueCommentsSrv.deleteIssueComments(issue.commentsObject.comments).then(([successCounter, failCounter]) => {
                console.log(successCounter + " comments deleted and " + failCounter + " comments failed")
            }, (error) => {

            });

            var reomveIndex = $scope.issuesArray.indexOf(issue);
            if (reomveIndex > -1)
                $scope.issuesArray.splice(reomveIndex, 1);
        }, () => {
            alert("Failed delete issue from server. Please try again");
        });

    }

    $scope.postIssueComment = function (text, issue, collapseMe) {
        if (!text) {
            alert("Enter a comment text");
            return;
        }

        issueCommentsSrv.createComment(text, issue).then((comment) => {
            issue.commentsObject.comments.unshift(comment);
            $(collapseMe).collapse("hide");
        }, (error) => {
            alert("Failed post comment to server. Please try again");
        });
    }

    $scope.closeModal = function () {
        $scope.editMode = true;
    }
});