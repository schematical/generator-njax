var phonecatServices = angular.module('<%= _model.name %>Services', ['ngResource']);

phonecatServices.factory(
    '<%= _.capitalize(_model.name) %>',
    [
        '$resource',
        function($resource){
            return $resource('<%= _model.name %>s/:<%= _model.name %>_id', {}, {
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