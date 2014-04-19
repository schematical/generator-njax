var path = require('path');
var fs = require('fs');
module.exports = function(app, uri){
    if(!uri) uri = '/<%= _model.name.toLowerCase() %>s';

    app.param('<%= _model.name.toLowerCase() %>', populate)
    app.get(uri, render_list);
    app.get(uri + '/new', render_edit);
    app.get(uri + '/:<%= _model.name.toLowerCase() %>', render_detail);
    app.get(
        uri + '/:<%= _model.name.toLowerCase() %>/edit',

            render_edit

    );
    app.post(
        uri,
        [
            <% if(_model.file_fields){ %>
                app.njax.s3.route(['<%= _model.file_fields %>']),
            <% } %>
            create
        ]
    );
    app.put(
        uri + '/:<%= _model.name.toLowerCase() %>',
        [
            <% if(_model.file_fields){ %>
            app.njax.s3.route(['<%= _model.file_fields %>']),
            <% } %>
            update
        ]
    );


    function populate(req, res, next, id){
        console.log("Populating <%= _.capitalize(_model.name) %>: " + id);
        app.model.<%= _.capitalize(_model.name) %>.findOne({ hash: id }, function(err, <%= _model.name.toLowerCase() %>){
            if(err){
                return next(err);
            }
            console.log("Populatinged! <%= _.capitalize(_model.name) %>: " + id);
            req.<%= _model.name.toLowerCase() %> = <%= _model.name.toLowerCase() %>;//TODO:Bootstrap
            return next();
        })
    }
    function render_list(req, res, next){
        console.log("HIT");
        res.render('model/<%= _model.name.toLowerCase() %>_list');
    }
    function render_detail(req, res, next){
        if(!req.<%= _model.name.toLowerCase() %>){
            return next();
        }
        res.render('model/<%= _model.name.toLowerCase() %>_detail');
    }
    function render_edit(req, res, next){
        if(!req.<%= _model.name.toLowerCase() %>){
            //return next();
            req.<%= _model.name.toLowerCase() %> = new app.model.<%= _.capitalize(_model.name) %>();
        }
        res.render('model/<%= _model.name.toLowerCase() %>_edit');
    }
    function create(req, res, next){
        if(!req.user){
            return res.redirect('/');
        }
        if(!req.<%= _model.name.toLowerCase() %>){
            req.<%= _model.name.toLowerCase() %> = new app.model.Project();
        }
        return update(req, res, next);

    }

    function update(req, res, next){
        if(!req.user){
            return res.redirect('/');
        }
        if(!req.<%= _model.name.toLowerCase() %>){
            return next(new Error('<%= _.capitalize(_model.name) %> not found'));
        }

        <% for(var name in _model.fields){  %>
        req.<%= _model.name.toLowerCase() %>.<%= name %> = req.body.<%= name %>;
        <% } %>

        req.<%= _model.name.toLowerCase() %>.save(function(err, <%= _model.name.toLowerCase() %>){
            //app._refresh_locals();
            res.render('model/<%= _model.name.toLowerCase() %>_edit', { <%= _model.name.toLowerCase() %>: req.<%= _model.name.toLowerCase() %>.toObject() });
        });

    }

}