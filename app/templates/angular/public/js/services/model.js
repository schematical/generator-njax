var <%= config.app_name %>_services = angular.module('<%= config.app_name %>.<%= _model.name %>.service', ['ngResource']);
<%= config.app_name %>_services.factory(
    '<%= _.capitalize(_model.name) %>',
    [
        '$resource',
        function($resource){
            return $resource( '//' + njax_bootstrap.api_url + '<%= _model.uri %>/:<%= _model.name %>_id', {}, {
                query: {
                    method:'GET',
                    params:{
                        phoneId:'phones'
                    },
                    isArray:true
                }
            });
        }
    ]
);