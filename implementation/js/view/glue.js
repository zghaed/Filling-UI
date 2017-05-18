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
          height = parseInt(target.height())/2,
          cacheName = this.getViewIn('glue-region').name + '-' + target.attr('region'),
          regions = (target.attr('region') === undefined) ||
            (target.attr('region') === ('middle-box' || 'top-left-box' || 'top-right-box' || 'bottom-right-box')),
          allCaches = app.store.getAll();
          console.log('height, ', height);
        if (!(allCaches[cacheName] || regions)) {
          var builder = app.get('Builder').create({
            data: {
              "name" : cacheName
             }
          });
          app.store.set(cacheName, app.store.get(cacheName) || {
            // 'top-left-box':
            //   [{'template': '', 'data':'', 'css':'', 'direction':'h'}],
            // 'top-right-box':
            //   [{'template': '', 'data':'', 'css':'', 'direction':'h'}],
            'middle-box':
            [{'template': 'bye', 'data':'', 'css':'height:'+height+'px;position:relative;.regional-group{position:relative;height:100%;width:100%;}', 'direction':'v'},
          {'template': 'bye', 'data':'', 'css':'height:'+height+'px;position:relative;.regional-group{position:relative;height:100%;width:100%;}', 'direction':'v'},],
            // 'bottom-right-box':
            //   [{'template': '', 'data':'', 'css':'', 'direction':'h'}]
          });
          this.spray(target, builder);
        }
      }
    },
    onReady: function() {
      if (this.getViewIn('glue-region')) {
        var caches = app.store.getAll(),
          keys = [],
          viewName = this.getViewIn('glue-region').name,
          regionNames = ['middle-box'];//['top-left-box', 'top-right-box', 'middle-box', 'bottom-right-box'];
        _.each(caches, function(val, key) {
          var keyArray = key.split('-');
          if (keyArray[0] === viewName) {
            var groups = 0;
            _.each(regionNames, function(region) {
              groups += caches[key][region].length;
            });
            console.log('groups, ', groups);
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
            // 'top-left-box':
            //   [{'template': '', 'data':'', 'css':'', 'direction':'h'}],
            // 'top-right-box':
            //   [{'template': '', 'data':'', 'css':'', 'direction':'h'}],
            'middle-box':
              [{'template': 'bye', 'data':'', 'css':'height:'+height+'px;position:relative;.regional-group{position:relative;height:100%;width:100%;}', 'direction':'v'},
            {'template': 'bye', 'data':'', 'css':'height:'+height+'px;position:relative;.regional-group{position:relative;height:100%;width:100%;}', 'direction':'v'},],
            // 'bottom-right-box':
            //   [{'template': '', 'data':'', 'css':'', 'direction':'h'}]
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
