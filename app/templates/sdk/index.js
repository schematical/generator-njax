module.exports = function(generator, Class){

    generator.sdk_tpl_dir = 'sdk/';
    generator._templateIfNew(generator.sdk_tpl_dir + '/index.gen.js', 'sdk/index.js');
    generator._templateIfNew(generator.sdk_tpl_dir + 'lib/index.js', 'sdk/lib/index.js');
    generator._templateIfNew(generator.sdk_tpl_dir + 'package.json', 'sdk/lib/package.json');

    for(var i in generator.config.models){

        generator._model = generator.config.models[i];
        generator._templateIfNew(generator.sdk_tpl_dir + 'lib/model/model.js', 'sdk/lib/model/' + generator._model.name + '.js');
        generator.template(generator.sdk_tpl_dir + 'lib/model/model.gen.js', 'sdk/lib/model/_gen/' + generator._model.name + '.js');

    }
}