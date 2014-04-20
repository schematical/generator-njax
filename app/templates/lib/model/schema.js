'use strict';
module.exports = function(app){

    var Schema = app.mongoose.Schema;

    var fields = {
        _id: { type: Schema.Types.ObjectId },
    <% for(var name in _model.fields){  %>
        <%= name %>:<%= _model.fields[name].mongo_type %>,
    <% } %>
        cre_date:Date
    };

    var <%= _model.name.toLowerCase() %>Schema = new Schema(fields);
    <% if(_model.fields.namespace){ %>
        <%= _model.name.toLowerCase() %>Schema.virtual('uri').get(function(){
            return '/<%= _model.name.toLowerCase() %>s/' + this.namespace;
        });
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
    }

    return app.mongoose.model('<%= _.capitalize(_model.name) %>', <%= _model.name.toLowerCase() %>Schema);
}