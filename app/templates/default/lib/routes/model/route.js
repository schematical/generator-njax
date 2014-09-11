
module.exports = function(app){
    <% if(!_model.default){ %>
        var route = require('./_gen/<%= _model.name %>.gen')(app);
    <% }else{ %>
        var route = require(app.njax.config.njax_dir + '/lib/routes/model/<%= _model.name %>')(app);
    <% } %>

    /**
     * Custom Code Goes here
     */
    route.init();

}