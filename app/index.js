
'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var _ = require('underscore');


var NJaxGenerator = module.exports = function SchemaGenerator(args, options, config) {
    // By calling `NamedBase` here, we get the argument to the subgenerator call
    // as `this.name`.

    var config_file_path = path.join(process.cwd(), 'njax.json');
    if(!fs.existsSync(config_file_path)){
        throw new Error("Missing NJax File");
    }
    var config_raw = fs.readFileSync(config_file_path);

    yeoman.generators.Base.apply(this, arguments);

    this.config = JSON.parse(config_raw);

};

util.inherits(NJaxGenerator, yeoman.generators.Base);

NJaxGenerator.prototype.app = function app() {
    this._prepairModels();



    this.default_tpl_dir = 'default/';

    var _njax = require(__dirname + '/templates/' + this.default_tpl_dir + 'njax');
    _.extend(this.config, _njax);


    this.mkdir('lib');
    this.mkdir('lib/model');
    this.mkdir('lib/routes');
    this.mkdir('lib/routes/model');
    this._copyIfNew(this.default_tpl_dir + '.gitignore', '.gitignore');
    this._copyIfNew(this.default_tpl_dir + 'app.js', 'app.js');
    this._copyIfNew(this.default_tpl_dir + 'config.js', 'config.js');
    this._copyIfNew(this.default_tpl_dir + 'lib/routes/index.js', 'lib/routes/index.js');
    this._copyIfNew( this.default_tpl_dir + 'lib/routes/model/index.js', 'lib/routes/model/index.js');
    this._copyIfNew( this.default_tpl_dir +'public/templates/_meta.hjs', 'public/templates/_meta.hjs');
    this._copyIfNew( this.default_tpl_dir +'public/templates/_meta_footer.hjs', 'public/templates/_meta_footer.hjs');
    this._copyIfNew( this.default_tpl_dir +'public/templates/_modal.hjs', 'public/templates/_modal.hjs');
    this._copyIfNew( this.default_tpl_dir +'public/templates/_navbar.hjs', 'public/templates/_navbar.hjs');
    this._copyIfNew( this.default_tpl_dir +'public/templates/index.hjs', 'public/templates/index.hjs');
    this._copyIfNew( this.default_tpl_dir +'public/templates/auth.hjs', 'public/templates/auth.hjs');
    this._copyIfNew( this.default_tpl_dir +'public/templates/register.hjs', 'public/templates/register.hjs');

    for(var i in this.config.models){
        this._model = this.config.models[i];

        this._genSchema(this._model);

    }

    this.template(this.default_tpl_dir + 'lib/model/index.js', 'lib/model/index.js');

};
NJaxGenerator.prototype.frameworks = function(){
    if(!this.config.frameworks){
       return;
    }
    for(var i in this.config.frameworks){
        var framework = this.config.frameworks[i];
        if(this['_' + framework]){
            this['_' + framework]();
        }
    }


}
NJaxGenerator.prototype.dependencies = function(){
    if(this.config.package.name == '?'){
        this.config.package.name = this.config.app_name;
    }
    if(this.config.bower.name == '?'){
        this.config.bower.name = this.config.app_name;
    }
    this.writeFileFromString(
        JSON.stringify(this.config.package),
        'package.json'
    );
    this.writeFileFromString(
        JSON.stringify(this.config.bower),
        'bower.json'
    );
}
NJaxGenerator.prototype._angular = function(){
    this.angular_tpl_dir = 'angular/';
    this.template(this.angular_tpl_dir + 'public/js/services/model.js', 'public/js/services.js');
    this.template(this.angular_tpl_dir + 'public/js/app.js', 'public/js/app.js');
}
NJaxGenerator.prototype._ionic = function(){
    this.angular_tpl_dir = 'ionic/';

    this.template(this.angular_tpl_dir + 'web/index.html', 'web/index.html');

    this.template(this.angular_tpl_dir + 'web/js/app.js', 'web/js/app.js');
    this.template(this.angular_tpl_dir + 'web/templates/about.html', 'web/templates/about.html');
    this.template(this.angular_tpl_dir + 'web/templates/about.html', 'web/templates/tabs.html');

    this.template(this.angular_tpl_dir + 'web/js/services.js', 'web/js/services.js');
    this.template(this.angular_tpl_dir + 'web/js/controllers.js', 'web/js/controllers.js');

    for(var i in this.config.models){
        this._model = this.config.models[i];

        this.template(this.angular_tpl_dir + 'web/templates/model-detail.html', 'web/templates/' + this._model.name + '-detail.html');
        this.template(this.angular_tpl_dir + 'web/templates/model-list.html', 'web/templates/' + this._model.name + '-list.html');
    }
}
NJaxGenerator.prototype._copyIfNew = function copyIfNew(source, destination){
    var destination = this.isPathAbsolute(destination) ? destination : path.join(this.destinationRoot(), destination);
    if(!fs.existsSync(destination)){
        this.copy(source, destination)
    }
}
NJaxGenerator.prototype._templateIfNew = function templateIfNew(source, destination){
    var destination = this.isPathAbsolute(destination) ? destination : path.join(this.destinationRoot(), destination);
    if(!fs.existsSync(destination)){
        this.template(source, destination)
    }
}
NJaxGenerator.prototype._genSchema = function genSchema(model){


    this.template(this.default_tpl_dir + 'lib/model/schema.gen.js', 'lib/model/_gen/' + this._model.name + '_gen.js');
    this._templateIfNew(this.default_tpl_dir + 'lib/model/schema.js', 'lib/model/' + this._model.name + '.js');
    this.template(this.default_tpl_dir + 'lib/routes/model/route.js', 'lib/routes/model/' + this._model.name + '.js');

    this.template(this.default_tpl_dir + 'public/templates/model/detail.hjs', 'public/templates/model/' + this._model.name + '_detail.hjs');
    this.template(this.default_tpl_dir + 'public/templates/model/edit.hjs', 'public/templates/model/' + this._model.name + '_edit.hjs');
    this.template(this.default_tpl_dir + 'public/templates/model/_edit.hjs', 'public/templates/model/_' + this._model.name + '_edit_form.hjs');
    this.template(this.default_tpl_dir + 'public/templates/model/list.hjs', 'public/templates/model/' + this._model.name + '_list.hjs');
}
NJaxGenerator.prototype._prepairModels = function(){
    for(var i in this.config.models){
        if(!this.config.models[i].name){
            this.config.models[i].name = i;
        }
        this.config.models[i] = this._prepairModel(this.config.models[i]);
    }
}
NJaxGenerator.prototype._prepairModel = function(model){
    if(model._prerendered){
        return model;
    }

    if(model.parent && !this.config.models[model.parent]._prerendered){
        this._prepairModel(this.config.models[model.parent])
    }
    var uri = '';
    var hjs_uri = '';
    if(model.parent){

        uri +=  this.config.models[model.parent].uri + '/:' + model.parent;
        hjs_uri += '{{ ' + model.parent + '.uri }}';
    }
    if(typeof(model.uri_prefix) == 'undefined'){
        uri += '/' + model.name + 's';
        hjs_uri += '/' + model.name + 's';
    }else{
        uri += model.uri_prefix;
        hjs_uri += model.uri_prefix;
    }
    //uri += '/:' + model.name;
    model.uri = uri;
    model.hjs_uri = hjs_uri;
    model._files = [];
    model._rels = [];
    for(var key in model.fields){

        var fieldData =  model.fields[key];
        if(_.isString(fieldData)){
            fieldData = { type: fieldData };
        }
        if(_.isArray(fieldData) && fieldData.length >= 1){
            fieldData = { type: 'array', sub_type: fieldData[0] };
        }
        if(!fieldData.type){
            console.error(fieldData);
            throw new Error("Invalid Model > Field > Type in njax.json");
        }

        fieldData.mongo_type = {}
        switch(fieldData.type.toLowerCase()){

            case 's3-asset':
                model._files.push(key);
                fieldData.mongo_type.type = "String";
                break

            case 'ref':
                model._rels.push({
                    ref: fieldData.ref,
                    bootstrap_populate:fieldData.bootstrap_populate
                });
                fieldData.mongo_type = "{ type: Schema.Types.ObjectId, ref: '" + this._.capitalize(fieldData.ref) + "' }"
                break
            case 'objectid':
                fieldData.mongo_type.type = 'ObjectId'
                fieldData.mongo_type.ipsum = 'id';
                break;
            case 'date':
                fieldData.mongo_type.type = 'Date';
                fieldData.mongo_type.format = 'date-time';
                break;
            case 'array':
                if(fieldData.sub_type){
                    fieldData.mongo_type = '[' + fieldData.sub_type + ']';
                }
                break;
            case 'number':
                fieldData.mongo_type.type = "Number"
                break;
            case 'boolean':
                fieldData.mongo_type.type = "Boolean";
                break;
            case 'string':
            case 'email' :
            case 'namespace':
            case 'url':
            case 'md':
                fieldData.mongo_type = '{ type:String }';

                break;
            case 'buffer':
            case 'mixed':
                break;
        }
        if(model._files.length > 0){
            model.file_fields =  model._files.join("','");
        }
        if(_.isObject(fieldData.mongo_type)){
            fieldData.mongo_type = JSON.stringify(fieldData.mongo_type);
        }
        model.fields[key] = fieldData;


    }
    model._prerendered = true;
    return model;
}


