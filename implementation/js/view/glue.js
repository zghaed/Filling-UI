;(function(app){

	app.view('Glue', {
		template: '<div region="glue-region" action-contextmenu="show-builder"></div>',
		onNavigateTo: function(path){
			console.log('nav to', path);
			var view = app.get(path).create();
			this.show('glue-region', view);
		},
		actions: {
			'show-builder': function() {
				var builder = app.get('Builder').create({
					data:

					 	{"boxes":
 							[
 								{"template": "", "data":"", "direction":"h", "boxName":"top-left-box",     "groupNumber":0},
 								{"template": "", "data":"", "direction":"h", "boxName":"top-right-box",    "groupNumber":0},
 								{"template": "", "data":"", "direction":"v", "boxName":"middle-box",       "groupNumber":0},
 								{"template": "", "data":"", "direction":"h", "boxName":"bottom-right-box", "groupNumber":0}
 							]
 						}
					
				});
				var target = $(event.target);
		// 		app.store.set('boxes',

		// );

				app.spray(target, builder);//app.store.get('boxes'));
			}
		}
	});

})(Application);
