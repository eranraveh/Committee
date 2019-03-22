committeeApp.controller("dashboardCommitteeCtrl", function ($scope, $location, userSrv, issuesSrv, issueCommentsSrv, pollsSrv, messagesSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    const issueStatus = {
        NEW: "New",
        IN_PROGRESS: "In progress",
        CLOSE: "Closed"
    }

    // descending order
    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    $scope.issuesSort = "-postingDate";
    $scope.pollsSort = "dueDate";
    $scope.messagesSort = "postingDate";

    function loadData() {
        $scope.newIssues = [];
        issuesSrv.getIssues().then((issues) => {
            $scope.newIssues = issues.filter(issue => !issue.wasRead);

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
    // $scope.newIssueQueryFilter = function (issue) {
    //     return (!issue.wasRead);
    // }

    // $scope.openOldIssueQueryFilter = function (issue) {
    //     return (issue.status != issueStatus.CLOSE && issue.postingDate < oneWeekAgo);
    // }

    $scope.newComment = [];
    $scope.onIssueOpen = function (issue, index, parent) {
        $scope.newComment[index] = "";
        $('#' + parent + 'CollapseComment' + index).collapse("hide");

        if (!issue.wasRead) {
            var addIssuePromise = userSrv.addOpenedIssues(issue.parseIssue.id);
            addIssuePromise.then(wasAdded => {
                issue.wasRead = true;
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

    $scope.postIssueComment = function (index, issue, parent) {
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

    // $scope.canEditIssue = function () {
    //     return false;
    // }
    // =============================================
    // issues code - end
    // =============================================


    // =============================================
    // polls code - start
    // =============================================
    // $scope.openPollQueryFilter = function (poll) {
    //     return (poll.isActive);
    // }

    $scope.endPoll = function (poll) {
        var promise = pollsSrv.updatePoll(new Date(), true, poll);

        promise.then((poll) => {
            createMessage(poll);
        }, (error) => {
            alert("Posting poll failed");
        });
    }

    function createMessage(poll) {
        var title = `The poll '${poll.title}' isClosed`;
        var details = `The poll '${poll.title}' isClosed.\nThe question was:'${poll.details}'.\nThe chosen option is:'${getChosenOption(poll.votes)}'\n\nThank you for voting`;

        messagesSrv.postMessage(title, details, false, null);
    }

    // hide edit button on dashboard
    $scope.isDashboard = true;

    // this is not an array because user might add new item and then the inxeding might change
    var isOpenPoll = {};
    $scope.isOpen = function (poll, parent) {
        if (!isOpenPoll.hasOwnProperty(parent))
            isOpenPoll[parent] = {};
        if (!isOpenPoll[parent].hasOwnProperty(poll.parsePoll.id))
            isOpenPoll[parent][poll.parsePoll.id] = false;

        return isOpenPoll[parent][poll.parsePoll.id];
    }
    var prevPollIx = {};
    $scope.onPollOpen = function (poll, parent) {
        if (!prevPollIx.hasOwnProperty(parent))
            prevPollIx[parent] = null;

        isOpenPoll[parent][poll.parsePoll.id] = !isOpenPoll[parent][poll.parsePoll.id];

        if (prevPollIx[parent] != null && prevPollIx[parent] != poll.parsePoll.id)
            isOpenPoll[parent][prevPollIx[parent]] = false;
        prevPollIx[parent] = poll.parsePoll.id;

        if (poll.isActive || poll.sawResult) {
            return
        }

        // set when user see result of closed poll
        var addPollPromise = userSrv.addSeenPoll(poll.parsePoll.id);
        addPollPromise.then(wasAdded => {
            // if the unread filter is on, the Poll will disapear when open it
            if (wasAdded) {
                poll.sawResult = true;
            }
        }, error => {

        });
    }

    $scope.onVote = function (poll, answer) {
        // add vote to db
        var currentUser = userSrv.getActiveUser();
        answer.optionVoters.push(currentUser.id);

        pollsSrv.addVote(poll).then(() => {

        }, (error) => {

        });
    }

    $scope.isCommitteeMember = function () {
        return true;
    }
    // =============================================
    // polls code - end
    // =============================================
});