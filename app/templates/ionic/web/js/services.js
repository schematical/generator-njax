var <%= config.app_name %>Services = angular.module('<%= config.app_name %>.services', ['ngResource']);
<%
    for(var name in config.models){
        var _model = config.models[name];
%>
//var <%= _model.name %>Services = angular.module('<%= _model.name %>.services', ['ngResource']);
//<%= _model.name %>Services.factory(
<%= config.app_name %>Services.factory(
    '<%= _.capitalize(_model.name) %>Service',
    [
        '$resource',
        function($resource){
            return $resource('<%= _model.uri %>/:<%= _model.name %>_id', {}, {
                query: {
                    method:'GET',
                    params:{
                        '<%= _model.name %>_id':'<%= _model.name %>_id'
                    },
                    isArray:true
                }
            });
        }
    ]
);


<%
    }
%>
