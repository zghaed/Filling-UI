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
            cacheName : cacheName,
            dataSource: app.model({
              first: {"a": "Hi", "b": "Bye"},
              second: {"a": "Hi2", "b": "Bye2"},
              third: {"a": "Hi3", "b": "Bye3"}
            })
          });
          app.store.set(cacheName, app.store.get(cacheName) || {
            'stackGroups': [
              {'template': '',
                'data':'', 'less':'', 'css_container': {
                'flex-grow': '0',
                'flex-shrink': '1',
                'flex-basis': '100%',
                }
              },
            ],
            'hangerGroups': [],
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
            var  stackGroups = caches[key].stackGroups.length;
            if(stackGroups < 1) {
              app.store.set(key);
            } else {
              keys.push(key);
            }
          }
        });
        var self = this;
        _.each(keys, function(key) {
          var builder = app.get('Builder').create({
            cacheName : key,
            dataSource: app.model({
              first: {"a": "Hi", "b": "Bye"},
              second: {"a": "Hi2", "b": "Bye2"},
              third: {"a": "Hi3", "b": "Bye3"}
            })
          });
          app.store.set(key, app.store.get(key) || {
            'stackGroups': [
              {'template': '',
                'data':'', 'less':'', 'css_container': {
                'flex-grow': '0',
                'flex-shrink': '1',
                'flex-basis': '100%',
                }
              },
            ],
            'hangerGroups': [],
            'direction': ''
          });
          var nameArray = key.split('-');
          nameArray.shift();
          var name = nameArray.join('-');
          self.spray($('[region="' + name + '"]'), builder);
        });
      }
    }
  });
})(Application);
