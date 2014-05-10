'use strict';
var fs = require('fs');
var async = require('async');
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
        cre_date:Date
    };

    var <%= _model.name.toLowerCase() %>Schema = new Schema(fields);

    <%= _model.name.toLowerCase() %>Schema.virtual('uri').get(function(){
        <% if(_model.fields.namespace){ %>
            return '/<%= _model.name.toLowerCase() %>s/' + (this.namespace || this._id);
        <% }else{ %>
            return '/<%= _model.name.toLowerCase() %>s/' + this._id;
        <% } %>
    });

    <% for(var name in _model.fields){  %>
        <% if(_model.fields[name].type == 'md'){ %>
            <%= _model.name.toLowerCase() %>Schema.virtual('<%= name %>').get(function(){
                return this.<%= name %>_rendered;
            }).set(function(value){
                var markdown = require('markdown').markdown;
                this.<%= name %>_raw = value;
                this.<%= name %>_rendered = markdown.toHTML(value);
            });

        <% } if(_model.fields[name].type == 's3-asset'){ %>
            <%= _model.name.toLowerCase() %>Schema.virtual('<%= name %>_s3').get(function(){
                var AWS = require('aws-sdk');
                AWS.config.update(app.njax.config.aws);
                var s3 = new AWS.S3();
                var _this = this;
                return {
                    url:'http://s3.amazonaws.com/' + app.njax.config.aws.bucket_name  +  '/' + this.<%= name %>,
                    getFile:function(file_path, callback){
                        if(!callback && _.isFunction(file_path)){
                            callback = file_path;
                            file_path = path.join(app.njax.config.cache_dir,_this.<%= name %>);
                        }
                        async.series([
                            function(cb){
                                mkdirp(path.dirname(file_path), function (err) {
                                    if(err) return callback(err);
                                    return cb();
                                });
                            },
                            function(cb){
                                var stream = require('fs').createWriteStream(file_path);
                                var params = {
                                    Bucket: app.njax.config.aws.bucket_name,
                                    Key:this.<%= name %>
                                }
                                var body = '';
                                s3.getObject(params).
                                    on('httpData',function (chunk) {
                                        stream.write(chunk);
                                        body += chunk;
                                    }).
                                    on('httpDone',function () {
                                        stream.end(null, null, function(){
                                            callback(null, body, file_path);
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


    <%= _model.name.toLowerCase() %>Schema.pre('save', function(next){
        if(!this._id){
            this._id = new app.mongoose.Types.ObjectId();
        }
        return next();
    });

    if (!<%= _model.name.toLowerCase() %>Schema.options.toObject) <%= _model.name.toLowerCase() %>Schema.options.toObject = {};
    <%= _model.name.toLowerCase() %>Schema.options.toObject.transform = function (doc, ret, options) {
        ret.uri = doc.uri;
        <% for(var name in _model.fields){  %>
            <% if(_model.fields[name].type == 's3-asset'){ %>
                ret.<%= name %>_s3 = {
                    url:doc.<%= name %>_s3.url
                }
            <% }else if(_model.fields[name].type == 'md'){ %>
                ret.<%= name %> = doc.<%= name %>_rendered;
                ret.<%= name %>_raw = doc.<%= name %>_raw;
            <% }else{ %>

            <% } %>
        <% } %>
    }

    return app.mongoose.model('<%= _.capitalize(_model.name) %>', <%= _model.name.toLowerCase() %>Schema);
}