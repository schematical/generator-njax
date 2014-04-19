'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var fields = {
    _id: { type: ObjectId },
<% for(var name in _model.fields){  %>
    <%= name %>:<%= _model.fields[name].mongo_type %>,
<% } %>
    cre_date:Date
};

var <%= _model.name.toLowerCase() %>Schema = new Schema(fields);
    <%= _model.name.toLowerCase() %>Schema.pre('save', function(){
        if(!this._id){
            this._id = new ObjectId();
        }
    });
module.exports = mongoose.model('<%= _.capitalize(_model.name) %>', <%= _model.name.toLowerCase() %>Schema);