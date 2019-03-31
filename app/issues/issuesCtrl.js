committeeApp.controller("issuesCtrl", function ($scope, $location, userSrv, issuesSrv, issueCommentsSrv) {
    $scope.newIssue = {
        title: "",
        issueBody: "",
        priority: "",
        status: ""
    };

    if (!userSrv.isLoggedIn()) {
        $location.path("/");
        return;
    }

    // // trigger tooltip on hover only when data-toggle in use for other then tooltip
    // $('[rel="tooltip"]').tooltip({
    //     trigger: "hover"
    // });

    // $('.dropdown-menu').click(function (e) {
    //     e.stopPropagation();
    // });

    let unreadIssues = 0;
    let openIssues = 0;
    let myIssues = 0;
    $scope.issues = [];
    $scope.editMode = true;

    // descending order
    $scope.sort = "-postingDate";

    function loadData(params) {
        issuesSrv.getIssues().then((issues) => {
            $scope.issues = issues;

        }).catch((err) => {
            console.error(err);
        });
    }
    loadData();

    $scope.queryFilter = function (issue, index) {
        // reset the unread counter on first object being checked in filter
        if (index === 0)
            resetCounters();

        if (!$scope.query) {
            return shouldBeShown(issue);
        } else if ((issue.title.toLowerCase().includes($scope.query.toLowerCase()) ||
                issue.details.toLowerCase().includes($scope.query.toLowerCase())) &&
            shouldBeShown(issue)) {
            return true;
        } else {
            return false;
        }
    }

    function shouldBeShown(issue) {
        // show only important issue
        if ((!$scope.importance || issue.priority === issuesSrv.issueUrgency.URGENT) &&
            // show only unread issue
            (!$scope.unread || !issue.wasRead || ($scope.openReadIssue != null && $scope.openReadIssue == issue)) &&
            // show only my issue
            (!$scope.myIssues || issue.isMyIssue)) {
            checkIssueCounters(issue);
            return true;
        } else {
            return false;
        }

    }

    function checkIssueCounters(issue) {
        if (!issue.wasRead)
            unreadIssues++;
        if (issue.status != issuesSrv.issueStatus.CLOSE)
            openIssues++;
        if (issue.isMyIssue)
            myIssues++;
    }

    function resetCounters() {
        unreadIssues = 0;
        openIssues = 0;
        myIssues = 0;
    }

    $scope.getUnreadIssuesCount = () => {
        return unreadIssues;
    };

    $scope.getOpenIssuesCount = () => {
        return openIssues;
    };

    $scope.getMyIssuesCount = () => {
        return myIssues;
    };

})