;(function(app) {
  app.view('Glue', {
    template: '<div region="glue-region" action-contextmenu="show-builder"></div>',
    onNavigateTo: function(path) {
      var view = app.get(path[0]).create();
      this.show('glue-region', view);
      this.listenTo(view, 'ready', function() {
        this.onReady();
      });
    },
    actions: {
      'show-builder': function($btn, e) {
        var target = $(e.target),
          height = target.height(),
          cacheName = this.getViewIn('glue-region').name + '-' + target.attr('region'),
          regions = (target.attr('region') === undefined),
          allCaches = app.store.getAll();
        if (!(allCaches[cacheName] || regions)) {
          var builder = app.get('Builder').create({
            data: {
              "name" : cacheName
             }
          });
          app.store.set(cacheName, app.store.get(cacheName) || {
            'groups': [
              {'template': '',
                'data':'', 'less':'', 'css_container': {
                'flex-grow': '0',
                'flex-shrink': '1',
                'flex-basis': '100%',
                }
              },
            ],
            'strings': [],
            'direction': ''
          });
          this.spray(target, builder);
        }
      }
    },
    onReady: function() {
      if (this.getViewIn('glue-region')) {
        var caches = app.store.getAll(),
          keys = [],
          viewName = this.getViewIn('glue-region').name;
        _.each(caches, function(val, key) {
          var keyArray = key.split('-');
          if (keyArray[0] === viewName) {
            var  groups = caches[key].groups.length;
            if(groups < 1) {
              app.store.set(key);
            } else {
              keys.push(key);
            }
          }
        });
        var self = this;
        _.each(keys, function(key) {
          var builder = app.get('Builder').create({
            data: {
              "name" : key
             }
          });
          app.store.set(key, app.store.get(key) || {
            'groups': [
              {'template': '',
                'data':'', 'less':'', 'css_container': {
                'flex-grow': '0',
                'flex-shrink': '1',
                'flex-basis': '100%',
                }
              },
            ],
            'strings': [],
            'direction': ''
          });
          var nameArray = key.split('-');
          nameArray.shift();
          var name = nameArray.join('-');
          self.listenToOnce(builder, 'view:box-ready', function() {
            _.each(builder.regions, function(selector, r) {
              var box = builder.getViewIn(r);
              _.defer(function() {
                box.ui['toggle-preview'].click();
              });
            });
          });
          self.spray($('[region="'+name+'"]'), builder);
        });
      }
    }
  });
})(Application);
