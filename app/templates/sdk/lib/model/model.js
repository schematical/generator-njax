module.exports = function(sdk){
    var <%= _model.name %> = require('./_gen/<%= _model.name %>')(sdk);
    /*
        Custom Code goes here
    */

    return sdk;
}