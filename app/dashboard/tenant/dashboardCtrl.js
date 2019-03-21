committeeApp.controller("dashboardTenantCtrl", function ($scope, $location, userSrv, issuesSrv, issueCommentsSrv, pollsSrv, messagesSrv, messageCommentsSrv) {

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
        $scope.resolvedIssues = [];
        issuesSrv.getIssues().then((issues) => {
            $scope.newIssues = issues.filter(issue => !issue.wasRead);

            $scope.resolvedIssues = issues.filter(issue => issue.status == issueStatus.CLOSE && issue.postingDate < oneWeekAgo);

        }).catch((err) => {
            console.error(err);
        });

        $scope.openPolls = [];
        $scope.closedPolls = [];
        pollsSrv.getPolls().then((polls) => {
            $scope.openPolls = polls.filter(poll => poll.isActive && !poll.wasVoted);
            $scope.closedPolls = polls.filter(poll => !poll.isActive && !poll.sawResult);

        }).catch((err) => {
            console.error(err);
        });

        $scope.newMessages = [];
        messagesSrv.getMessages().then((messages) => {
            unread = 0;
            $scope.newMessages = messages.filter(msg => !msg.wasRead);

        }).catch((err) => {
            $log.error(err);
        });

    }

    loadData();

    // =============================================
    // issues code - start
    // =============================================
    // $scope.newIssueQueryFilter = function (issue) {
    //     return (!issue.wasRead);
    // }

    // $scope.resolvedIssueQueryFilter = function (issue) {
    //     return (issue.status == issueStatus.CLOSE && issue.postingDate < oneWeekAgo);
    // }

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
    //     return (poll.isActive && !poll.wasVoted);
    // }

    // $scope.closedPollQueryFilter = function (poll) {
    //     return (!poll.isActive && !poll.sawResult);
    // }

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

        // set poll as result been see by the user
        var addPollPromise = userSrv.addSeenPoll(poll.parsePoll.id);
        addPollPromise.then(wasAdded => {
            // if the unread filter is on, the Poll will disapear when open it
            if (wasAdded) {
                poll.sawResult = true;
            }
        }, error => {

        });
    }

    // var isOpenPoll = {};
    // $scope.isOpen = function (poll, parent) {
    //     if (!isOpenPoll.hasOwnProperty(parent))
    //         isOpenPoll[parent] = [];

    //     var ix;
    //     if (parent === "openPollsAccordion")
    //         ix = $scope.openPolls.indexOf(poll);
    //     else
    //         ix = $scope.closedPolls.indexOf(poll);

    //     if (isOpenPoll[parent][ix] == undefined)
    //         isOpenPoll[parent][ix] = false;

    //     return isOpenPoll[parent][ix];
    // }

    // var prevPollIx = {};
    // $scope.onPollOpen = function (poll, parent) {
    //     if (!prevPollIx.hasOwnProperty(parent))
    //         prevPollIx[parent] = -1;

    //     var ix;
    //     if (parent === "openPollsAccordion")
    //         ix = $scope.openPolls.indexOf(poll);
    //     else
    //         ix = $scope.closedPolls.indexOf(poll);

    //     isOpenPoll[parent][ix] = !isOpenPoll[parent][ix];

    //     if (prevPollIx[parent] > -1 && prevPollIx[parent] != ix)
    //         isOpenPoll[parent][prevPollIx[parent]] = false;
    //     prevPollIx[parent] = ix;
    // }

    // var isOpenPoll = [];
    // $scope.isOpen = function (poll) {
    //     var ix = $scope.openPolls.indexOf(poll)
    //     if (isOpenPoll[ix] == undefined)
    //         isOpenPoll[ix] = false;

    //     return isOpenPoll[ix];
    // }

    // var prevPollIx = -1;
    // $scope.onPollOpen = function (poll) {
    //     var ix = $scope.openPolls.indexOf(poll);
    //     isOpenPoll[ix] = !isOpenPoll[ix];

    //     if (prevPollIx > -1 && prevPollIx != ix)
    //         isOpenPoll[prevPollIx] = false;
    //     prevPollIx = ix;
    // }

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


    // =============================================
    // messages code - start
    // =============================================
    // $scope.msgQueryFilter = function (message) {
    //     return (!message.wasRead);
    // }

    $scope.onMessageOpen = function (message, index, parent) {
        $scope.newComment[index] = "";
        $('#' + parent + 'CollapseComment' + index).collapse("hide");

        if (!message.wasRead) {
            var addMessagePromise = userSrv.addOpenedMessages(message.parseMessage.id);
            addMessagePromise.then(wasAdded => {
                if (wasAdded) {
                    message.wasRead = true;
                }
            }, error => {

            });
        };

        if (!message.commentsObject.wasLoaded) {
            var getCommentsPromise = messageCommentsSrv.getMessageComments(message);
            getCommentsPromise.then(comments => {
                message.commentsObject.wasLoaded = true;
                message.commentsObject.comments = comments;
            }, error => {

            });
        }
    }

    $scope.postMsgComment = function (index, message, parent) {
        var text = $scope.newComment[index];
        if (!text) {
            alert("Enter a comment text");
            return;
        }

        messageCommentsSrv.createComment(text, message).then((comment) => {
            message.commentsObject.comments.unshift(comment);
            $scope.newComment[index] = "";
            $('#' + parent + 'CollapseComment' + index).collapse("hide");
        }, (error) => {
            alert("Failed post comment to server. Please try again");
        });
    }

    $scope.isCommitteeMember = function () {
        return false;
    }
    // =============================================
    // messages code - end
    // =============================================

});