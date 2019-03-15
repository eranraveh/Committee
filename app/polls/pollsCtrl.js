committeeApp.controller("pollsCtrl", function ($scope, $location, userSrv, pollsSrv, $timeout) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    // trigger tooltip on hover only when data-toggle in use for other then tooltip
    $('[rel="tooltip"]').tooltip({
        trigger: "hover"
    });

    $scope.polls = [];
    $scope.editMode = false;
    let unvoted = 0;

    pollsSrv.getPolls().then((polls) => {
        unvoted = 0;
        $scope.polls = polls;

    }).catch((err) => {
        console.error(err);
    });

    $scope.queryFilter = function (poll, index) {
        if (index === 0) {
            unread = 0;
        }

        if (!$scope.query) {
            // show only important poll
            if ((!$scope.importance || poll.priority === "1") &&
                // show only unread poll
                (!$scope.unread || !poll.wasRead)) {
                isPollUnread(poll);
                return true;
            } else {
                return false;
            }
        } else if ((poll.title.toLowerCase().includes($scope.query.toLowerCase()) ||
                poll.details.toLowerCase().includes($scope.query.toLowerCase())) &&
            // show only active polls
            (!$scope.isActive || poll.isActive) &&
            // show only active polls
            (!$scope.isEnded || !poll.isActive) &&
            // show only unread poll
            (!$scope.unvoted || !poll.wasVoted)) {
            isPollUnvoted(poll);
            return true;
        } else {
            return false;
        }
    }

    function isPollUnvoted(poll) {
        if (!poll.wasVoted)
            unvoted++;
    }

    $scope.getUnvotedPollsCount = () => {
        return unvoted;
    }

    $scope.newPollOpen = function () {
        $scope.editMode = false;
        $scope.editedPoll = null
        resetForm();
    }

    function resetForm() {
        $scope.newPoll = {
            title: null,
            details: null,
            dueDate: false,
            options: ["", ""] // initialize with at least two options
        };

    }

    $scope.addNewOption = () => {
        $scope.newPoll.options.push("");
    }

    $scope.createPoll = () => {
        if ($scope.newPollForm.$invalid)
            return;

        var removeEmptyOptions = $scope.newPoll.options.filter((option) => {
            return option;
        });
        var promise = pollsSrv.createPoll($scope.newPoll.title, $scope.newPoll.details, $scope.newPoll.dueDate, removeEmptyOptions, $scope.editedPoll);

        promise.then((poll) => {
            // remove "old" poll
            if ($scope.editedPoll != null) {
                var reomveIndex = $scope.polls.indexOf($scope.editedPoll);
                if (reomveIndex > -1)
                    $scope.polls.splice(reomveIndex, 1);
            }

            // add "new" poll
            $scope.polls.unshift(poll);

            // open the poll just been updated/added (located first in the array)
            // $('#collapse' + 0).collapse("show");

            resetForm();

            $("#newPollForm").modal("hide");
        }, (error) => {
            alert("Posting poll failed");
        });
    }
    // $timeout(function () {
    //     var result = $(".poll-answer-container>button.selected>.poll-result>.animated");
    //     for (let index = 0; index < result.length; index++) {
    //         const element = angular.element(result[index]);

    //         angular.element(element).css('width', '86%');
    //     }
    //     var result = $(".poll-answer-container>button:not(.selected)>.poll-result>.animated");
    //     for (let index = 0; index < result.length; index++) {
    //         const element = angular.element(result[index]);

    //         angular.element(element).css('width', '14%');
    //     }
    // }, 1000);


    $scope.onVote = function (event) {
        var result = $(".poll-answer-container>button");
        for (let index = 0; index < result.length; index++) {
            const element = angular.element(result[index]);

            angular.element(element).addClass("poll-voted");
        }

        $(event.currentTarget).addClass("selected");

        $(".poll-answer-container>button.selected>.poll-result>.animated").width("86%");
        $(".poll-answer-container>button.selected>.poll-result>.count-bar-number").text("86%");

        $(".poll-answer-container>button:not(.selected)>.poll-result>.animated").width("14%");
        $(".poll-answer-container>button:not(.selected)>.poll-result>.count-bar-number").text("14%");
    }

    $scope.isCommitteeMember = function () {
        return userSrv.isCommitteeMember();
    }
});