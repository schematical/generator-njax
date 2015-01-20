var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

module.exports = function(app){
    var ObjectId = app.mongoose.Types.ObjectId;
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
        <% } else if(_model.parent){ %>
			owner_query:function(req){
				if(!<%= _model.fields[_model.parent].bootstrap_populate %>){
					return null;
				}
				return {
					<%=_model.parent %>:<%= _model.fields[_model.parent].bootstrap_populate %>._id.toString()
				}
			},
		<% } else { %>
            owner_query:function(){
                return { }
            },
        <% } %>

        init:function(uri){

            if(!uri) uri = '<%= _model.uri %>';
            app.locals.partials._<%= _model.name %>_edit_form = 'model/_<%= _model.name %>_edit_form';
            app.locals.partials._<%= _model.name %>_list_single = 'model/_<%= _model.name %>_list_single';
            app.param('<%= _model.name.toLowerCase() %>', route.populate)


            app.post(
                uri,
                [
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'create';
						req.njax.entity = '<%= _model.name %>';
						return next();
					},
                    route.auth_create,
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
                    route.broadcast_create,
                    route.redirect_detail
                ]
            );
            app.post(
                uri + '/new',
                [
                	function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'create';
						req.njax.entity = '<%= _model.name %>';
						return next();
                	},
                    route.auth_create,
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
                    route.broadcast_create,
                    route.redirect_detail
                ]
            );
            app.post(
                uri + '/:<%= _model.name.toLowerCase() %>',
                [
					function(req, res, next){
						if(!req.njax){
							req.njax = {};
						}
						req.njax.action = 'update';
						req.njax.entity = '<%= _model.name %>';
						return next();
					},
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
                    route.broadcast_update,
                    route.render_detail
                ]
            );
            <% if(_model.fields.archiveDate){ %>
                app.delete(
                    uri + '/:<%= _model.name.toLowerCase() %>',
                    [
						function(req, res, next){
							if(!req.njax){
								req.njax = {};
							}
							req.njax.action = 'remove';
							req.njax.entity = '<%= _model.name %>';
							return next();
						},
                        route.auth_update,
                        route.pre_remove,
                        route.remove,
                        route.post_remove,
                        route.bootstrap_detail,
                        route.broadcast_remove,
                        route.render_remove
                    ]
                );
            <% } %>

            app.all(uri, [
				route.populate_tag_query,
                route.populate_list_query,
                route.populate_list,
                route.bootstrap_list,
                route.render_list
            ]);
            app.all(uri + '/new', [
            	route.auth_create,
                route.bootstrap_edit,
                route.render_edit
            ]);

            app.all(uri + '/:<%= _model.name.toLowerCase() %>', [
                route.bootstrap_detail,
                route.render_detail
            ]);
            app.all(uri + '/:<%= _model.name.toLowerCase() %>/edit', [
            	function(req, res, next){
					if(!req.<%= _model.name %>){
						return next(new Error(404));
					}
					return next();
            	},
                route.auth_update,
                route.bootstrap_edit,
                route.render_edit
            ]);
            <% if(_model.relationship != 'assoc'){ %>
            	app.post(uri +  '/:<%= _model.name.toLowerCase() %>/tags',[
            		route.validate_tag,
					route.create_tag,
					route.broadcast_update,
					route.render_tag
				]);
				app.delete(uri +  '/:<%= _model.name.toLowerCase() %>/tags/:tag',[
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.remove_tag,
					route.broadcast_update,
					route.render_tag
				]);
				app.all(uri +  '/:<%= _model.name.toLowerCase() %>/tags',[
					route.list_tags,
					route.render_tags
				]);
				app.all(uri +  '/:<%= _model.name.toLowerCase() %>/tags/:tag',[
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.render_tag
				]);




				/*
				//For now we will use the trigger event
				app.post(uri +  '/:<%= _model.name.toLowerCase() %>/events',[
					route.create_event,
					route.broadcast_event,
					route.render_tag
				]);
				//We dont need to remove events at this point
				app.delete(uri +  '/:<%= _model.name.toLowerCase() %>/events/:event',[
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.remove_event,
					route.render_event
				]);
				*/

				app.all(uri +  '/:<%= _model.name.toLowerCase() %>/events',[
					route.list_events,
					route.render_events
				]);
				app.all(uri +  '/:<%= _model.name.toLowerCase() %>/events/:event',[
					function(req, res, next){
						if(!req.tag){
							return next(new Error(404));
						}
						return next();
					},
					route.render_events
				]);


            <% } %>


        },
        auth_update:function(req, res, next){
            <% if(_model.fields.owner){ %>
            	<% if(_model.fields.owner.type == 'ref'){ %>
					if(req.user && (req.<%= _model.name %> && (req.<%= _model.name %>.owner && req.<%= _model.name %>.owner.equals(req.user._id)) || (req.is_admin))){
						return  next();//We have a legit users
					}
                <% } else { %>
					if(req.user && (req.<%= _model.name %> && (req.<%= _model.name %>.owner && req.<%= _model.name %>.owner == req.user._id) || (req.is_admin))){
						return  next();//We have a legit users
					}
				<% } %>
                return next(new Error(403));//We do not have a legit user
            <% }else{ %>
                if(!req.user){
                    return next(new Error(403));//res.redirect('/');
                }
                return next();
             <% } %>
        },
        auth_create:function(req, res, next){
             //ENtities that have not been created do not have an owner to manage
             if(!req.user){
                 return next(new Error(404));//res.redirect('/');
             }
             return next();

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
					<% if(_model.invitable){ %>
						/*,
						{ owner: {'$ne': null } }*/

					<% } %>
                     ]
                };


				<% if(_model.parent){ %>
					<% if(_model.parent == 'owner'){ %>
						if(req.account){
							query['<%= _model.parent %>'] = req.account._id;
						}
					<% } else{ %>
						if(<%= _model.fields[_model.parent].bootstrap_populate %>){
							query['<%= _model.parent %>'] = <%= _model.fields[_model.parent].bootstrap_populate %>._id;
						}
					<% } %>
				<% } %>
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
            res.render('model/<%= _model.name %>_list', res.locals.<%= _model.name %>s);
        },
        render_list:function(req, res, next){
            res.render('model/<%= _model.name %>_list', res.locals.<%= _model.name %>s);
        },
		populate_tag_query:function(req, res, next){

			if(!req.query.tags){
				return next();
			}
			if(!req._list_query){
				req._list_query = _.clone(route.read_query(req));
			}
			var tag_query = [];
			var tags = req.query.tags.split(',');
			for(var i in tags){
				tag_query.push({ value: tags[i] });
			}

			return app.njax.tags.query(
				{
					tag_query:tag_query,
					entity_type:"<%= _.capitalize(_model.name) %>"
				},
				function(err, entites){
					if(err) return next(err);
					var entity_id_query = [];
					if(entites.length == 0){
						req._list_query = false;
						return next();
					}
					for(var i in entites){
						entity_id_query.push({ _id: entites[i].entity_id });
					}

					req._list_query.$or = entity_id_query;


					return next();
				}
			);

		},
        populate_list_query:function(req, res, next){
			if(!req._list_query){
				if(req._list_query === false){
					//Then they tried to tag search and it returned no results
					return next();
				}else{
					req._list_query = _.clone(route.read_query(req));
					if(!req._list_query){
						req._list_query = {}; //return next();//TODO: Fix this so its secure
					}

				}
			}



			<% if(_model.fields.archiveDate){ %>
				req._list_query = {
					$and:[
						req._list_query,
						{ $or: [
							{ archiveDate: { $gt: new Date() } },
							{ archiveDate: null }
						] }
					]
				}
			<% } %>
			<% if(_model.invitable){ %>
				<% if(_model.fields.owner){ %>
					req._list_query.$and.push({ owner: {'$ne': null } });
				<% } %>
				<% if(_model.fields.account){ %>
					req._list_query.$and.push({ account: {'$ne': null } });
				<% } %>
			<% } %>



            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            <% for(var name in _model.fields){  %>
                <% if(_model.fields[name].type == 's3-asset'){ %>


                <% }else if(_model.fields[name].type == 'ref' && _model.fields[name].is_parent && (name != 'owner')){ %>
				if(<%= _model.fields[name].bootstrap_populate %>){
					req._list_query['<%= name %>'] = <%= _model.fields[name].bootstrap_populate %>._id;
                }else if(req.query.<%= name %>){
                    if(checkForHexRegExp.test(req.query.<%= name %>)){
						req._list_query['<%= name %>'] = req.query.<%= name %>;
                    }
                }
                <% }else if(_model.fields[name].type == 'ref'){ %>
                    if(req.query.<%= name %>){
                        req._list_query['<%= name %>'] = req.query.<%= name %>;
                    }
                <% }else if(_model.fields[name].type == 'array'){ %>
                <% }else if(_model.fields[name].type == 'date'){ %>
                <% }else if(_model.fields[name].type == 'boolean'){ %>
                    if(req.query.<%= name %>) {
                        req._list_query['<%= name %>'] = (req.query.<%= name %>.toLowerCase() === 'true');
                    }
                <% }else{ %>
                    if(req.query.<%= name %>){
						req._list_query['<%= name %>'] =   { $regex: new RegExp('^' + req.query.<%= name %> + '', 'i') };
                    }
                <% } %>
            <% } %>



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
							res.bootstrap('<%= _model.name %>s', <%= _model.name %>s);
                            return cb();
                        });
                    <% } else { %>
                        <%= _model.name %>s = _.clone(req.<%= _model.parent %>.<%= _model.name %>s);
						res.bootstrap('<%= _model.name %>s', <%= _model.name %>s);
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

            res.render('model/<%= _model.name %>_detail', req.<%= _model.name %>.toObject());
        },
        redirect_detail:function(req, res, next){
  			if(!req.<%= _model.name %>){
                return next();
            }
            if(req.njax.call_type == 'www'){
				return res.redirect(req.<%= _model.name %>.uri);
            }
            return route.render_detail(req, res, next);

        },
        redirect_edit:function(req, res, next){
  			if(!req.<%= _model.name %>){
                return next();
            }

            res.redirect(req.<%= _model.name %>.uri + '/edit');
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
                <% if(_model._rels[i].type == 'ref'){ %>
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
                <% } %>
                function(cb){

                    res.render('model/<%= _model.name %>_edit');
                }
            ]);
        },
        create:function(req, res, next){

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

            if(!req.<%= _model.name %>){
                return next();
                //return next(new Error('<%= _.capitalize(_model.name) %> not found'));
            }

            <% for(var name in _model.fields){  %>
                <% if(_model.fields[name].type == 's3-asset'){ %>
                    if(req.njax.files && req.njax.files.<%= name %>){
                        req.<%= _model.name %>.<%= name %> = req.njax.files.<%= name %>;
                    }
                <% }else if((_model.fields[name].type == 'ref') || (_model.fields[name].type == 'core_ref')){ %>
                	<% if(name == 'owner'){ %>
						if(!req.<%= _model.name %>.<%= name %> && <%= _model.fields[name].bootstrap_populate %>){
							req.<%= _model.name %>.<%= name %> = <%= _model.fields[name].bootstrap_populate %>._id;
						}
                	<% }else{ %>
						if(<%= _model.fields[name].bootstrap_populate %>){
							req.<%= _model.name %>.<%= name %> = <%= _model.fields[name].bootstrap_populate %>._id;
						}else if(req.body.<%= name %>){
							req.<%= _model.name %>.<%= name %> = req.body.<%= name %>;
						}
					<% } %>
                <% }else if(_model.fields[name].type == 'array'){ %>
                    //Do nothing it is an array
                    //req.<%= _model.name.toLowerCase() %>.<%= name %> = req.body.<%= name %>;
                <% }else if(_model.fields[name].type == 'object'){ %>
                	if(req.body.<%= name %>){
                    	req.<%= _model.name %>.<%= name %> = req.body.<%= name %>;
                    	req.<%= _model.name %>.markModified('<%= name %>');
					}
                <% }else{ %>
					if(req.body.<%= name %>){
                    	req.<%= _model.name %>.<%= name %> = req.body.<%= name %>;
					}
                <% } %>
            <% } %>

            return next();

        },
        update_save:function(req, res, next){
            if(!req.<%= _model.name %>){
                return next();
            }
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


				<% if(_model.fields.owner.type == 'ref'){ %>
					if(req.user && req.<%= _model.name %> && req.<%= _model.name %>.owner && (req.<%= _model.name %>.owner.equals(req.user._id))){
						res.bootstrap('is_owner', true);
					}else{
						res.bootstrap('is_owner', false);
					}
				<% } else { %>
					if(req.user && req.<%= _model.name %> && req.<%= _model.name %>.owner && (req.<%= _model.name %>.owner == req.user._id)){
						res.bootstrap('is_owner', true);
					}else{
						res.bootstrap('is_owner', false);
					}
				<% } %>
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
		validate_tag:function(req, res, next){
			if(!req.body.type){
				return next(new Error("Ivalid type"));
			}
			return next();
		},
		create_tag:function(req, res, next){
			if(!req.<%= _model.name %>){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.<%= _model.name %>,
				function(err, tag){
					if(err) return next(err);
					res.bootstrap('tag', tag);
					return next();
				}
			);
		},
		remove_tag:function(req, res, next){
			if(!req.tag){
				return next(new Error(404));
			}
			return req.tag.remove(function(err){
				if(err) return next(err);
				return next();
			});
		},
		list_tags:function(req, res, next){
			app.njax.tags.query(req.<%= _model.name %>, function(err, tags){
				if(err) return next(err);
				res.bootstrap('tags', tags);
				return next();
			});
		},
		render_tags:function(req, res, next){
			return res.render('model/tags_list', res.locals.tags);
		},
		render_tag:function(req, res, next){
			return res.render('model/tag_detail', res.locals.tag);
		},



		/*
		create_event:function(req, res, next){
			if(!req.<%= _model.name %>){
				return next(new Error(404));
			}
			//TODO: Add validation
			return app.njax.tags.add(
				req.body,
				req.<%= _model.name %>,
				function(err, tag){
					if(err) return next(err);
					res.bootstrap('event', event);
					return next();
				}
			);
		},
		remove_event:function(req, res, next){
			if(!req.event){
				return next(new Error(404));
			}
			return req.event.remove(function(err){
				if(err) return next(err);
				return next();
			});
		},
		*/
		list_events:function(req, res, next){
			app.njax.events.query(req.<%= _model.name %>, function(err, events){
				if(err) return next(err);
				res.bootstrap('events', events);
				return next();
			});
		},
		render_events:function(req, res, next){
			return res.render('model/event_list', res.locals.events);
		},
		render_event:function(req, res, next){
			return res.render('model/event_detail', res.locals.event);
		},

        broadcast_create:function(req, res, next){
            <% if(_model.fields.owner){ %>
                app.njax.broadcast(
                    [ req.user ],
                    '<%= _model.name %>.create',
                    {
                        user:req.user.toObject(),
                        <%= _model.name %>: req.<%= _model.name %>.toObject(),
						_url:req.<%= _model.name %>.url,
						_entity_type:req.<%= _model.name %>._njax_type
                    }
                );
                return next();
            <% } else { %>
                return next();
            <% } %>
        },
        broadcast_update:function(req, res, next){
            <% if(_model.fields.owner){ %>

                    app.njax.broadcast(
                        [ req.user ],
                        '<%= _model.name %>.update',
                        {
                            user:req.user.toObject(),
                            <%= _model.name %>: req.<%= _model.name %>.toObject(),
							_url:req.<%= _model.name %>.url,
							_entity_type:req.<%= _model.name %>._njax_type
                        }
                    );

                return next();
            <% } else { %>
                return next();
            <% } %>
        },
        broadcast_remove:function(req, res, next){
            <% if(_model.fields.owner){ %>

                app.njax.broadcast(
                    [ req.user ],
                    '<%= _model.name %>.remove',
                    {
                        user:req.user.toObject(),
                        <%= _model.name %>: req.<%= _model.name %>.toObject(),
						_url:req.<%= _model.name %>.url,
						_entity_type:req.<%= _model.name %>._njax_type
                    }
                );
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
