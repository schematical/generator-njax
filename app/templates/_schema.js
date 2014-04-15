'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var fields = {
<% for(var name in _model.fields){  %>
    <%= name %>:<%= _model.fields[name] %>,
<% } %>
    cre_date:Date
};

var <%= _model.name.toLowerCase() %>Schema = new Schema(fields);

module.exports = mongoose.model('<%= _.capitalize(_model.name) %>', <%= _model.name.toLowerCase() %>Schema);