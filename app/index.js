
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




    this.default_tpl_dir = 'default/';

    var _njax = require(__dirname + '/templates/' + this.default_tpl_dir + 'njax');
    var unique_models = _.clone(this.config.models);
    if(this.config.is_platform || this.config.njax_module){
        var njax_models = _.clone(_njax.models);
    }else{
        var njax_models = {};
    }
    _.extend(this.config, _njax);

    this.config.models = _.extend(njax_models, unique_models);
    //console.log(Object.keys(this.config.models));

    this._prepairModels();

    this.mkdir('lib');
    this.mkdir('lib/model');
    this.mkdir('lib/routes');
    this.mkdir('lib/routes/model');
    this.mkdir('lib/routes/model/_gen');
    if(!this.config.njax_module){
        this._copyIfNew(this.default_tpl_dir + '.gitignore', '.gitignore');
        this._copyIfNew(this.default_tpl_dir + '.bowerrc', '.bowerrc');
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
    }
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
    for(var framework in this.config.frameworks){
        //var framework = this.config.frameworks[i];
        var destination = this.isPathAbsolute(framework) ? framework : path.join(__dirname, 'templates',framework);
        var file_path = path.join(destination, 'index.js');

        if(fs.existsSync(file_path)){
            var framework_module = require(path.join(destination, 'index'));
            framework_module(this, NJaxGenerator, this.config.frameworks[framework]);
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
    var destination = this.isPathAbsolute( 'package.json') ?  'package.json' : path.join(this.destinationRoot(),  'package.json');
    if(!fs.existsSync(destination)){
        this.writeFileFromString(
            JSON.stringify(this.config.package),
            'package.json'
        );
    }

    this.writeFileFromString(
        JSON.stringify(this.config.bower),
        'bower.json'
    );
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
    var schema_template = this.default_tpl_dir + 'lib/model/schema.js';
    if(this._model.tpl_override && this._model.tpl_override.schema){
        schema_template = this.default_tpl_dir + this._model.tpl_override.schema;
    }

    this._templateIfNew(schema_template, 'lib/model/' + this._model.name + '.js');

    if(!this._model.default || this.config.njax_module){
        var tpl_dir_root = 'public/templates/model/';
        this.template(this.default_tpl_dir + 'lib/model/schema.gen.js', 'lib/model/_gen/' + this._model.name + '_gen.js');
        this.template(this.default_tpl_dir + 'lib/routes/model/route.gen.js', 'lib/routes/model/_gen/' + this._model.name + '.gen.js');

    }else{
        var tpl_dir_root = 'public/templates/model/_njax';
    }
    if(!this._model.default || this.config.is_platform || this.config.njax_module){
        this._templateIfNew(this.default_tpl_dir + 'lib/routes/model/route.js', 'lib/routes/model/' + this._model.name + '.js');


        if(model.relationship && model.relationship != 'assoc'){
            //Blah
        }
        this._templateIfNew(this.default_tpl_dir + 'public/templates/model/detail.hjs', tpl_dir_root +  '/' +this._model.name + '_detail.hjs');
        this._templateIfNew(this.default_tpl_dir + 'public/templates/model/edit.hjs', tpl_dir_root +  '/' +this._model.name + '_edit.hjs');
        this._templateIfNew(this.default_tpl_dir + 'public/templates/model/_edit.hjs', tpl_dir_root + '/_' + this._model.name + '_edit_form.hjs');
        this._templateIfNew(this.default_tpl_dir + 'public/templates/model/list.hjs', tpl_dir_root + '/' + this._model.name + '_list.hjs');
        this._templateIfNew(this.default_tpl_dir + 'public/templates/model/_list_single.hjs', tpl_dir_root +'/_' + this._model.name + '_list_single.hjs');
    }
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

    if(model.parent){
        var parent_field = model.fields[model.parent];

        if(!parent_field){
            throw new Error("No parent field '" + model.parent + "' exists in model '" + model.name + "'");
        }
        if(!parent_field.ref){
            throw new Error("Parent field must be a ref. Field: '" + model.parent + "' in model '" + model.name + "'");
        }
        if(!this.config.models[parent_field.ref]){
            console.error(Object.keys(this.config.models));
            throw new Error("Cannot find model : " + parent_field.ref);
        }
        if(!this.config.models[parent_field.ref]._prerendered){
            this._prepairModel(this.config.models[model.parent]);
        }
        model.parent_field = this.config.models[parent_field.ref];
    }
    var uri = '';
    var schema_uri = '';
    var route = '';
    var hjs_uri = '';
    if(model.parent){

        route +=  this.config.models[parent_field.ref].route + '/:' + parent_field.ref;
        hjs_uri += '{{ ' + parent_field.ref + '.uri }}';
    }
    if(typeof(model.uri_prefix) == 'undefined'){
        route += '/' + model.name + 's';
        hjs_uri += '/' + model.name + 's';
    }else{
        route += model.uri_prefix;
        hjs_uri += model.uri_prefix;
    }
    //uri += '/:' + model.name;
    model.uri = model.route = route;//SHITTY HACK
    model.hjs_uri = hjs_uri;
    model._files = [];
    model._rels = [];
    for(var key in model.fields){

        var fieldData =  model.fields[key];
        if(_.isString(fieldData)){
            fieldData = { type: fieldData };
        }
        if(_.isArray(fieldData) && fieldData.length >= 1){
            var sub_type = fieldData[0];
            if(_.isObject(sub_type)){
                if(sub_type.type == 'ref'){
                    fieldData.mongo_type = "[{ type: Schema.Types.ObjectId, ref: '" + this._.capitalize(sub_type.ref) + "' }]"
                }
            }
            if(_.isString(sub_type)){
                sub_type = '"' + sub_type + '"';
            }
            fieldData = { type: 'array', sub_type: sub_type };
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
                    name: key,
                    ref: fieldData.ref,
                    bootstrap_populate:fieldData.bootstrap_populate || ('req.' + fieldData.ref)
                });
                fieldData.mongo_type = "{ type: Schema.Types.ObjectId, ref: '" + this._.capitalize(fieldData.ref) + "' }"
                break
            case 'api-ref':
                fieldData.mongo_type.type = "String";
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
            case 'object':
                fieldData.mongo_type.type = "Object";
                break;
            case 'tpcd':
                fieldData.mongo_type.type = "String";


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


