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
		<%= _model.name %>.prototype.base_uri = '<%= _model.uri %>';
    <% } %>

	<%= _model.name %>.prototype._njax_type = '<%= _.capitalize(_model.name) %>';



    <%= _model.name %>.find = function(query, callback){
        if(_.isFunction(query)){
            callback = query;
            query = null;
        }

		<% if(_model.parent_field){ %>
		if(query.uri){
			var uri = query.uri;
		}else if(query._parent_uri){
			var uri = query._parent_uri + '<%= _model.uri_prefix %>';
		}else if(query.<%= _model.parent %>){
			var uri = '<%= _model.parent_model.uri_prefix %>/' + query.<%= _model.parent %> + '<%= _model.uri_prefix %>';
		}
		<% }else{ %>
			var uri = <%= _model.name %>.prototype.base_uri;
		<% } %>
        sdk.find(uri, query, function(err, <%= _model.name %>_records){
            if(err) return callback(err);
            var <%= _model.name %>s = [];
            for(var i in <%= _model.name %>_records){
                <%= _model.name %>s.push(new <%= _model.name %>(<%= _model.name %>_records[i]));
            }
            return callback(null, <%= _model.name %>s);
        });

    }

	<%= _model.name %>.findOne = function(query, callback){
		if(_.isString(query)){
			<% if(_model.is_subdocument){ %>
			var uri = this.parent_uri + '<%= _model.uri_prefix %>/' + query;
			<% } else if(_model.parent_field){ %>
			var uri = this.parent_uri + '<%= _model.uri_prefix %>/' + query;
			<% }else{ %>
			var uri = <%= _model.name %>.prototype.base_uri + '/' + query;
			<% } %>
			return sdk.call('get', uri, function(err, body, response){
				if(err) return callback(err);
				var r<%= _.capitalize(_model.name) %> = null;
				if(body){
					r<%= _.capitalize(_model.name) %> = new <%= _model.name %>(body);
				}
				return callback(null, r<%= _.capitalize(_model.name) %>, response);
			});
		}

		if(_.isFunction(query)){
			callback = query;
			query = null;
		}
		<%= _model.name %>.find(query, function(err, <%= _model.name %>s){
			if(err) return callback(err);
			if(!<%= _model.name %>s || <%= _model.name %>s.length == 0){
				return callback(null, null);
			}
			return callback(null, <%= _model.name %>s[0]);
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


        sdk.save(this, _.bind(function(err, body, response){
            if(err) return callback(err);

            if(body.uri){
                for(var i in body){
                    this[i] = body[i];
                }
            }
            return callback(null, this, response);
        }, this));

    }
	<%= _model.name %>.prototype.remove = function(callback){
		//Check for _id or uri
		sdk.call('delete', this.uri,  _.bind(function(err, body, response){
			if(err) return callback(err);

			return callback(null, this, response);
		}, this));

	}
    <%= _model.name %>.prototype.toObject = function(options){
        var ret = {};
        ret._id = this._id;
        ret.uri = this.uri;
        ret.url = this.url;
        ret.api_url = this.api_url;
        <% for(var name in _model.fields){ %>
			<% if(_model.fields[name].type == 's3-asset'){ %>
				ret.<%= name %>_s3 = this.<%= name %>_s3;
			<% } %>
			ret.<%= name %> = this.<%= name %>;

        <% } %>
        return ret;
    }
    return  <%= _model.name %>;
}
