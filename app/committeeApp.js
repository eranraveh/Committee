// var committeeApp = angular.module("committeeApp", []);
var committeeApp = angular.module("committeeApp", ["ngRoute"]);

committeeApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    console.log();
    $routeProvider.when("/", {
            templateUrl: "/app/home/home.html"
        })
        .when("/signup", {
            templateUrl: "/app/signup/signup.html"
            // controller: "breedsCtrl"
        })
//         .when("/dogs/:breedId", {
//             templateUrl: "/app/breedImagesGallery/breedImages.html",
//             controller: "imageCtrl"
//         })
//         .when("/about", {
//             templateUrl: "/app/about/about.html",
//         })
        .otherwise({
            redirectTo: "/"
        });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    $locationProvider.hashPrefix('');

}]);