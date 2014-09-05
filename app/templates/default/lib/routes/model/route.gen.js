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
            app.locals.partials._<%= _model.name.toLowerCase() %>_edit_form = 'model/_<%= _model.name %>_edit_form';
            app.locals.partials._<%= _model.name.toLowerCase() %>_list_single = 'model/_<%= _model.name %>_list_single';
            app.param('<%= _model.name.toLowerCase() %>', route.populate)


            app.post(
                uri,
                [
                    <% if(_model.file_fields){ %>
                        app.njax.s3.route(['<%= _model.file_fields %>']),
                    <% } %>
                    route.pre_create,
                    route.create,
                    route.update,
                    route.pre_update_save,
                    route.update_save,
                    route.post_create,
                    route.render_detail
                ]
            );
            app.post(
                uri + '/new',
                [
                    <% if(_model.file_fields){ %>
                        app.njax.s3.route(['<%= _model.file_fields %>']),
                    <% } %>
                    route.validate,
                    route.pre_create,
                    route.create,
                    route.update,
                    route.pre_update_save,
                    route.update_save,
                    route.post_create,
                    route.bootstrap_detail,
                    route.render_detail
                ]
            );
            app.post(
                uri + '/:<%= _model.name.toLowerCase() %>',
                [
                    route.auth_update,
                    <% if(_model.file_fields){ %>
                    app.njax.s3.route(['<%= _model.file_fields %>']),
                    <% } %>
                    route.validate,
                    route.pre_update,
                    route.update,
                    route.pre_update_save,
                    route.update_save,
                    route.post_update,
                    route.bootstrap_detail,
                    route.render_detail
                ]
            );
            <% if(_model.fields.archiveDate){ %>
                app.delete(
                    uri + '/:<%= _model.name.toLowerCase() %>',
                    [
                        route.auth_update,
                        route.pre_remove,
                        route.remove,
                        route.post_remove,
                        route.bootstrap_detail,
                        route.render_remove
                    ]
                );
            <% } %>

            app.all(uri, [
                route.populate_list_query,
                route.populate_list,
                route.bootstrap_list,
                route.render_list
            ]);
            app.all(uri + '/new', [
                route.bootstrap_edit,
                route.render_edit
            ]);

            app.all(uri + '/:<%= _model.name.toLowerCase() %>', [
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:<%= _model.name.toLowerCase() %>/edit', [
                route.auth_update,
                route.bootstrap_edit,
                route.render_edit
            ]);


        },
        auth_update:function(req, res, next){
            <% if(_model.fields.owner){ %>
                if(req.user && (req.<%= _model.name %>.owner == req.user._id) || (req.is_admin)){
                    return  next();//We have a legit users
                }
                return next(404);//We do not have a legit user
            <% } %>
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
                var query = {
                    $and:[
                        { $or: or_condition }

                    <% if(_model.fields.archiveDate){ %>
                        ,
                        { $or: [
                            { archiveDate: { $gt: new Date() } },
                            { archiveDate: null }
                        ] }

                    <% } %>
                     ]
                };
                app.model.<%= _.capitalize(_model.name) %>.findOne(query, function(err, <%= _model.name.toLowerCase() %>){
                    if(err){
                        return next(err);
                    }
                    if(<%= _model.name.toLowerCase() %>){
                        res.bootstrap('<%= _model.name %>', <%= _model.name.toLowerCase() %>);
                    }
                    return next();
                });
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
                    res.bootstrap('<%= _model.name %>', model);
                }
                return next();


            <% } %>


        },
        render_remove:function(req, res, next){
            res.render('model/<%= _model.name.toLowerCase() %>_list', res.locals.<%= _model.name %>s);
        },
        render_list:function(req, res, next){
            res.render('model/<%= _model.name.toLowerCase() %>_list', res.locals.<%= _model.name %>s);
        },
        populate_list_query:function(req, res, next){
            var query = _.clone(route.read_query(req));
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            <% for(var name in _model.fields){  %>
                <% if(_model.fields[name].type == 's3-asset'){ %>
                <% }else if(_model.fields[name].type == 'ref'){ %>
                if(req.query.<%= name %>){
                    if(checkForHexRegExp.test(req.query.<%= name %>)){
                        query['<%= name %>'] = req.query.<%= name %>;
                    }
                }
                <% }else if(_model.fields[name].type == 'array'){ %>
                <% }else if(_model.fields[name].type == 'array'){ %>
                <% }else if(_model.fields[name].type == 'date'){ %>
                <% }else{ %>
                    if(req.query.<%= name %>){
                        query['<%= name %>'] =   { $regex: new RegExp('^' + req.query.<%= name %> + '', 'i') };
                    }
                <% } %>
            <% } %>


            req._list_query = query;
            return next();
        },
        populate_list:function(req, res, next){
            var query = req._list_query;
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
                        var <%= _model.name %>_data = <%= _model.name %>s[i].toObject();
                        <% if(_model.fields.owner){ %>
                            if(req.user && (<%= _model.name %>s[i].owner == req.user._id)){
                                <%= _model.name %>_data._user_is_owner = true;
                            }
                        <% } %>
                        res.locals.<%= _model.name %>s.push(
                            <%= _model.name %>_data
                        );
                    }
                    return cb();
                },
                function(cb){
                    return next();
                }
            ]);
        },
        render_detail:function(req, res, next){
            if(!req.<%= _model.name %>){
                return next();
            }

            <% if(_model.fields.owner){ %>
                if(req.user && req.<%= _model.name %> && req.<%= _model.name %>.owner == req.user._id){
                    res.locals._user_is_owner = true;
                }
            <% } %>

            res.render('model/<%= _model.name.toLowerCase() %>_detail', req.<%= _model.name %>.toObject());
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
            if(!req.<%= _model.name %>){
                req.<%= _model.name %> = new app.model.<%= _.capitalize(_model.name) %>({
                    <% for(var i in _model._rels){ %>
                            <%= _model._rels[i].name %>:(<%= _model._rels[i].bootstrap_populate %> && <%= _model._rels[i].bootstrap_populate %>._id || null),
                    <% } %>
                    cre_date:new Date()
                });
            }
            return next();

        },
        update:function(req, res, next){
            if(!req.user){
                return next();//res.redirect('/');
            }
            if(!req.<%= _model.name %>){
                return next();
                //return next(new Error('<%= _.capitalize(_model.name) %> not found'));
            }

            <% for(var name in _model.fields){  %>
                <% if(_model.fields[name].type == 's3-asset'){ %>
                    if(req.njax.files && req.njax.files.<%= name %>){
                        req.<%= _model.name %>.<%= name %> = req.njax.files.<%= name %>;
                    }
                <% }else if(_model.fields[name].type == 'ref'){ %>
                    if(req.<%= _model.fields[name].ref %>){
                        req.<%= _model.name %>.<%= name %> = req.<%= _model.fields[name].ref %>._id;
                    }else if(req.body.<%= name %>){
                        req.<%= _model.name %>.<%= name %> = req.body.<%= name %>;
                    }
                <% }else if(_model.fields[name].type == 'array'){ %>
                    //Do nothing it is an array
                    //req.<%= _model.name.toLowerCase() %>.<%= name %> = req.body.<%= name %>;
                <% }else{ %>
                    req.<%= _model.name %>.<%= name %> = req.body.<%= name %>;
                <% } %>
            <% } %>

            return next();

        },
        update_save:function(req, res, next){
            req.<%= _model.name %>.save(function(err, <%= _model.name %>){
                //app._refresh_locals();
                res.bootstrap('<%= _model.name %>', req.<%= _model.name %>);
                return next();
            });
        },
        query:function(req, res, next){
            return next();
        },
        pre_update_save:function(req, res, next){
            return next();
        },
        bootstrap_list:function(req, res, next){
            return next();
        },
        bootstrap_detail:function(req, res, next){
            <% if(_model.fields.owner){ %>
                if(req.user && req.<%= _model.name %> && req.<%= _model.name %>.owner && (req.<%= _model.name %>.owner.equals(req.user._id))){
                    res.bootstrap('is_owner', true);
                }else{
                    res.bootstrap('is_owner', false);
                }
            <% } %>
            return next();
        },
        bootstrap_edit:function(req, res, next){
            return next();
        },
        validate:function(req, res, next){
            return next();
        },
        pre_update:function(req, res, next){
            return next();
        },
        pre_create:function(req, res, next){
            return next();
        },
        pre_create_properties:function(req, res, next){
            return next();
        },
        pre_remove:function(req, res, next){
            return next();
        },
        post_update:function(req, res, next){
            return next();
        },
        post_create:function(req, res, next){
            return next();
        },
        post_remove:function(req, res, next){
                return next();
        },
        broadcast_create:function(req, res, next){
            <% if(_model.fields.owner){ %>
                app.njax.broadcast([ req.user ], '<%= _model.name %>.create', { <%= _model.name %>: req.<%= _model.name %>.toObject() });
                return next();
            <% } else { %>
                return next();
            <% } %>
        },
        broadcast_update:function(req, res, next){
            <% if(_model.fields.owner){ %>
                app.njax.broadcast([ req.usyoer ], '<%= _model.name %>.update', { <%= _model.name %>: req.<%= _model.name %>.toObject() });
                return next();
            <% } else { %>
                return next();
            <% } %>
        },
        broadcast_remove:function(req, res, next){
            <% if(_model.fields.owner){ %>
                app.njax.broadcast([ req.user ], '<%= _model.name %>.remove', { <%= _model.name %>: req.<%= _model.name %>.toObject() });
                return next();
            <% } else { %>
                return next();
            <% } %>
        },
        <% if(_model.fields.archiveDate){ %>
            remove:function(req, res,next){
                if(!req.user){
                    return next();
                }
                req.<%= _model.name %>.archive(function(err){
                    if(err) return next(err);
                    return next();
                });
            }
        <% } %>
    }

    route.read_query = route.owner_query;
    route.write_query = route.owner_query;

    return route;

}