;(function(app) {

  app.view('Glue', {
    template: '<div region="glue-region" action-contextmenu="show-builder"></div>',
    onNavigateTo: function(path) {
      var view = app.get(path).create();
      this.show('glue-region', view);
      this.listenTo(view, 'ready', function() {
        this.onReady();
      });
    },
    actions: {
      'show-builder': function($btn, e) {
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
            'top-left-box':
              [{"template": "", "data":"", "css":"", "direction":"h", "groupNumber":0}],
            'top-right-box':
              [{"template": "", "data":"", "css":"", "direction":"h", "groupNumber":0}],
            'middle-box':
              [{"template": "", "data":"", "css":"", "direction":"v", "groupNumber":0}],
            'bottom-right-box':
              [{"template": "", "data":"", "css":"", "direction":"h", "groupNumber":0}]
          });
          this.spray(target, builder);
        }
      }
    },
    onReady: function() {
      if (this.getViewIn('glue-region')) {
        var caches = app.store.getAll();
        var keys = [];
        var viewName = this.getViewIn('glue-region').name;
        var regionNames = ['top-left-box', 'top-right-box', 'middle-box', 'bottom-right-box'];
        _.each(caches, function(val, key) {
          var keyArray = key.split('-');
          if (keyArray[0] === viewName) {
            var groups = 0;
            _.each(regionNames, function(region) {
              groups += caches[key][region].length;
            });
            if(groups < 5) {
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
            'top-left-box':
              [{"template": "", "data":"", "css":"", "direction":"h", "groupNumber":0}],
            'top-right-box':
              [{"template": "", "data":"", "css":"", "direction":"h", "groupNumber":0}],
            'middle-box':
              [{"template": "", "data":"", "css":"", "direction":"v", "groupNumber":0}],
            'bottom-right-box':
              [{"template": "", "data":"", "css":"", "direction":"h", "groupNumber":0}]
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
