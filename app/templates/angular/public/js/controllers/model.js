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
					$scope.<%= _model.name %> = new <%= _.capitalize(_model.name) %>Service({
						<% for(var name in _model.fields){ %>
							<% if(_model.fields[name].type == 'date'){ %>
								'<%= name %>': (NJaxBootstrap.<%= _model.name %>.<%= name %> && new Date(NJaxBootstrap.<%= _model.name %>.<%= name %>) || null,
							<% }else{ %>
								'<%= name %>': NJaxBootstrap.<%= _model.name %>.<%= name %>,
							<% } %>
						<% } %>
						'_id': NJaxBootstrap.<%= _model.name %>._id
					});
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
            'NJaxBootstrap',
            function($scope, <%= _.capitalize(_model.name) %>Service, NJaxBootstrap) {
				if( NJaxBootstrap.<%= _model.name %>){
					$scope.<%= _model.name %> = new <%= _.capitalize(_model.name) %>Service(NJaxBootstrap.<%= _model.name %>);
				}

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
