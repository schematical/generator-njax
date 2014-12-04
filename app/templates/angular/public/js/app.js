'use strict';


// Declare app level module which depends on filters, and services
angular.module(
        '<%= config.app_name %>',
    [
        'ngRoute',
        'ngCookies',
		'njax.bootstrap',
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

        }
    ]
);