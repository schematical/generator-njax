var _ = require('underscore');
module.exports = function(sdk){
    var <%= _model.name %> = sdk.<%= _.capitalize(_model.name) %> = function(data){
        for(var i in data){
            this[i] = data[i];
        }
        return this;
    }
    <% if(_model.is_subdocument){ %>

    <% } else if(_model.parent_field){ %>

    <% }else{ %>

    <% } %>

    <%= _model.name %>.prototype.base_uri = '<%= _model.uri %>';

    <%= _model.name %>.find = function(query, callback){
        if(_.isFunction(query)){
            callback = query;
            query = null;
        }
        sdk.find(<%= _model.name %>.prototype.base_uri, query, function(err, <%= _model.name %>_records){
            if(err) return callback(err);
            var <%= _model.name %>s = [];
            for(var i in <%= _model.name %>_records){
                <%= _model.name %>s.push(new <%= _model.name %>(<%= _model.name %>_records[i]));
            }
            return callback(null, <%= _model.name %>s);
        });

    }

    <%= _model.name %>.prototype.save = function(callback){
        if(!this.uri){

            <% if(_model.is_subdocument){ %>
                this.uri = this.parent_uri + '<%= _model.uri_prefix %>';
            <% } else if(_model.parent_field){ %>
                this.uri = this.parent_uri + '<%= _model.uri_prefix %>';
            <% }else{ %>
                this.uri = <%= _model.name %>.prototype.base_uri;
            <% } %>

        }


        sdk.save(this, _.bind(function(err, response, body){
            if(err) return callback(err);
            if(body.uri){
                for(var i in body){
                    this[i] = body[i];
                }
            }
            return callback(null, response, this);
        }, this));

    }
    <%= _model.name %>.prototype.toObject = function(options){
        var ret = {};
        ret._id = this._id;
        ret.uri = this.uri;
        ret.url = this.url;
        ret.api_url = this.api_url;
        <% for(var name in _model.fields){ %>
            ret.<%= name %> = this.<%= name %>;
        <% } %>
        return ret;
    }
    return  <%= _model.name %>;
}