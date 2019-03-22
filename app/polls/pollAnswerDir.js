committeeApp.directive("pollAnswer", ["$timeout", function ($timeout) {

    function link(scope, element, attrs) {
        var animatedElem = element.find('.animated');
        var timer;

        function updateElement() {
            // $timeout.cancel(timeoutId);
            animatedElem.width(attrs.answerPcnt + "%");
        }

        // on expanding collapse set the proper width
        scope.$watch("isOpened", setResultBarWidth);
            // function () {
            //     //note that, don't use angular $timeout it may cause recursive stack
            //     setTimeout(function () {
            //         if (!scope.isOpened || !scope.showResult) {
            //             animatedElem.width("0%");
            //             return;

            //         }

            //         timer = $timeout(function () {
            //             updateElement(); // update DOM
            //         }, 250);

            //     }, 0)
            // });

        // on expanding collapse set the proper width
        scope.$watch("pollAnswerData.optionVotesPcnt", setResultBarWidth);

        function setResultBarWidth() {
            //note that, don't use angular $timeout it may cause recursive stack
            setTimeout(function () {
                if (!scope.isOpened || !scope.showResult) {
                    animatedElem.width("0%");
                    return;
                }

                timer = $timeout(function () {
                    updateElement(); // update DOM
                }, 250);

            }, 0)
        };

        scope.$on(
            "$destroy",
            function (event) {
                $timeout.cancel(timer);
            }
        );
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