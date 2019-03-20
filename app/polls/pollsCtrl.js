committeeApp.controller("pollsCtrl", function ($scope, $location, userSrv, pollsSrv) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    // ???????
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
            unvoted = 0;
        }

        if (!$scope.query) {
            // show only important poll
            if ((!$scope.isActive || poll.isActive) &&
                // show only done polls
                (!$scope.isEnded || !poll.isActive) &&
                // show only unvoted poll
                (!$scope.isUnvoted || !poll.wasVoted)) {
                isPollUnvoted(poll);
                return true;
            } else {
                return false;
            }
        } else if ((poll.title.toLowerCase().includes($scope.query.toLowerCase()) ||
                poll.details.toLowerCase().includes($scope.query.toLowerCase())) &&
            // show only active polls
            (!$scope.isActive || poll.isActive) &&
            // show only done polls
            (!$scope.isEnded || !poll.isActive) &&
            // show only unvoted poll
            (!$scope.isUnvoted || !poll.wasVoted)) {
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

        $scope.dateOptions.minDate = new Date()
    }

    function resetForm() {
        $scope.newPoll = {
            title: null,
            details: null,
            dueDate: getWeekFromNow(),
            options: ["", ""] // initialize with at least two options
        };

    }
    resetForm();

    function getWeekFromNow() {
        var dt = new Date();
        dt.setDate(dt.getDate() + 7);

        return dt;
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

            resetForm();

            $("#newPollForm").modal("hide");
        }, (error) => {
            alert("Posting poll failed");
        });
    }

    $scope.updatePoll = () => {
        if ($scope.newPollForm.$invalid)
            return;

        var promise = pollsSrv.updatePoll($scope.newPoll.dueDate, $scope.editedPoll);

        promise.then((poll) => {
            resetForm();

            $("#newPollForm").modal("hide");
        }, (error) => {
            alert("Posting poll failed");
        });
    }

    $scope.endPoll = function (poll) {
        var promise = pollsSrv.updatePoll(new Date(), poll);

        promise.then((poll) => {}, (error) => {
            alert("Posting poll failed");
        });

    }

    var isOpenPoll = [];
    $scope.isOpen = function (poll) {
        var ix = $scope.polls.indexOf(poll)
        if (isOpenPoll[ix] == undefined)
            isOpenPoll[ix] = false;

        return isOpenPoll[ix];
    }

    var prevPollIx = -1;
    $scope.onPollOpen = function (poll) {
        var ix = $scope.polls.indexOf(poll);
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

    $scope.editPoll = function (poll) {
        $scope.newPoll = {
            title: poll.title,
            details: poll.details,
            dueDate: poll.dueDate,
            options: poll.options
        };

        $scope.editedPoll = poll;

        $scope.dateOptions.minDate = new Date()

        $scope.editMode = true;
        $("#newPollForm").modal("show");
    }

    $scope.isCommitteeMember = function () {
        return userSrv.isCommitteeMember();
    }

    $scope.dateOptions = {
        // customClass: getDayClass,
        minDate: new Date(),
        showWeeks: false
    };

    $scope.dtPicker = {
        opened: false
    };

    $scope.openDtPicker = function () {
        $scope.dtPicker.opened = true;
    };

    $scope.today = function () {
        $scope.newPoll.dueDate = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.newPoll.dueDate = null;
    };

    $scope.inlineOptions = {
        // customClass: getDayClass,
        minDate: new Date()
    };



    $scope.toggleMin = function () {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.setDate = function (year, month, day) {
        $scope.newPoll.dueDate = new Date(year, month, day);
    };

});