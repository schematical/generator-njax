// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', '<%= config.name %>.services', '<%= config.name %>.controllers'])


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
      .state('/', {
          url: '/',
          views: {
              'about-tab': {
                  templateUrl: 'templates/index.html'
              }
          }
      })
    .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })


<%
    for(var name in config.models){
        var _model = config.models[name];
%>


    .state('<%= name %>-list', {
      url: '<%= _model.uri %>',
      views: {
        'pets-tab': {
          templateUrl: 'templates/<%= name %>-list.html',
          controller: '<%= _.capitalize(name) %>ListCtrl'
        }
      }
    })

    .state('<%= name %>-detail', {
      url: '<%= _model.uri %>/:<%= name %>_id',
      views: {
        'pets-tab': {
          templateUrl: 'templates/<%= name %>-detail.html',
          controller: '<%= _.capitalize(name) %>DetailCtrl'
        }
      }
    })
<% } %>
    .state('about', {
        url: '/about',
        views: {
            'about-tab': {
                templateUrl: 'templates/about.html'
            }
        }
    });


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');



});

