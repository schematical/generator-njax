var request = require('request');
var _ = require('underscore');

var config = {

}
module.exports = function(options){
    config = _.extend(options, config);


    var <%= config.app_name %> = {
        //TODO: Write this
        call:function(method, uri, body, options, callback){
            if(_.isFunction(body)){
                callback = body;
                options = {};
                body = null;
            }
            if(_.isFunction(options)){
                callback = options;
                options = {};
            }

            options.method = method;
            options.url = config.protocol + '://' + config.host  + uri;
            options.headers = {};
            if(!_.isUndefined(options.client_id)){
                options.headers.client_id = options.client_id;
            }else{
                options.headers.client_id = config.client_id;
            }

            options.headers.client_secret = options.client_secret || config.client_secret;
            options.headers.access_token = options.access_token || config.access_token;
            if(options.body){
                options.body = body;
            }

            return request(options, this.onCallResponse);

        },
        onCallResponse:function(err, response, body){
            if(err) return callback(err);
                var data = body;
            if(_.isString(body)){
                try{
                    data = JSON.parse(body);
                }catch(e){
                    return callback(e);
                }
            }
            return callback(err, data, response);
        },
        find:function(data, callback){

        },
        save:function(data, callback){

            //Check for _id or uri
            this.call('post', data.uri, data, callback)

        },
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

    };



    <% for(var i in config.models){ %>
        require('./model/<%= config.models[i].name %>')(<%= config.app_name %>);
    <% } %>
    return <%= config.app_name %>;
}