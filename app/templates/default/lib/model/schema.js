'use strict';
var fs = require('fs');
var async = require('async');
module.exports = function(app){
    <% if(!_model.default){ %>
        var <%= _model.name.toLowerCase() %>Schema = require('./_gen/<%= _model.name %>_gen')(app);
    <% }else{ %>
        var <%= _model.name.toLowerCase() %>Schema = require(app.njax.config.njax_dir + '/lib/model/<%= _model.name %>')(app);
    <% } %>
    /*
    Custom Code goes here
    */

    return app.mongoose.model('<%= _.capitalize(_model.name) %>', <%= _model.name.toLowerCase() %>Schema);
}