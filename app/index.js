
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
    for(var i in this.config.models){
        this._model = this.config.models[i];
        if(!this._model.name){
            this._model.name = i;
        }
        this._genSchema(this._model);
/*
        this.template('_route.js', 'lib/routes/' + model.name + '.js');
        this.template('_schema.js', 'lib/model/' +model. name + '.js');*/
    }


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
       /* switch(fieldData.type.toLowerCase()){
            case 'ObjectId':
                props[fld].type = type.toLowerCase();
                props[fld].ipsum = 'id';
                break;
            case 'Date':
                props[fld].type = 'string';
                props[fld].format = 'date-time';
                break;
            case 'Array':
                props[fld].type = type.toLowerCase();
                props[fld].items = { "type": "string" };
                break;
            case 'Number':
                props[fld].type = type.toLowerCase();
                break;
            case 'Boolean':
                props[fld].type = type.toLowerCase();
                break;
            case 'String':
                props[fld].type = type.toLowerCase();
                props[fld].ipsum = "sentence"
                break;
            case 'Buffer':
            case 'Mixed':
                break;
        }*/
        this._model.fields[key] = JSON.stringify(fieldData);

    }
    this.copy('_meta.hjs', 'public/templates/_meta.hjs');
    this.copy('_meta_footer.hjs', 'public/templates/_meta_footer.hjs');
    this.copy('_modal.hjs', 'public/templates/_modal.hjs');
    this.copy('_navbar.hjs', 'public/templates/_navbar.hjs');
    this.copy('auth.hjs', 'public/templates/auth.hjs');
    this.copy('register.hjs', 'public/templates/register.hjs');

    this.template('_schema.js', 'lib/model/' + this._model.name + '.js');
    this.template('_route.js', 'lib/routes/' + this._model.name + '.js');
    this.template('_view_detail.hjs', 'public/templates/' + this._model.name + '_detail.hjs');
    this.template('_view_edit.hjs', 'public/templates/' + this._model.name + '_edit.hjs');
    this.template('_view_list.hjs', 'public/templates/' + this._model.name + '_list.hjs');
}


