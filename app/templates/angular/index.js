module.exports = function(generator, Class){

    generator.angular_tpl_dir = 'angular/';
    generator._templateIfNew(generator.angular_tpl_dir + 'public/js/app.js', 'public/js/app.js');

    generator._templateIfNew(generator.angular_tpl_dir + 'public/js/filters/model.js', 'public/js/filters.js');
    generator._templateIfNew(generator.angular_tpl_dir + 'public/templates/_header.hjs', 'public/templates/_meta_angular.hjs');

    for(var i in generator.config.models){

		generator._model = generator.config.models[i];
		if(!generator._model.default || generator.config.is_platform || generator.config.njax_module){
			generator._templateIfNew(generator.angular_tpl_dir + 'public/js/services/model.js', 'public/js/services/' + generator._model.name + '.js');
			generator._templateIfNew(generator.angular_tpl_dir + 'public/js/controllers/model.js', 'public/js/controllers/' + generator._model.name + '.js');
			//generator._templateIfNew(generator.angular_tpl_dir + 'public/js/directives/model.js', 'public/js/directives/' + generator._model.name + '.js');

			generator._templateIfNew(generator.angular_tpl_dir + 'public/templates/directives/model.html', 'public/templates/directives/' + generator._model.name + 'Picker.html');
		}
    }
}