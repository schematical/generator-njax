'use strict';
var fs = require('fs');
var async = require('async');
module.exports = function(app){

    var <%= _model.name.toLowerCase() %>Schema = require('./_gen/<%= _model.name.toLowerCase() %>_gen')(app);
    /*
    Custom Code goes here
    */

    return app.mongoose.model('<%= _.capitalize(_model.name) %>', <%= _model.name.toLowerCase() %>Schema);
}