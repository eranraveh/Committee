committeeApp.controller("dashboardCommitteeCtrl", function ($scope, $location, userSrv, issuesSrv, issueCommentsSrv, pollsSrv) {

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
    $scope.pollsSort = "dueDate";

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

        $scope.openPolls = [];
        pollsSrv.getPolls().then((polls) => {
            $scope.openPolls = polls.filter(poll => poll.isActive);

        }).catch((err) => {
            console.error(err);
        });
    }

    loadData();

    // =============================================
    // issues code - start
    // =============================================
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


    // $scope.isCommitteeMember = function () {
    //     return userSrv.isCommitteeMember();
    // }

    $scope.canEditIssue = function () {
        return false;
    }
    // =============================================
    // issues code - end
    // =============================================


    // =============================================
    // polls code - start
    // =============================================
    $scope.endPoll = function (poll) {
        var promise = pollsSrv.updatePoll(new Date(), poll);

        promise.then((poll) => {}, (error) => {
            alert("Posting poll failed");
        });

    }



    $scope.getIndex = function (poll) {
        return $scope.openPolls.indexOf(poll);
    }
    // hide edit button on dashboard
    $scope.isDashboard = true;

    var isOpenPoll = [];
    $scope.isOpen = function (poll) {
        var ix = $scope.openPolls.indexOf(poll)
        if (isOpenPoll[ix] == undefined)
            isOpenPoll[ix] = false;

        return isOpenPoll[ix];
    }

    var prevPollIx = -1;
    $scope.onPollOpen = function (poll) {
        var ix = $scope.openPolls.indexOf(poll);
        // if (isOpenPoll[ix] == undefined)
        //     isOpenPoll[ix] = false;
        isOpenPoll[ix] = !isOpenPoll[ix];

        if (prevPollIx > -1 && prevPollIx != ix)
            isOpenPoll[prevPollIx] = false;
        prevPollIx = ix;
    }

    $scope.onVote = function (poll, answer) {
        // add vote to db
        var currentUser = userSrv.getActiveUser();
        var optionIx = poll.options.indexOf(answer.optionText);
        poll.votes[optionIx].optionVoters.push(currentUser.id)

        pollsSrv.addVote(poll).then(() => {

        }, (error) => {

        });
    }

    // =============================================
    // polls code - end
    // =============================================
});