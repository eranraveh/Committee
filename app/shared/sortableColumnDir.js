committeeApp.directive("sortableColumn", function() {
    return {
        templateUrl: "app/shared/sortableColumn.html",
        restrcit: "E",
        scope : {
            fieldName: "=field",
            header: "=header"
        }
    }
})