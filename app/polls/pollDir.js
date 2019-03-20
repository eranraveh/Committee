committeeApp.directive("poll", function () {
    return {
        templateUrl: "app/polls/pollCard.html",
        restrcit: "E",
        link: function (scope, element, attributes) {
            scope.parentId = attributes.parentId;
        }
    }
})