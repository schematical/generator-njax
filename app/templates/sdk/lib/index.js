module.exports = function(options){
    var <%= config.app_name %> = {};
    <% for(var i in config.models){ %>
        require('./model/' + config.models[i].name)(<%= config.app_name %>);
    <% } %>
    return <%= config.app_name %>;
}