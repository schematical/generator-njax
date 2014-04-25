module.exports = function(app){
    /**
     * Model Routes
     */
    <% for(var name in config.models){  %>
        require('./<%= name %>')(app);
    <% } %>

}