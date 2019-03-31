committeeApp.directive("issueCard", ["issuesSrv", function (issuesSrv) {

    return {
        templateUrl: "app/issues/issueCard.html",
        restrcit: "E",
        controller: 'issueCardCtrl',
        scope: {
            editedIssue: "=",
            issue: "=",
            toggleCard: "&",
            index: "@",
            isDashboard: "="
        },
        link: function (scope, element, attributes) {
            scope.parentId = attributes.parentId;

            scope.$watch("editMode", setNewFormSelectedPriority);

            function setNewFormSelectedPriority() {
                var newIssueFormPriority = element.closest("ng-view").find("#newIssueForm #priority");
                newIssueFormPriority.find("label").removeClass("active");

                var newActiveLabel = null;
                if (!!scope.editedIssue) {
                    switch (scope.editedIssue.priority) {
                        case issuesSrv.issueUrgency.URGENT:
                            newActiveLabel = newIssueFormPriority.find("label:first-child");
                            break;

                        case issuesSrv.issueUrgency.IMPORTANT:
                            newActiveLabel = newIssueFormPriority.find("label:nth-child(2)");
                            break;

                        case issuesSrv.issueUrgency.NORMAL:
                            newActiveLabel = newIssueFormPriority.find("label:last-child");
                            break;

                        default:
                            break;
                    }
                }

                if (newActiveLabel != null && newActiveLabel.length > 0)
                    newActiveLabel.addClass("active");
            }
        }
    }
}]);