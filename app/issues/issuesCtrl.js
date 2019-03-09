committeeApp.controller("issuesCtrl", function ($scope, $location, userSrv, issuesSrv, issueCommentsSrv) {
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

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    // trigger tooltip on hover only
    $('[rel="tooltip"]').tooltip({
        trigger: "hover"
    });

    let unreadIssues = 0;
    let openIssues = 0;
    let myIssues = 0;
    $scope.issues = [];
    $scope.newComment = []
    $scope.editMode = false;

    issuesSrv.getActiveUserIssues().then((issues) => {
        // resetCounters();
        $scope.issues = issues;

    }).catch((err) => {
        $log.error(err);
    });

    $scope.queryFilter = function (issue, index) {
        // reset the unread counter on first object being checked in filter
        if (index === 0)
            resetCounters();

        if (!$scope.query) {
            // show only important issue
            if ((!$scope.importance || issue.priority === issueUrgency.URGENT) &&
                // show only unread issue
                (!$scope.unread || !issue.wasRead) &&
                // show only my issue
                (!$scope.myIssues || !issue.isMyIssue)) {
                checkIssueCounters(issue);
                return true;
            } else {
                return false;
            }
        } else if ((issue.title.toLowerCase().includes($scope.query.toLowerCase()) ||
                issue.details.toLowerCase().includes($scope.query.toLowerCase())) &&
            // show only important issue
            (!$scope.importance || issue.priority === issueUrgency.URGENT) &&
            // show only unread issue
            (!$scope.unread || !issue.isMyIssue)) {
            checkIssueCounters(issue);
            return true;
        } else {
            return false;
        }
    }

    function checkIssueCounters(issue) {
        if (!issue.wasRead)
            unreadIssues++;
        if (issue.status != issueStatus.CLOSE)
            openIssues++;
        if (issue.createdBy === userSrv.getActiveUser().username)
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

    $scope.onIssueOpen = function (issue, index) {
        $scope.newComment[index] = "";
        $('#collapseComment' + index).collapse("hide");

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

    $scope.editIssue = function (issue) {
        $scope.newIssue = {
            title: issue.title,
            issueBody: issue.details,
            priority: issue.priority,
            status: issue.status
        };

        $("#priority > label").removeClass("active");
        if ($scope.newIssue.priority === issueUrgency.URGENT)
            $("#priority > label:first-child").addClass("active");
        else if ($scope.newIssue.priority === issueUrgency.IMPORTANT)
            $("#priority > label:nth-child(2)").removeClass("active");
        else
            $("#priority > label:last-child").addClass("active");
        $scope.editedIssue = issue;

        $scope.editMode = true;
        $("#newIssueForm").modal("show");
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

    $scope.newIssueOpen = function () {
        $scope.editMode = false;
        $scope.editedIssue = null
        resetForm();
        // priority Normal is default
        $("#priority > label:last-child").addClass("active");
        $scope.newIssue.priority = issueUrgency.NORMAL;
        $scope.newIssue.status = issueStatus.NEW; 
    }

    function resetForm() {
        $scope.newIssue = {
            title: null,
            issueBody: null,
            priority: "",
            status: ""
        };

        $("#priority>label").removeClass("active");
    }

    $scope.postIssue = function () {
        if ($scope.newIssueForm.$invalid)
            return;

        var promise = issuesSrv.postIssue($scope.newIssue.title, $scope.newIssue.issueBody, $scope.newIssue.priority, $scope.newIssue.status, $scope.editedIssue);

        promise.then((issue) => {
            // remove "old" issue
            if ($scope.editedIssue != null) {
                var reomveIndex = $scope.issues.indexOf($scope.editedIssue);
                if (reomveIndex > -1)
                    $scope.issues.splice(reomveIndex, 1);
            }

            // add "new" issue
            $scope.issues.unshift(issue);

            // open the issue just been updated/added (located first in the array)
            // $('#collapse' + 0).collapse("show");

            resetForm();

            $("#newIssueForm").modal("hide");
        }, (error) => {
            alert("Posting issue failed");
        });

    }

    $scope.postComment = function (index, issue) {
        var text = $scope.newComment[index];
        if (!text) {
            alert("Enter a comment text");
            return;
        }

        issueCommentsSrv.createComment(text, issue).then((comment) => {
            issue.commentsObject.comments.unshift(comment);
            $scope.newComment[index] = "";
            $('#collapseComment' + index).collapse("hide");
        }, (error) => {
            alert("Failed post comment to server. Please try again");
        });
    }


    $scope.isCommitteeMember = function () {
        return userSrv.isCommitteeMember();
    }
})