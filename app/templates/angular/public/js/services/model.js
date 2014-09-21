var <%= _model.name %>Services = angular.module('<%= config.app_name %>.<%= _model.name %>.service', ['ngResource']);
<%= _model.name %>Services.factory(
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

