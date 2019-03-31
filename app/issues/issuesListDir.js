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
            newIssue: "="
        }
        // ,
        // link: function (scope, element, attributes) {
        //     scope.parentId = attributes.parentId;
        // }
    }
})