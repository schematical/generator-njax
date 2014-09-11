module.exports = function(generator, Class){

    generator.sdk_tpl_dir = 'sdk/';
    generator._templateIfNew(generator.angular_tpl_dir + 'lib/index.js', 'lib/index.js');
    generator._templateIfNew(generator.angular_tpl_dir + 'lib/package.json', 'lib/package.json');

    for(var i in generator.config.models){

        generator._model = generator.config.models[i];
        generator._templateIfNew(generator.angular_tpl_dir + 'lib/model/model.js', 'lib/model/' + generator._model.name + '.js');
        generator.template(generator.angular_tpl_dir + 'lib/model/model.gen.js', 'lib/model/_gen/' + generator._model.name + '.js');

    }
}