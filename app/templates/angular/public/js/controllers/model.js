'use strict';

/* Controllers */

angular.module('<%= config.app_name %>.<%= _model.name %>.controller', [])
    .controller(
        '<%= _model.name %>EditForm',
        [
            '$scope',
            '$cookies',
            '<%= _.capitalize(_model.name) %>Service'
            function($scope, $cookies, <%= _.capitalize(_model.name) %>Service) {

                $scope.validate = function(){


                }
                $scope.save = function(){


                }
            }
        ]
    )
    .controller(
        '<%= _model.name %>List',
        [
            '$scope',
            '$cookies',
            '<%= _.capitalize(_model.name) %>Service'
            function($scope, $cookies, <%= _.capitalize(_model.name) %>Service) {

                $scope.validate = function(){


                }
                $scope.save = function(){


                }
            }
        ]
    )
