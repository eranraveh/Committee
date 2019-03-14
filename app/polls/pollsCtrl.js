committeeApp.controller("pollsCtrl", function ($scope, $location, userSrv, $timeout) {

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
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

        // var result = $(".poll-answer-container>button.selected>.poll-result>.animated");
        // for (let index = 0; index < result.length; index++) {
        //     const element = angular.element(result[index]);

        //     angular.element(element).css('width', '86%');

        $(".poll-answer-container>button.selected>.poll-result>.animated").width("86%");
        $(".poll-answer-container>button.selected>.poll-result>.count-bar-number").text("86%");

        // }

        $(".poll-answer-container>button:not(.selected)>.poll-result>.animated").width("14%");
        $(".poll-answer-container>button:not(.selected)>.poll-result>.count-bar-number").text("14%");

        // var result = $(".poll-answer-container>button:not(.selected)>.poll-result>.animated");
        // for (let index = 0; index < result.length; index++) {
        //     const element = angular.element(result[index]);

        //     angular.element(element).css('width', '14%');
        //     // count - bar - number
        // }
    }
    // var result = $(".poll-voted");
    // Array.prototype.forEach.call(result, element => {
    // // result.forEach(element => {
    //     if (element.hasClass("selected"))
    //         element.find(".animated").css('width', '86%');
    //     else
    //         element.find(".animated").css('width', '14%');
    // });

    // var result = document.getElementsByClassName("animated");
    // angular.element(result[0]).css('width', '86%');
    // }, 1000);
});