var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var ObjectId = require('mongoose').Types.ObjectId;
module.exports = function(app){

     var route = app.njax.routes.<%= _model.name.toLowerCase() %> = {
        <% if(_model.fields.owner){ %>
            owner_query:function(req){
                if(!<%= _model.fields.owner.bootstrap_populate %>){
                    return null;
                }
                return {
                    owner:<%= _model.fields.owner.bootstrap_populate %>._id
                }
            },
        <% } else { %>
            owner_query:function(){
                return { }
            },
        <% } %>
        init:function(uri){

            if(!uri) uri = '<%= _model.uri %>';
            app.locals.partials._<%= _model.name.toLowerCase() %>_edit_form = 'model/_<%= _model.name.toLowerCase() %>_edit_form';
            app.param('<%= _model.name.toLowerCase() %>', route.populate)


            app.post(
                uri,
                [
                    <% if(_model.file_fields){ %>
                        app.njax.s3.route(['<%= _model.file_fields %>']),
                    <% } %>
                    route.create,
                    route.render_detail
                ]
            );
            app.post(
                uri + '/new',
                [
                    <% if(_model.file_fields){ %>
                        app.njax.s3.route(['<%= _model.file_fields %>']),
                    <% } %>
                    route.create,
                    route.render_detail
                ]
            );
            app.post(
                uri + '/:<%= _model.name.toLowerCase() %>',
                [
                    <% if(_model.file_fields){ %>
                    app.njax.s3.route(['<%= _model.file_fields %>']),
                    <% } %>
                    route.update,
                    route.render_detail
                ]
            );

            app.all(uri, route.render_list);
            app.all(uri + '/new', route.render_edit);

            app.all(uri + '/:<%= _model.name.toLowerCase() %>', route.render_detail);
            app.all(uri + '/:<%= _model.name.toLowerCase() %>/edit', route.render_edit);


        },
        populate:function(req, res, next, id){
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            <% if(!_model.is_subdocument){ %>
            var or_condition = []

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
                if(<%= _model.name.toLowerCase() %>){
                    res.bootstrap('<%= _model.name.toLowerCase() %>', <%= _model.name.toLowerCase() %>);
                }
                return next();
            })
            <% }else{ %>
                var model = null;

                for(var i = 0; i < req.<%= _model.parent %>.<%= _model.name.toLowerCase() %>s.length; i++){
                    //it is an id
                    if(checkForHexRegExp.test(id) && req.<%= _model.parent %>.<%= _model.name.toLowerCase() %>s[i]._id == id){
                        model = req.<%= _model.parent %>.<%= _model.name.toLowerCase() %>s[i];
                    } <% if(_model.fields.namespace){ %>else if(req.<%= _model.parent %>.<%= _model.name.toLowerCase() %>s[i].namespace == id){
                        model = req.<%= _model.parent %>.<%= _model.name.toLowerCase() %>s[i];
                    }  <% } %>
                }

                if(model){
                    res.bootstrap('<%= _model.name.toLowerCase() %>', model);
                }
                return next();


            <% } %>


        },
        render_list:function(req, res, next){
            var query = _.clone(route.owner_query(req));
            if(!query){
                return next();
            }
            var <%= _model.name %>s = null;
            async.series([
                function(cb){
                    <% if(!_model.is_subdocument){ %>
                        app.model.<%= _.capitalize(_model.name) %>.find(query, function(err, _<%= _model.name %>s){
                            if(err) return next(err);
                            <%= _model.name %>s = _<%= _model.name %>s;
                            return cb();
                        });
                    <% } else { %>
                        <%= _model.name %>s = _.clone(req.<%= _model.parent %>.<%= _model.name %>s);
                        return cb();
                    <% } %>
                },
                function(cb){
                    res.locals.<%= _model.name %>s = [];
                    for(var i in <%= _model.name %>s){
                        res.locals.<%= _model.name %>s.push(
                            <%= _model.name %>s[i].toObject()
                        );
                    }
                    return cb();
                },
                function(cb){
                    res.render('model/<%= _model.name.toLowerCase() %>_list', res.locals.symbols);
                }
            ]);
        },
        render_detail:function(req, res, next){
            if(!req.<%= _model.name.toLowerCase() %>){
                return next();
            }
            res.render('model/<%= _model.name.toLowerCase() %>_detail', req.<%= _model.name.toLowerCase() %>.toObject());
        },
        render_edit:function(req, res, next){
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
        },
        create:function(req, res, next){
            if(!req.user){
                return res.redirect('/');
            }
            if(!req.<%= _model.name.toLowerCase() %>){
                req.<%= _model.name.toLowerCase() %> = new app.model.<%= _.capitalize(_model.name) %>({
                    <% for(var i in _model._rels){ %>
                            <%= _model._rels[i].ref %>:(req.<%= _model._rels[i].ref %> || null),
                    <% } %>
                    cre_date:new Date()
                });
            }
            return route.update(req, res, next);

        },
        update:function(req, res, next){
            if(!req.user){
                return next();//res.redirect('/');
            }
            if(!req.<%= _model.name.toLowerCase() %>){
                return next();
                //return next(new Error('<%= _.capitalize(_model.name) %> not found'));
            }

            <% for(var name in _model.fields){  %>
                <% if(_model.fields[name].type == 's3-asset'){ %>
                    if(req.files.<%= name %>){
                        req.<%= _model.name.toLowerCase() %>.<%= name %> = req.files.<%= name %>.s3_path;
                    }
                <% }else if(_model.fields[name].type == 'ref'){ %>
                    if(req.<%= _model.fields[name].ref %>){
                        req.<%= _model.name.toLowerCase() %>.<%= name %> = req.<%= _model.fields[name].ref %>._id;
                    }else if(req.body.<%= name %>){
                        req.<%= _model.name.toLowerCase() %>.<%= name %> = req.body.<%= name %>;
                    }
                <% }else if(_model.fields[name].type == 'array'){ %>
                    //Do nothing it is an array
                    //req.<%= _model.name.toLowerCase() %>.<%= name %> = req.body.<%= name %>;
                <% }else{ %>
                    req.<%= _model.name.toLowerCase() %>.<%= name %> = req.body.<%= name %>;
                <% } %>
            <% } %>

            req.<%= _model.name.toLowerCase() %>.save(function(err, <%= _model.name.toLowerCase() %>){
                //app._refresh_locals();
                return next();
                //res.render('model/<%= _model.name.toLowerCase() %>_detail', { <%= _model.name.toLowerCase() %>: req.<%= _model.name.toLowerCase() %>.toObject() });
            });

        }
    }
    return route;

}