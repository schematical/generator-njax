'use strict';
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
            return '/<%= _model.name.toLowerCase() %>s/' + this.namespace;
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
                ret.<%= name %>_s3_url = 'http://s3.amazonaws.com/' + app.njax.config.aws.bucket_name  +  '/' + doc.<%= name %>;
            <% }else if(_model.fields[name].type == 'md'){ %>
                ret.<%= name %> = doc.<%= name %>_rendered;
                ret.<%= name %>_raw = doc.<%= name %>_raw;
            <% }else{ %>

            <% } %>
        <% } %>
    }

    return app.mongoose.model('<%= _.capitalize(_model.name) %>', <%= _model.name.toLowerCase() %>Schema);
}