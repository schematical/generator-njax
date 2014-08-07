module.exports = function(generator, Class){
    generator.angular_tpl_dir = 'ionic/';

    generator.template(generator.angular_tpl_dir + 'web/index.html', 'web/index.html');

    generator.template(generator.angular_tpl_dir + 'web/js/app.js', 'web/js/app.js');
    generator.template(generator.angular_tpl_dir + 'web/templates/about.html', 'web/templates/about.html');
    generator.template(generator.angular_tpl_dir + 'web/templates/tabs.html', 'web/templates/tabs.html');

    generator.template(generator.angular_tpl_dir + 'web/js/services.js', 'web/js/services.js');
    generator.template(generator.angular_tpl_dir + 'web/js/controllers.js', 'web/js/controllers.js');

    for(var i in generator.config.models){
        generator._model = generator.config.models[i];

        generator.template(generator.angular_tpl_dir + 'web/templates/model-detail.html', 'web/templates/' + generator._model.name + '-detail.html');
        generator.template(generator.angular_tpl_dir + 'web/templates/model-list.html', 'web/templates/' + generator._model.name + '-list.html');
    }
    
    //DEBUG SCRIPT
    generator.template(generator.angular_tpl_dir + 'web/debug.js', 'web/templates/debug.js');
}