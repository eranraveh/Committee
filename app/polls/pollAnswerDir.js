committeeApp.directive("pollAnswer", function () {

    function link(scope, element, attrs) {
        if (attrs.showResult === "false")
            return;

        var animatedElem = element[0].getElementsByClassName('animated');
        // var animatedElem = element[0].querySelector('.animate');

        // animatedElem[0].css("width", attrs.answerPcnt);
        animatedElem[0].style.width = attrs.answerPcnt + "%";
        // var format,
        //     timeoutId;

        // function updateTime() {
        //     element.text(dateFilter(new Date(), format));
        // }

        // scope.$watch(attrs.answerPcnt, function () {
        //     var animatedElem = element[0].getElementsByClassName('animated');
        //     // var animatedElem = element[0].querySelector('.animate');

        //     animatedElem[0].style.width = attrs.answerPcnt + "%";
        // });

        // element.on('$destroy', function () {
        //     $interval.cancel(timeoutId);
        // });

        // // start the UI update process; save the timeoutId for canceling
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
})