committeeApp.directive("messageCard", function() {
    return {
        templateUrl: "app/messages/messageCard.html",
        restrcit: "E",
        link: function (scope, element, attributes) {
            scope.parentId = attributes.parentId;
           }
    }
})