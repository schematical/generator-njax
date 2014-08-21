module.exports = function(app){
    /**
     * Model Routes
     */
    <% for(var name in config.models){  %>
        <% if(!config.models[name].default){ %>
            require('./<%= name %>')(app);
        <% } %>
    <% } %>

}