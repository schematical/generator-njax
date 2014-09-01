'use strict';


// Declare app level module which depends on filters, and services
angular.module(
        '<%= config.app_name %>',
    [
        'ngRoute',
        'ngCookies',
        <% for(var i in config.models){ %>
            '<%= config.app_name %>.<%= i %>.service',
            '<%= config.app_name %>.<%= i %>.controller',
            '<%= config.app_name %>.<%= i %>.directives',
        <% } %>
        '<%= config.app_name %>.filters',
        '<%= config.app_name %>.directives'
    ]
).config(
        [
            '$routeProvider',
            function($routeProvider) {

                $routeProvider.when('/', { templateUrl: 'partials/welcome.html', controller: 'WelcomeCtl'});
                $routeProvider.when('/home', { templateUrl: 'partials/home.html', controller: 'HomeCtl'});
                $routeProvider.when('/draw', { templateUrl: 'partials/draw.html', controller: 'DrawCtl'});
                $routeProvider.when('/suggest', { templateUrl: 'partials/suggest.html', controller: 'SuggestCtl'});
                $routeProvider.when('/display', { templateUrl: 'partials/display.html', controller: 'DisplayCtl'});
                $routeProvider.otherwise({redirectTo: '/'});
        }
    ]
);