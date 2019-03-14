var committeeApp = angular.module("committeeApp", ["ngRoute"]);

// parse initialization
Parse.serverURL = 'https://parseapi.back4app.com'; // This is your Server URL
Parse.initialize(
  'uNY5Z6HLyf9TmJNS1xQgDRfbWXZUrr39kXDDcR7d', // This is your Application ID
  'aQd9zgCmtGEXVn1kZ3rNDmsXdKGlEdfiw1rUvDNr' // This is your Javascript key
);

committeeApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    console.log();
    $routeProvider.when("/", {
            templateUrl: "/app/home/home.html",
            controller: "loginCtrl"
        })
        .when("/myCommittee/signup", {
            templateUrl: "/app/signup/signup.html",
            controller: "signupCtrl"
        })
        .when("/myCommittee/tenants", {
            templateUrl: "/app/tenants/tenants.html",
            controller: "tenantsCtrl"
        })
        .when("/myCommittee/messages", {
            templateUrl: "/app/messages/messages.html",
            controller: "messagesCtrl"
        })
        .when("/myCommittee/issues", {
            templateUrl: "/app/issues/issues.html",
            controller: "issuesCtrl"
        })
        .when("/myCommittee/polls", {
            templateUrl: "/app/polls/polls.html",
            controller: "pollsCtrl"
        })
//         .when("/about", {
//             templateUrl: "/app/about/about.html",
//         })
        .otherwise({
            redirectTo: "/"
        });

    // $locationProvider.html5Mode({
    //     enabled: true,
    //     requireBase: false
    // });
    // $locationProvider.hashPrefix('');

}]);