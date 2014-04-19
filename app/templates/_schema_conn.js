'use strict';
module.exports = function(app){
    <% for(var name in config.models){  %>
        app.model.<%= _.capitalize(_model.name) %> =   require('./<%= name %>');
    <% } %>
}