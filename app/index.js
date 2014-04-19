
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


    this.mkdir('lib');
    this.mkdir('lib/model');
    this.mkdir('lib/routes');
    this.copy('_meta.hjs', 'public/templates/_meta.hjs');
    this.copy('_meta_footer.hjs', 'public/templates/_meta_footer.hjs');
    this.copy('_modal.hjs', 'public/templates/_modal.hjs');
    this.copy('_navbar.hjs', 'public/templates/_navbar.hjs');
    this.copy('auth.hjs', 'public/templates/auth.hjs');
    this.copy('register.hjs', 'public/templates/register.hjs');

    for(var i in this.config.models){
        this._model = this.config.models[i];
        if(!this._model.name){
            this._model.name = i;
        }
        this._genSchema(this._model);

    }

    this.template('_lib_model_index.js', 'lib/model/index.js');

};
NJaxGenerator.prototype._genSchema = function genSchema(model){

    for(var key in model.fields){

        var fieldData =  model.fields[key];
        if(_.isString(fieldData)){
            fieldData = { type: fieldData };
        }
        if(!fieldData.type){
            throw new Error("Invalid Model > Field >Type in njax.json");
        }
        fieldData.mongo_type = {}
        switch(fieldData.type.toLowerCase()){
            case 'objectid':
                fieldData.mongo_type.type = 'ObjectId'
                fieldData.mongo_type.ipsum = 'id';
                break;
            case 'date':
                fieldData.mongo_type.type = 'Date';
                fieldData.mongo_type.format = 'date-time';
                break;
            case 'array':
                fieldData.mongo_type.type = "Array";
                fieldData.mongo_type.items = { "type": "string" };
                break;
            case 'number':
                fieldData.mongo_type.type = "Number"
                break;
            case 'boolean':
                fieldData.mongo_type.type = "Boolean";
                break;
            case 'string':
            case 'url':
            case 'md':
                fieldData.mongo_type.type = "String";
                fieldData.mongo_type.ipsum = "sentence"
                break;
            case 'buffer':
            case 'mixed':
                break;
        }

        fieldData.mongo_type = JSON.stringify(fieldData.mongo_type);
        this._model.fields[key] = fieldData;

    }


    this.template('_lib_model_class.js', 'lib/model/' + this._model.name + '.js');
    this.template('_route.js', 'lib/routes/' + this._model.name + '.js');
    this.template('_public_template_detail.hjs', 'public/templates/' + this._model.name + '_detail.hjs');
    this.template('_public_template_edit.hjs', 'public/templates/' + this._model.name + '_edit.hjs');
    this.template('_public_template_list.hjs', 'public/templates/' + this._model.name + '_list.hjs');
}


