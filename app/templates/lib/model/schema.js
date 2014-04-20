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
        <%= _model.name.toLowerCase() %>Schema.pre('save', function(next){
            if(!this._id){
                this._id = new app.mongoose.Types.ObjectId();
            }
            return next();
        });
    return app.mongoose.model('<%= _.capitalize(_model.name) %>', <%= _model.name.toLowerCase() %>Schema);
}