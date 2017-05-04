;(function(app){

	app.view('Glue', {
		template: '<div region="glue-region" action-contextmenu="show-builder"></div>',
		onNavigateTo: function(path){
			var view = app.get(path).create();
			this.show('glue-region', view);
			this.listenTo(view, 'ready', function() {
				this.onReady();
			});
		},
		actions: {
			'show-builder': function($btn, e){
				var target = $(e.target),
					cacheName = this.getViewIn('glue-region').name + '-' + target.attr('region'),
					regions = (target.attr('region') === undefined) ||
						(target.attr('region') === ('middle-box' || 'top-left-box' || 'top-right-box' || 'bottom-right-box'));
				var allCaches = app.store.getAll();
				if (!(allCaches[cacheName] || regions)) {
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
		},
		onReady: function() {
			if (this.getViewIn('glue-region')) {
				var caches = app.store.getAll();
				var keys = [];
				var viewName = this.getViewIn('glue-region').name;
				_.each(caches, function(val, key){
					var keyArray = key.split('-');
					if (keyArray[0] === viewName) {
				    keys.push(key);
				  }
				});
				console.log('existed = ', keys);
				var self = this;
				_.each(keys, function(key){
					console.log('key is, ', key);
					var builder = app.get('Builder').create({
						data: {
							"name" : key
	 					}
					});
					app.store.set(key, app.store.get(key) || {
						boxes:
						[
							{"template": "", "data":"", "direction":"h", "boxName":"top-left-box",     "groupNumber":0},
							{"template": "", "data":"", "direction":"h", "boxName":"top-right-box",    "groupNumber":0},
							{"template": "", "data":"", "direction":"v", "boxName":"middle-box",       "groupNumber":0},
							{"template": "", "data":"", "direction":"h", "boxName":"bottom-right-box", "groupNumber":0}
						]
					});
					var nameArray = key.split('-');
					nameArray.shift();
					var name = nameArray.join('-');

					self.listenTo(builder, 'ready', function() {
						_.each(builder.regions, function(selector, r){
							var box = builder.getViewIn(r);
							//app.debug('box:', box.ui['toggle-preview']) && box.ui['toggle-preview'].click();
						});
					});

					var sprayResult = app.spray($('[region="'+name+'"]'), builder);
					sprayResult.$el.attr('region', name);
				});
			}
		}
	});
})(Application);
