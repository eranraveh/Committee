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
      unvoted = 0;
    }

    if (!$scope.query) {
      // show only important poll
      if ((!$scope.isActive || poll.isActive) &&
        // show only done polls
        (!$scope.isEnded || !poll.isActive) &&
        // show only unvoted poll
        (!$scope.unvoted || !poll.wasVoted)) {
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
  resetForm();

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

  $scope.onPollOpen = function (poll) {
    if (!poll.wasVoted)
      return;

    setVotingResults(poll);
  }

  $scope.onVote = function (poll, answer, event) {

    // add vote to db
    var currentUser = userSrv.getActiveUser();
    var optionIx = poll.options.indexOf(answer);
    if (!poll.votes[optionIx])
      poll.votes[optionIx] = [];
    poll.votes[optionIx].push(currentUser.id)

    pollsSrv.addVote(poll).then(() => {

    }, (error) => {

    });

    setVotingResults(poll, event);
  }

  function setVotingResults(poll, event = null) {
    // calc all options voting percentage
    var votesPcnt = [];
    var totalVotes = poll.votes.reduce((accumulator, optionVotes) => accumulator + optionVotes.length, 0);
    for (let index = 0; index < poll.options.length; index++) {
      var pollVotes = poll.votes[index];
      if (pollVotes === undefined)
        votesPcnt[index] = 0;
      else
        votesPcnt[index] = Math.round(pollVotes.length / totalVotes * 100);
    }

    // mark poll as voted
    var result = $(".poll-answer-container>button");
    for (let index = 0; index < result.length; index++) {
      const element = angular.element(result[index]);

      angular.element(element).addClass("poll-voted");
      // mark selected option
      if (index === poll.optionVoted)
        angular.element(element).addClass("selected");
    }

    // mark selected option
    if (event != null)
      $(event.currentTarget).addClass("selected");

    // set bars width
    var barsDivs = $(".poll-answer-container>button>.poll-result>.animated");
    for (let index = 0; index < barsDivs.length; index++) {
      const bar = barsDivs[index];
      bar.style.width = votesPcnt[index] + "%";
    }
    // set bars text
    var barsDivs = $(".poll-answer-container>button>.poll-result>.count-bar-number");
    for (let index = 0; index < barsDivs.length; index++) {
      var bar = barsDivs[index];
      bar.innerHTML = votesPcnt[index] + "%";
    }

    // $(".poll-answer-container>button.selected>.poll-result>.animated").width("86%");
    // $(".poll-answer-container>button.selected>.poll-result>.count-bar-number").text("86%");

    // $(".poll-answer-container>button:not(.selected)>.poll-result>.animated").width("14%");
    // $(".poll-answer-container>button:not(.selected)>.poll-result>.count-bar-number").text("14%");
  }

  $scope.editPoll = function (poll) {
    $scope.newPoll = {
        title: poll.title,
        details: poll.details,
        dueDate: poll.dueDate
    };

    if ($scope.newMessage.priority === "high") {
        $("#priority > label:first-child").addClass("active");
        $("#priority > label:last-child").removeClass("active");
    } else {
        $("#priority > label:first-child").removeClass("active");
        $("#priority > label:last-child").addClass("active");
    }
    $scope.editedMessage = message;

    $scope.editMode = true;
    $("#newMessageForm").modal("show");
}

  $scope.isCommitteeMember = function () {
    return userSrv.isCommitteeMember();
  }

  $scope.dateOptions = {
    customClass: getDayClass,
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
    customClass: getDayClass,
    minDate: new Date()
  };



  $scope.toggleMin = function () {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.setDate = function (year, month, day) {
    $scope.newPoll.dueDate = new Date(year, month, day);
  };


  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [{
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }
});