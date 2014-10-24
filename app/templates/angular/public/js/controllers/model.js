'use strict';

/* Controllers */

angular.module('<%= config.app_name %>.<%= _model.name %>.controller', [])
    .controller(
        '<%= _.capitalize(_model.name) %>EditFormCtl',
        [
            '$scope',
            '<%= _.capitalize(_model.name) %>Service',
			'NJaxBootstrap',
            function($scope, <%= _.capitalize(_model.name) %>Service, NJaxBootstrap) {
				if( NJaxBootstrap.<%= _model.name %>){
					$scope.<%= _model.name %> = new <%= _.capitalize(_model.name) %>Service(NJaxBootstrap.<%= _model.name %>);
				}
                $scope.validate = function(){


                }
                $scope.save = function(){
					$scope.<%= _model.name %>.save(function(){
						alert("Done");
					});
                }
            }
        ]
    )
	.controller(
		'<%= _.capitalize(_model.name) %>DetailCtl',
        [
            '$scope',
            '<%= _.capitalize(_model.name) %>Service',
            function($scope, <%= _.capitalize(_model.name) %>Service) {


            }
        ]
    )
    .controller(
        '<%= _.capitalize(_model.name) %>ListCtl',
        [
            '$scope',
            '<%= _.capitalize(_model.name) %>Service',
            function($scope, <%= _.capitalize(_model.name) %>Service) {

                $scope.search = function(){


                }
            }
        ]
    )
