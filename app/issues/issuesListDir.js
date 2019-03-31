committeeApp.directive("issuesList", function () {

    // $outerController
    return {
        templateUrl: "app/issues/issuesList.html",
        restrcit: "E",
        controller: 'issuesListCtrl',
        scope: {
            objectId: "@",
            issuesArray: "=",
            filterMethod: "=",
            sort: "=",
            openIssue: "=",
            newIssue: "=",
            limit: "=",
            isDashboard: "=?"
        },
        link: function (scope, element, attributes) {

            scope.$watch("resetCounter", (scope, element1) => {
                // priority Normal is default
                console.log(element);
                element.find("#priority > label").removeClass("active");
                element.find("#priority > label:last-child").addClass("active");
            });

            // $scope.$watch("editMode"), () => {
            //     // priority Normal is default
            //     $("#priority>label").removeClass("active");
            //     $("#priority > label:last-child").addClass("active");
            // }
        }
    }
})