committeeApp.directive("pollAnswer", ["$timeout", function ($timeout) {

    function link(scope, element, attrs) {
        var animatedElem = element.find('.animated');

        function updateElement() {
            $timeout.cancel(timeoutId);
            animatedElem.width(attrs.answerPcnt + "%");
        }

        // on expanding collapse set the proper width
        scope.$watch("isOpened",
            function () {
                //note that, don't use angular $timeout it may cause recursive stack
                setTimeout(function () {
                    if (!scope.isOpened || !scope.showResult) {
                        animatedElem.width("0%");
                        return;

                    }

                    timeoutId = $timeout(function () {
                        updateElement(); // update DOM
                    }, 250);

                }, 0)
            });
    }

    return {
        templateUrl: "app/polls/pollAnswer.html",
        restrcit: "E",
        scope: {
            isOpened: "=",
            pollAnswerData: "=",
            pollData: "=",
            isSelectedAnswer: "=",
            showResult: "=",
            vote: "&"
        },
        link: link
    }
}]);