'use strict';

/* Directives */


angular.module('<%= config.app_name %>.<%= _model.name %>.directives', [])
    .directive('<%= _model.name %>Picker', [ '<%= _.capitalize(_model.name) %>', function(<%= _.capitalize(_model.name) %>) {

        return {
            replace:true,
            scope:{ },
            templateUrl: '/templates/directives/<%= _model.name %>Picker.html',
            link: function($scope, element, attributes) {
                $scope.ele_name = attributes.name;
                //var entity = attributes.<%= _.capitalize(_model.name) %>Type;

                $scope.<%= _model.name %>s = window.njax_bootstrap.<%= _model.name %>s;


                /*
                $scope.add<%= _.capitalize(_model.name) %> = function(){
                    var data = {}
                    data['_id'] = window.njax_bootstrap[<%= _model.name %>]._id;
                    data['<%= _.capitalize(_model.name) %>'] = $scope.<%= _model.name %>.value;

                    var <%= _model.name %> =  new <%= _.capitalize(_model.name) %>(data);

                    <%= _model.name %>.$save(function(){
                        <%= _model.name %>.name = $scope.selectedSkill.name;
                        var entityData = {
                            _id:<%= _model.name %>._id,
                            name:$scope.selectedSkill.label,
                            <%= _.capitalize(_model.name) %>:<%= _model.name %>.<%= _.capitalize(_model.name) %>
                        }
                        entityData[entity] = <%= _model.name %>[entity];
                        $scope.<%= _model.name %>s.push(entityData);


                    });
                }




                $scope.removeSkill= function(<%= _model.name %>s){
                    console.log('<%= _model.name %>s ', <%= _model.name %>s );
                    var _<%= _model.name %>s =  new <%= _.capitalize(_model.name) %>(<%= _model.name %>s);
                    _<%= _model.name %>s.$delete(function(){
                        for(var i in $scope.<%= _model.name %>s){
                            if($scope.<%= _model.name %>s[i]._id == <%= _model.name %>s._id){
                                $scope.<%= _model.name %>s.splice(i, 1);
                            }
                        }

                    });
                }
                */
            }

        };
    }]);