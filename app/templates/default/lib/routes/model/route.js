var path = require('path');
var fs = require('fs');
var async = require('async');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = function(app, uri){
    if(!uri) uri = '<%= _model.uri %>';

    app.param('<%= _model.name.toLowerCase() %>', populate)

    app.get(uri, render_list);
    app.get(uri + '/new', render_edit);

    app.get(uri + '/:<%= _model.name.toLowerCase() %>', render_detail);
    app.get(uri + '/:<%= _model.name.toLowerCase() %>/edit',render_edit);

    app.post(
        uri,
        [
            <% if(_model.file_fields){ %>
                app.njax.s3.route(['<%= _model.file_fields %>']),
            <% } %>
            create
        ]
    );
    app.post(
        uri + '/new',
        [
            <% if(_model.file_fields){ %>
                app.njax.s3.route(['<%= _model.file_fields %>']),
            <% } %>
            create
        ]
    );
    app.post(
        uri + '/:<%= _model.name.toLowerCase() %>',
        [
            <% if(_model.file_fields){ %>
            app.njax.s3.route(['<%= _model.file_fields %>']),
            <% } %>
            update
        ]
    );


    function populate(req, res, next, id){
        var or_condition = []


        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
        if(checkForHexRegExp.test(id)){
            or_condition.push({ _id:new ObjectId(id) });
        }
        <% if(_model.fields.namespace){ %>
            or_condition.push({ namespace:id });
        <% } %>
        if(or_condition.length == 0){
            return next();
        }
        var query = { $or: or_condition };
        app.model.<%= _.capitalize(_model.name) %>.findOne(query, function(err, <%= _model.name.toLowerCase() %>){
            if(err){
                return next(err);
            }

            res.bootstrap('<%= _model.name.toLowerCase() %>', <%= _model.name.toLowerCase() %>);
            return next();
        })
    }

    function render_list(req, res, next){
        app.model.<%= _.capitalize(_model.name) %>.find({}, function(err, <%= _model.name %>){
            if(err) return next(err);
            res.locals.<%= _model.name %> = <%= _model.name %>;
            res.render('model/<%= _model.name.toLowerCase() %>_list');
        });
    }
    function render_detail(req, res, next){
        if(!req.<%= _model.name.toLowerCase() %>){
            return next();
        }
        res.render('model/<%= _model.name.toLowerCase() %>_detail');
    }
    function render_edit(req, res, next){
        async.series([
            function(cb){
                if(!req.<%= _model.name.toLowerCase() %>){
                    //return next();
                    req.<%= _model.name.toLowerCase() %> = new app.model.<%= _.capitalize(_model.name) %>();
                }
                return cb();
            },
            <% for(var i in _model._rels){ %>
            function(cb){
                if(req.<%= _model._rels[i].ref %>){
                    return cb();
                }
                app.model.<%= _.capitalize(_model._rels[i].ref) %>.find({ }, function(err, <%= _model._rels[i].ref %>s){
                    if(err) return next(err);
                    var <%= _model._rels[i].ref %>_objs = [];
                    for(var i in <%= _model._rels[i].ref %>s){
                        var <%= _model._rels[i].ref %>_obj = <%= _model._rels[i].ref %>s[i].toObject();
                        <%= _model._rels[i].ref %>_obj._selected = (req.<%= _model.name %>.<%= _model._rels[i].ref %> == <%= _model._rels[i].ref %>s[i]._id);
                        <%= _model._rels[i].ref %>_objs.push(<%= _model._rels[i].ref %>_obj);
                    }
                    res.bootstrap('<%= _model._rels[i].ref %>s', <%= _model._rels[i].ref %>_objs);
                    return cb();
                });
            },
            <% } %>
            function(cb){

                res.render('model/<%= _model.name.toLowerCase() %>_edit');
            }
        ]);
    }
    function create(req, res, next){
        if(!req.user){
            return res.redirect('/');
        }
        if(!req.<%= _model.name.toLowerCase() %>){
            req.<%= _model.name.toLowerCase() %> = new app.model.<%= _.capitalize(_model.name) %>();
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
            <% if(_model.fields[name].type == 's3-asset'){ %>
                req.<%= _model.name.toLowerCase() %>.<%= name %> = req.files.<%= name %>.s3_path;
            <% }else{ %>
                req.<%= _model.name.toLowerCase() %>.<%= name %> = req.body.<%= name %>;
            <% } %>
        <% } %>

        req.<%= _model.name.toLowerCase() %>.save(function(err, <%= _model.name.toLowerCase() %>){
            //app._refresh_locals();
            res.render('model/<%= _model.name.toLowerCase() %>_detail', { <%= _model.name.toLowerCase() %>: req.<%= _model.name.toLowerCase() %>.toObject() });
        });

    }

}