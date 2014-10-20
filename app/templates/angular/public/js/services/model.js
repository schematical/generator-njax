var <%= _model.name %>Services = angular.module('<%= config.app_name %>.<%= _model.name %>.service', ['ngResource']);
<%= _model.name %>Services.factory(
    '<%= _.capitalize(_model.name) %>Service',
    [
        '$resource',
        function($resource){
            return $resource('<%= _model.uri %>/:<%= _model.name %>_id',
            	{
            		'<%= _model.name %>_id':'@_id'<% if(_model.parent){ %>,
					 	<%= _model.fields[model.parent].name %>:'@<%= _model.fields[model.parent].name %>
					<% } %>
            	},
            	{
					query: {
						method:'GET',
						params:{

						},
						isArray:true
					}
            	}
            );
        }
    ]
);

