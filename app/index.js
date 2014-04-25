
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
    this.mkdir('lib');
    this.mkdir('lib/model');
    this.mkdir('lib/routes');
    this.mkdir('lib/routes/model');
    this.copy(this.default_tpl_dir + 'lib/routes/index.js', 'lib/routes/index.js');
    this.copy( this.default_tpl_dir + 'lib/routes/model/index.js', 'lib/routes/model/index.js');
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
NJaxGenerator.prototype._angular = function(){
    this.angular_tpl_dir = 'angular/';
    this.template(this.angular_tpl_dir + 'public/js/services/model.js', 'public/js/services.js');
    this.template(this.angular_tpl_dir + 'public/js/app.js', 'public/js/app.js');
}
NJaxGenerator.prototype._copyIfNew = function copyIfNew(source, destination){
    var destination = this.isPathAbsolute(destination) ? destination : path.join(this.destinationRoot(), destination);
    if(!fs.existsSync(destination)){
        this.copy(source, destination)
    }
}
NJaxGenerator.prototype._genSchema = function genSchema(model){


    this.template(this.default_tpl_dir + 'lib/model/schema.js', 'lib/model/' + this._model.name + '.js');
    this.template(this.default_tpl_dir + 'lib/routes/model/route.js', 'lib/routes/model/' + this._model.name + '.js');
    this.template(this.default_tpl_dir + 'public/templates/model/detail.hjs', 'public/templates/model/' + this._model.name + '_detail.hjs');
    this.template(this.default_tpl_dir + 'public/templates/model/edit.hjs', 'public/templates/model/' + this._model.name + '_edit.hjs');
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

    var uri = '';

    if(model.parent){

        uri +=  this.config.models[model.parent].uri + '/:' + model.parent;
    }
    if(typeof(model.uri_prefix) == 'undefined'){
        uri += '/' + model.name + 's';

    }else{
        uri += model.uri_prefix;
    }
    //uri += '/:' + model.name;
    model.uri = uri;
    var hjs_uri = new String(uri);
    for(var i in this.config.models){
        var id_str = this.config.models[i].fields.namespace ? 'namespace' : '_id';
        hjs_uri = hjs_uri.replace(
            ':' + i,
            '{{' + i + '.' + id_str + '}}'
        );
    }
    model.hjs_uri = hjs_uri;
    for(var key in model.fields){

        var fieldData =  model.fields[key];
        if(_.isString(fieldData)){
            fieldData = { type: fieldData };
        }
        if(!fieldData.type){
            throw new Error("Invalid Model > Field > Type in njax.json");
        }
        model._files = [];
        model._rels = [];
        fieldData.mongo_type = {}
        switch(fieldData.type.toLowerCase()){

            case 's3-asset':
                model._files.push(key);
                fieldData.mongo_type.type = "String";
                break
            case 'ref':
                model._rels.push({
                    ref: fieldData.ref
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
    return model;
}


