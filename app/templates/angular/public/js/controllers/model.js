'use strict';

/* Controllers */

angular.module('<%= config.app_name %>.<%= _model.name %>.controller', [])
    .controller(
        '<%= _.capitalize(_model.name) %>EditForm',
        [
            '$scope',
            '<%= _.capitalize(_model.name) %>Service',
            function($scope, <%= _.capitalize(_model.name) %>Service) {

                $scope.validate = function(){


                }
                $scope.save = function(){


                }
            }
        ]
    )
	.controller(
		'<%= _.capitalize(_model.name) %>EditForm',
        [
            '$scope',
            '<%= _.capitalize(_model.name) %>Service',
            function($scope, <%= _.capitalize(_model.name) %>Service) {


            }
        ]
    )
    .controller(
        '<%= _.capitalize(_model.name) %>List',
        [
            '$scope',
            '<%= _.capitalize(_model.name) %>Service',
            function($scope, <%= _.capitalize(_model.name) %>Service) {

                $scope.search = function(){


                }
            }
        ]
    )
