committeeApp.directive("pollAnswer", ["$timeout", function ($timeout) {

    function link(scope, element, attrs) {
        // if (attrs.showResult === "false")
        //     return;

        // // start the UI update process; save the timeoutId for canceling
        // timeoutId = $interval(function () {
        //     updateElement(); // update DOM
        // }, 1000);

        // var animatedElem = element[0].getElementsByClassName('animated');
        // // var animatedElem = element[0].querySelector('.animate');

        // // animatedElem[0].css("width", attrs.answerPcnt);
        // animatedElem[0].style.width = attrs.answerPcnt + "%";
        // var format,
        //     timeoutId;

        var animatedElem = element[0].getElementsByClassName('animated');

        function updateElement() {
            $timeout.cancel(timeoutId);
            animatedElem[0].style.width = attrs.answerPcnt + "%";
        }


        // on expanding collapse set the proper width
        scope.$watch(function () {
            var collapseParent = element.closest(".collapse");
            return collapseParent.attr("class");
                var collapseParent = element[0].closest(".collapse");
                // var isShown = collapseParent.classList.contains("show");
                // return isShown;
                return collapseParent.className;
            },
            function (newValue, oldValue) {
                var myOldValue = newValue;
                setTimeout(function () {
                    var collapseParent = element[0].closest(".collapse");
                    var isShown = collapseParent.classList.contains("show");
                    if (!isShown)
                        return;

                    animatedElem[0].style.width = "0%";

                    timeoutId = $timeout(function () {
                        updateElement(); // update DOM
                    }, 1000);
                }, 0)
            });

        // watch here on voting action......


        // scope.$watch(attrs.answerPcnt, function () {
        //     if (attrs.showResult === "false")
        //         return;

        //     var collapseParent = element[0].closest(".collapse");
        //     var isShown = collapseParent.classList.contains("show");
        //     if (!isShown)
        //         return;

        //     timeoutId = $interval(function () {
        //         updateElement(); // update DOM
        //     }, 1000);
        // });

        // scope.$watch(attrs.answerPcnt, function () {
        //     var animatedElem = element[0].getElementsByClassName('animated');
        //     // var animatedElem = element[0].querySelector('.animate');

        //     animatedElem[0].style.width = attrs.answerPcnt + "%";
        // });

        // element.on('$destroy', function () {
        //     $interval.cancel(timeoutId);
        // });

        // start the UI update process; save the timeoutId for canceling
        // timeoutId = $interval(function () {
        //     updateTime(); // update DOM
        // }, 1000);
    }

    return {
        templateUrl: "app/polls/pollAnswer.html",
        restrcit: "E",
        // replace:true,
        // scope: {
        //     showResult: '@'
        // },
        link: link
    }
}]);
