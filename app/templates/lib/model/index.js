'use strict';
module.exports = function(app){
    <% for(var name in config.models){  %>
        app.model.<%= _.capitalize(name) %> =  require('./<%= name %>')(app);
    <% } %>
}