var request = require('request');
var _ = require('underscore');
var querystring = require('querystring');
module.exports  = function(config){
    var defaults = {
        auth_server:<%= config.domain + config.port %>
    }
    _.extend(config, defaults);
    var client = {
        route_auth:function(params){
            return function(req, res, next){
                var url = client.auth_url(params);
                return res.redirect(url);
            }
        },
        auth_url:function(params){
            if(!params.scope){
                params.scope = config.scope;
            }
            if(typeof(params.scope) ==  'string'){
                var scope = params.scope;
            }else if(params.scope.join){
                var scope = params.scope.join(',');
            }else{
                var scope = 'basic';
            }

            var query_data = {
                response_type:'code',
                client_id:params.client_id,
                scope:scope,
                redirect_uri: params.redirect_uri || config.redirect_uri
            }
            return config.auth_server + querystring.stringify(query_data);;

        }
    }
    return client;
}