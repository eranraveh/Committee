committeeApp.directive("issueCard", function () {
    return { 
        templateUrl: "app/issues/issueCard.html",
        restrcit: "E",
        link: function (scope, element, attributes) {
            scope.parentId = attributes.parentId;
           }
    }
})