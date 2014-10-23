'use strict';
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');

module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    <% for(var name in _model.fields){  %>
        <% if(_model.fields[name].type == 'md'){ %>
            <%= name %>_raw:String,
            <%= name %>_rendered:String,
        <% }else{ %>
            <%= name %>:<%= _model.fields[name].mongo_type %>,
        <% } %>
    <% } %>
        creDate:Date
    };

    var <%= _model.name.toLowerCase() %>Schema = new Schema(fields);
	<%= _model.name.toLowerCase() %>Schema.virtual('_njax_type').get(function(){
		return '<%= _.capitalize(_model.name) %>';
	});
    <%= _model.name.toLowerCase() %>Schema.virtual('uri').get(function(){
        <% if(_model.is_subdocument){ %>
            <% if(_model.fields.namespace){ %>
                    return this.parent().uri + '/<%= _model.name.toLowerCase() %>s/' + (this.namespace || this._id);
            <% }else{ %>
                return this.parent().uri + '/<%= _model.name.toLowerCase() %>s/' + this._id;
            <% } %>
        <% } else if(_model.parent_field){ %>
            <% if(_model.fields.namespace){ %>
                if(!this.<%= _model.parent %>){
                    var parent_id = null;
                }else{
                    var parent_id =  (this.<%= _model.parent %>.uri || ('/' + this.<%= _model.parent %>));
                }
                return '<%= _model.parent_field.uri_prefix %>' + parent_id   + '<%= _model.uri_prefix %>/' + (this.namespace || this._id);
            <% }else{ %>
                if(!this.<%= _model.parent %>){
                    var parent_id = null;
                }else{
                    var parent_id = (this.<%= _model.parent %>.uri || ('/' + this.<%= _model.parent %>));
                }
                return '<%= _model.parent_field.uri_prefix %>' +  parent_id + '<%= _model.uri_prefix %>/' + this._id;
            <% } %>
        <% } else { %>
            <% if(_model.fields.namespace){ %>
                return '<%= _model.uri %>/' + (this.namespace || this._id);
            <% }else{ %>
                return '<%= _model.uri %>/' + this._id;
            <% } %>
        <% } %>
    });

    <% for(var name in _model.fields){  %>
        <% if(_model.fields[name].type == 'md'){ %>
            <%= _model.name.toLowerCase() %>Schema.virtual('<%= name %>').get(function(){
                return this.<%= name %>_rendered;
            }).set(function(value){
                if(!value || value.length == 0){
                    return false;
                }
                var markdown = require('markdown').markdown;
                this.<%= name %>_raw = value;
                this.<%= name %>_rendered = markdown.toHTML(value);
            });
        <% } if(_model.fields[name].type == 'tpcd'){ %>
         <%= _model.name.toLowerCase() %>Schema.virtual('<%= name %>_tpcds').get(function(){
            return {
                <% for(var value in _model.fields[name].options){ %>
                    <%= value %>:'<%= _model.fields[name].options[value] %>',
                <% } %>
            }
        });

        <% for(var value in _model.fields[name].options){ %>
            <%= _model.name.toLowerCase() %>Schema.virtual('is_<%= value %>').get(function(){
                return (this.<%= name %> == '<%= value %>');
            });
        <% } %>

                            <% } if(_model.fields[name].type == 's3-asset'){ %>
            <%= _model.name.toLowerCase() %>Schema.virtual('<%= name %>_s3').get(function(){
                var path = require('path');

                var AWS = require('aws-sdk');
                AWS.config.update(app.njax.config.aws);
                var s3 = new AWS.S3();
                var _this = this;
                if(!app.njax.config.local_file_cache){
                    var url = 'http://s3.amazonaws.com/' + app.njax.config.aws.bucket_name  +  '/' + this.<%= name %>;
                }else{
                    var url = app.njax.config.www_url + '/cache/' + this.<%= name %>;
                }

                return {
                    url:url,
                    getFile:function(local_file_path, callback){
                        if(!callback && _.isFunction(local_file_path)){
                            callback = local_file_path;
                            local_file_path = _this.<%= name %>;
                            /*
                            if(!local_file_path || (!app.njax.isTmpdir(local_file_path)){
                            }
                                local_file_path = app.njax.tmpdir(local_file_path);
                            }
                            */
                        }
                        var dir_name = path.dirname(local_file_path);
                        if(!fs.existsSync(dir_name)){
                            mkdirp.sync(dir_name);
                        }
                        if(app.njax.config.local_file_cache){
                            var cache_path = app.njax.cachedir(_this.<%= name %>);
                            var content = null;
                            if(fs.existsSync(cache_path)){
                                content = fs.readFileSync(
                                    cache_path
                                );
                            }


                            fs.writeFileSync(
                                local_file_path,
                                content
                            );
                            return callback(null,content, local_file_path);
                        }
                        
                        async.series([
                            function(cb){
                                mkdirp(path.dirname(local_file_path), function (err) {
                                    if(err) return callback(err);
                                    return cb();
                                });
                            },
                            function(cb){
                                var stream = require('fs').createWriteStream(local_file_path);
                                var params = {
                                    Bucket: app.njax.config.aws.bucket_name,
                                    Key:_this.<%= name %>
                                }
                                var body = '';
                                s3.getObject(params).
                                    on('error', function(err, response) {
                                        if(err) return callback(err, response);
                                    }).
                                    on('httpData',function (chunk) {
                                        stream.write(chunk);
                                        body += chunk;
                                    }).
                                    on('httpDone',function () {
                                        stream.end(null, null, function(){
                                            callback(null, body, local_file_path);
                                        });

                                    }).
                                    send();
                            }
                        ]);
                    },
                    setFile:function(file_path, callback){
                        var content = fs.readFileSync(file_path);
                        async.series([
                            function(cb){
                                var params = {
                                    Bucket: app.njax.config.aws.bucket_name,
                                    Key: file_path,
                                    Body: content,
                                    ACL: 'public-read',
                                    ContentLength: content.length
                                };
                                s3.putObject(params, function (err, aws_ref) {
                                    if (err) {
                                        return callback(err);
                                    }
                                    _this.<%= name %> = file_path;
                                    return cb(null);
                                });
                            },
                            function(cb){
                                _this.save(function(err){
                                    if(err) return callback(err);
                                    return cb();
                                });
                            },
                            function(cb){
                                return callback();
                            }
                        ]);
                    }
                }
            });
        <% } %>

    <% } %>

    <% if(_model.fields.archiveDate){ %>
        <%= _model.name.toLowerCase() %>Schema.virtual('archive').get(function(){
            return function(callback){
                this.archiveDate = new Date();
                this.save(callback);
            }
        });
    <% } %>



    <%= _model.name.toLowerCase() %>Schema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
            this.creDate = new Date();
        }
        return next();
    });



     <%= _model.name.toLowerCase() %>Schema.virtual('tags').get(function(){
		return function(callback){
			return app.njax.tag.query(this, callback);
		}
	});
	<%= _model.name.toLowerCase() %>Schema.virtual('addTag').get(function(){
		return function(tag_data, callback){
			return app.njax.tag.add(tag_data, this, callback);
		}
	});



    <%= _model.name.toLowerCase() %>Schema.virtual('url').get(function(){
     	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		return app.njax.config.domain + port_str + this.uri;
	});

   <%= _model.name.toLowerCase() %>Schema.virtual('api_url').get(function(){
    	var port_str = '';
        if(!app.njax.config.hide_port){
            port_str = ':' + app.njax.config.port;
		}
		<% if (config.is_platform || config.njax_module) { %>
           return app.njax.config.core.api.host  + this.uri;
        <% } else { %>
            return app.njax.config.api.host  + this.uri;
        <% } %>
	});


    if (!<%= _model.name.toLowerCase() %>Schema.options.toObject) <%= _model.name.toLowerCase() %>Schema.options.toObject = {};
    <%= _model.name.toLowerCase() %>Schema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;

        ret.url = doc.url;
        ret.api_url = doc.api_url;
        <% for(var name in _model.fields){  %>
            <% if(_model.fields[name].type == 's3-asset'){ %>
                ret.<%= name %>_s3 = {
                    url:doc.<%= name %>_s3.url,
                    path:doc.<%= name %>
                }
            <% }else if(_model.fields[name].type == 'md'){ %>
                ret.<%= name %> = doc.<%= name %>_rendered;
                ret.<%= name %>_raw = doc.<%= name %>_raw;
            <% }else if(_model.fields[name].type == 'tpcd'){ %>
                <% for(var value in _model.fields[name].options){ %>
                    ret.is_<%= value %> = doc.is_<%= value %>;
                <% } %>
            <% }else{ %>

            <% } %>
        <% } %>
    }

    return <%= _model.name.toLowerCase() %>Schema;
}