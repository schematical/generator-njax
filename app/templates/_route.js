module.exports = function(app) {
    // Module dependencies.
    var mongoose = require('mongoose'),
        <%= _.capitalize(_model.name) %> = mongoose.models.<%= _.capitalize(_model.name) %>,
    api = {};

    // ALL
    api.<%= _model.name.toLowerCase() %>s = function (req, res) {
            <%= _.capitalize(_model.name) %>.find(function(err, <%= _model.name.toLowerCase() %>s) {
                if (err) {
                res.json(500, err);
                } else {
            res.json({<%= _model.name.toLowerCase() %>s: <%= _model.name.toLowerCase() %>s});
        }
        });
        };

        // GET
        api.<%= _model.name.toLowerCase() %> = function (req, res) {
                var id = req.params.id;
                <%= _.capitalize(_model.name) %>.findOne({ '_id': id }, function(err, <%= _model.name.toLowerCase() %>) {
                if (err) {
                res.json(404, err);
                } else {
                res.json({<%= _model.name.toLowerCase() %>: <%= _model.name.toLowerCase() %>});
            }
            });
            };

            // POST
            api.add<%= _.capitalize(_model.name) %> = function (req, res) {

                    var <%= _model.name.toLowerCase() %>;

                    if(typeof req.body.<%= _model.name.toLowerCase() %> == 'undefined'){
         res.status(500);
         return res.json({message: '<%= _model.name.toLowerCase() %> is undefined'});
                }

                    <%= _model.name.toLowerCase() %> = new <%= _.capitalize(_model.name) %>(req.body.<%= _model.name.toLowerCase() %>);

                        <%= _model.name.toLowerCase() %>.save(function (err) {
                            if (!err) {
                            console.log("created <%= _model.name.toLowerCase() %>");
                            return res.json(201, <%= _model.name.toLowerCase() %>.toObject());
                            } else {
                            return res.json(500, err);
                            }
                        });

                        };

                        // PUT
                        api.edit<%= _.capitalize(_model.name) %> = function (req, res) {
                            var id = req.params.id;

                            <%= _.capitalize(_model.name) %>.findById(id, function (err, <%= _model.name.toLowerCase() %>) {


                            <% schemaFields.forEach(function(field, index) { %>
                                if(typeof req.body.<%= _model.name.toLowerCase() %>["<%= field.split(':')[0] %>"] != 'undefined'){
                                <%= _model.name.toLowerCase() %>["<%= field.split(':')[0] %>"] = req.body.<%= _model.name.toLowerCase() %>["<%= field.split(':')[0] %>"];
                                }
                            <% }) %>

                            return <%= _model.name.toLowerCase() %>.save(function (err) {
                                if (!err) {
                                console.log("updated <%= _model.name.toLowerCase() %>");
                                return res.json(200, <%= _model.name.toLowerCase() %>.toObject());
                                } else {
                                return res.json(500, err);
                                }
                            return res.json(<%= _model.name.toLowerCase() %>);
                                });
                                });

                                };

                                // DELETE
                                api.delete<%= _.capitalize(_model.name) %> = function (req, res) {
                                        var id = req.params.id;
                                        return <%= _.capitalize(_model.name) %>.findById(id, function (err, <%= _model.name.toLowerCase() %>) {
                                        return <%= _model.name.toLowerCase() %>.remove(function (err) {
                                        if (!err) {
                                        console.log("removed <%= _model.name.toLowerCase() %>");
                                        return res.send(204);
                                        } else {
                                        console.log(err);
                                        return res.json(500, err);
                                        }
                                    });
                                    });

                                    };


                                    app.get('/api/<%= _model.name.toLowerCase() %>s', api.<%= _model.name.toLowerCase() %>s);
  app.get('/api/<%= _model.name.toLowerCase() %>/:id', api.<%= _model.name.toLowerCase() %>);
  app.post('/api/<%= _model.name.toLowerCase() %>', api.add<%= _.capitalize(_model.name) %>);
                                        app.put('/api/<%= _model.name.toLowerCase() %>/:id', api.edit<%= _.capitalize(_model.name) %>);
  app.delete('/api/<%= _model.name.toLowerCase() %>/:id', api.delete<%= _.capitalize(_model.name) %>);
};