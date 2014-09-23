module.exports = function(generator, Class, framework_config){

    generator.sdk_tpl_dir = 'sdk/';
    var sdk_path = 'node_modules/' + (framework_config.node_module && framework_config.node_module.name) || 'njax-sdk';
    generator._templateIfNew(generator.sdk_tpl_dir + '/index.gen.js', sdk_path +'/index.js');
    generator._templateIfNew(generator.sdk_tpl_dir + 'lib/index.js', sdk_path + '/lib/index.js');
    generator._templateIfNew(generator.sdk_tpl_dir + 'package.json', sdk_path + '/lib/package.json');

    for(var i in generator.config.models){

        generator._model = generator.config.models[i];
        generator._templateIfNew(generator.sdk_tpl_dir + 'lib/model/model.js', sdk_path + '/lib/model/' + generator._model.name + '.js');
        generator.template(generator.sdk_tpl_dir + 'lib/model/model.gen.js', sdk_path + '/lib/model/_gen/' + generator._model.name + '.js');

    }
}