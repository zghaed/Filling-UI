;(function(app){

	app.view('Glue', {
		template: '<div region="glue-region" action-contextmenu="show-builder"></div>',
		onNavigateTo: function(path){
			var view = app.get(path).create();
			this.show('glue-region', view);
		},
		actions: {
			'show-builder': function() {
				var target = $(event.target),
					cacheName = this.getViewIn('glue-region').name + '-' + target.attr('region');
				var builder = app.get('Builder').create({
					data: {
						"name" : cacheName
 					}
				});
				app.store.set(cacheName, app.store.get(cacheName) || {
					boxes:
					[
						{"template": "", "data":"", "direction":"h", "boxName":"top-left-box",     "groupNumber":0},
						{"template": "", "data":"", "direction":"h", "boxName":"top-right-box",    "groupNumber":0},
						{"template": "", "data":"", "direction":"v", "boxName":"middle-box",       "groupNumber":0},
						{"template": "", "data":"", "direction":"h", "boxName":"bottom-right-box", "groupNumber":0}
					]
				});
				app.spray(target, builder);
			}
		}
	});

})(Application);
