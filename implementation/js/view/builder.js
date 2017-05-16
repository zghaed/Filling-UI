;(function(app) {

  app.view('Builder', {
    template: [
    //  '<div class="area hide" region="top-left-box"></div>',
    //  '<div class="area hide" region="top-right-box"></div>',
      '<div class="area" region="middle-box"></div>',
    //  '<div class="area hide" region="bottom-right-box"></div>',
    ],
    coop: ['update-data'],
    onUpdateData: function(options) {
      var name = options.name.split('/'),
        boxName = name.pop(),
        ViewAndRegion = name[0],
        nameArray = ViewAndRegion.split('-');
      nameArray.shift();
      var region = nameArray.join('-');
      if(region === this.$el.parent().attr('region')) {
        this.getViewIn(boxName).set({
          name: options.name,
          boxes: options.newBoxes
        });
      }
    },
    onReady: function() {
      var boxes = app.store.get(this.get('name'));
      this.$el.css({
      //  'padding': '1em',
        'display': 'flex',
        'flex-flow': 'row wrap',
        'justify-content': 'flex-end',
        'align-content': 'flex-start',
        'align-items': 'stretch',
        'overflow': 'auto'
      });
      var regionNames = ['middle-box'],//['top-left-box', 'top-right-box', 'middle-box', 'bottom-right-box'],
        self = this;
      app.until(
        _.map(regionNames, function(name) {
          return (self.show(name, Box, {
            data: {
              name: self.get('name') + '/' + name,
              boxes: boxes[name]
            }
          }));
        }),
       'ready', _.bind(function(boxes) {
         this.trigger('view:box-ready');
       }, this));
    },
    onClose: function() {
      $('[id^='+this.get('name')+']').remove();
    }
  });

  var Box = app.view({
    name: 'box',
    template: [
    //  '<div class="triangle-top-left-box hide" action-click="toggle-top-left"></div>',
    //  '<div class="triangle-top-right-box hide" action-click="toggle-top-right"></div>',
      '<div class="direction hide" editor="direction" action="change-direction"></div>',
    //  '<div class="triangle-bottom-right-box hide" action-click="toggle-bottom-right"></div>',
      '<div class="triangle-bottom-left-box hide" ui="toggle-preview" action-click="toggle-preview"></div>',
      '<div region="group"></div>',
    ],
    editors: {
      direction: {
        type: 'radios',
        className: 'radio-success',
        value: '',
        options: {
          inline: true,
          data: [
            {label: '<i class="glyphicon glyphicon-resize-horizontal" aria-hidden="true"></i>' , value: 'h'},
            {label: '<i class="glyphicon glyphicon-resize-vertical" aria-hidden="true"></i>', value: 'v'}
          ]
        }
      },
    },
    actions: {
      'change-direction': function() {
        app.notify('Action triggered!', 'Direction changed!');
        var groups = this.getRegion('group').$el,
          boxName = this.$el.parent().attr('region'),
          currenctDirection = this.getEditor('direction').getVal();
        if (currenctDirection==='v') {
          groups.css({
            'flex-direction': 'column',
          });
          var rowChildren = groups.children();
          for (var i=0; i<rowChildren.length; i++) {
            $(rowChildren[i]).find('.regional-group').css({
              'flex-direction': 'column',
            });
          }
        } else {
          groups.css({
            'flex-direction': 'row',
          });
          var columnChildren = groups.children();
          for (var j=0; j<columnChildren.length; j++) {
            $(columnChildren[j]).find('.regional-group').css({
              'flex-direction': 'row',
            });
          }
        }
        var name = this.get('name').split('/'),
          viewAndRegion = name[0],
          allBoxes = app.store.get(viewAndRegion),
          regionBoxes = allBoxes[boxName],
          editedBoxes = _.map(regionBoxes, function(box) {
            return {
              template:    box.template,
              data:        box.data,
              css:				 box.css,
              direction:   currenctDirection,
            };
          });
        allBoxes[boxName] = editedBoxes;
        app.store.set(viewAndRegion, allBoxes);
      },
      'toggle-top-left': function() {
        this.$el.parent().parent().children('.region-top-left-box').toggleClass('hide');
        this.$el.children('.triangle-top-left-box').toggleClass('triangle-show');
      },
      'toggle-top-right': function() {
        this.$el.parent().parent().children('.region-top-right-box').toggleClass('hide');
        this.$el.children('.triangle-top-right-box').toggleClass('triangle-show');
      },
      'toggle-bottom-right': function() {
        this.$el.parent().parent().children('.region-bottom-right-box').toggleClass('hide');
        this.$el.children('.triangle-bottom-right-box').toggleClass('triangle-show');
      },
      'toggle-preview': function() {
        if(this._preview === undefined)
          this._preview = false;
        var currentBuilder = this.$el.parent().parent();
        this._preview = !this._preview;
        currentBuilder.find('[action-click="edit-element"]').toggleClass('toggle-pointer', this._preview);
        currentBuilder.find('.add-button').toggleClass('toggle-preview', this._preview);
        currentBuilder.find('.direction').toggleClass('toggle-preview', this._preview);
    //    currentBuilder.find('.triangle-top-left-box').toggleClass('toggle-preview', this._preview);
    //    currentBuilder.find('.triangle-top-right-box').toggleClass('toggle-preview', this._preview);
    //    currentBuilder.find('.triangle-bottom-right-box').toggleClass('toggle-preview', this._preview);
        currentBuilder.find('.area').toggleClass('toggle-borders', this._preview);
      }
    },
    onReady: function() {
      var self = this,
        name = this.get('name').split('/'),
        boxName = name.pop(),
        viewAndRegion = name[0],
        groupNumber = 0;
      _.each(this.get('boxes'), function(box) {
        var id = viewAndRegion + '-' + boxName + '-' + groupNumber + '-id';
        box.name = self.get('name');
        box.groupNumber = groupNumber;
        self.getRegion('group').$el.append('<div id="'+id+'"></div>');
        var group =  new Group({data:box});
        self.spray($('#'+id), group);
        groupNumber = groupNumber + 1;
      });

      if (this.$el.parent().hasClass('region-middle-box')) {
        for (var i=0; i<this.$el.children().length-1; i++) {
          if (!this.$el.children().eq(i).hasClass('direction')) {
            this.$el.children().eq(i).removeClass('hide');
          }
        }
      }
      if (this.get('boxes').length > 1) {
        this.$el.children('.direction').removeClass('hide');
        this.$el.parent().removeClass('hide');
        var triangleName = '.triangle-' + this.$el.parent().attr('region');
        this.$el.parent().parent().children('.region-middle-box').children(':first').children(triangleName).toggleClass('triangle-show');
        var currentDirection = this.get('boxes')[0].direction;
        var groups = this.getRegion('group').$el.children(':first');
        if (currentDirection==='v') {
          this.getEditor('direction').setVal('v');
          groups.css({
            'flex-direction': 'column',
          });
          var rowChildren = groups.children();
          for (var j=0; j<rowChildren.length; j++) {
            $(rowChildren[j]).css({
              'flex-direction': 'column',
            });
          }
        } else {
          this.getEditor('direction').setVal('h');
          groups.css({
            'flex-direction': 'row',
          });
          var columnChildren = groups.children();
          for (var k=0; k<columnChildren.length; k++) {
            $(columnChildren[k]).css({
              'flex-direction': 'row',
            });
          }
        }
      }
    }
  });

  var Group = app.view('Group', {
    template: [
      '<div region="content">test</div>',
    //  '<div region="add"></div>',
    ],

    onReady: function() {

      if (this.get('template') !== '') {
        var theTemplateScript = this.get('template'),
          inputData = this.get('data'),
          jsonData = (inputData === '') ? '' : JSON.parse(inputData),
          preCompiledTemplateScript;
        if (Array.isArray(jsonData)) {
          preCompiledTemplateScript = '{{#each .}}' + theTemplateScript + '{{/each}}';
        } else {
          preCompiledTemplateScript = theTemplateScript;
        }
        var theTemplate = Handlebars.compile(preCompiledTemplateScript),
          theCompiledHTML = theTemplate(jsonData),
          contentData = {
            element: theCompiledHTML,
            obj: this.get()
          };
        this.show('content', Content, {
          data: contentData
        });
      }
      this.$el.css({
        'order': this.get('groupNumber'),
      });
      // var addData = {
      //   obj: this.get()
      // };
      // this.show('add', AddButton, {
      //   data: addData
      // });
    }
  });

  var Content = app.view({
    template: [
      '<div class="ui-draggable-item drag-top"></div>',
      //  '<div class="ui-draggable-item drag-left"></div>',
      '<div region="view-lock" action-click="edit-element">{{{element}}}</div>',
      '<div class="ui-draggable-item drag-bottom"></div>',
      //  '<div class="ui-draggable-item drag-right"></div>',
    ],
    dnd: {
      drag: true,
    },
    onDrag: function() {
      var offset = $(this.$el.find('.ui-draggable-dragging')).offset(),
        yPos = offset.top,
        currentHeight = yPos - this.initialOffset;
      this.$el.parent().css('height', currentHeight);
      this.$el.find('.drag-bottom').css('top', currentHeight);
    },
    onDrop: function() {
      console.log('dropped');
    },
    actions: {
      'edit-element': function($btn) {
        var obj = this.get('obj');
        (new PopOver({
          data: {
            type: 'edit',
            html: obj.template,
            data: obj.data,
            css:  obj.css,
            obj:  obj
          }
        })).popover($btn, {placement: 'top', bond: this, style: {width: '600px'}});
      }
    },
    onReady: function() {
      var bottomHandle = this.$el.find('.drag-bottom'),
        topHandle = this.$el.find('.drag-top'),
        marginLeft = parseInt(this.$el.css('width')) / 2;
      bottomHandle.css('margin-left', marginLeft);
      bottomHandle.css('top', this.get('height'));
      this.initialOffset = parseInt(this.$el.find('.drag-bottom').offset().top) - this.$el.height();
      var name  = this.get('obj').name.split('/'),
        boxName = name.pop(),
        viewAndRegion = name[0],
        uniqueId = viewAndRegion + '-' + boxName + '-' + this.get('obj').groupNumber;
      if (this.get('obj').css) {
        this.$el.attr('id', uniqueId);
        var theme = $('head link[rel="stylesheet"]').attr('href').split('/')[1],
          less = '#' + uniqueId + '{' + this.get('obj').css + '}',
          self = this;
        if (self.flag === undefined) {
          self.flag = true;
        }
        self.lock('view-lock', self.flag, 'fa fa-spinner fa-spin fa-3x');
        self.flag = !self.flag;
        app.remote({
          url: 'api/test',
          payload: {
            less: less,
            theme: theme
          }
        }).done(function(data) {
          self.lock('view-lock', self.flag, 'fa fa-spinner fa-spin fa-3x');
          var uniqueCSS = uniqueId + '-css';
          $('#' +  uniqueCSS).remove();
          $('head').append('<style id="' + uniqueCSS + '">' + data.msg + '</style>');
          bottomHandle.css('top', self.$el.height());
          // topHandle.css('margin-left', marginLeft);
        });
      } else {
        var uniqueCSS = uniqueId + '-css';
        $('#' +  uniqueCSS).remove();
      }
    }
  });

  var AddButton = app.view({
    template: [
      '<div class="add-button" action-click="add-element" data-placement="bottom"><i class="fa fa-plus-circle fa-lg"></i></div>'
    ],
    actions: {
      'add-element': function($btn) {
        (new PopOver({
          data: {
            type: 'add',
            obj: this.get('obj')
          }
        })).popover($btn, {placement: 'top', bond: this, style: {width: '600px'}});
      }
    }
  });

  var PopOver = app.view({
    template: [
      '<div class="col-md-12">',
      '<div class="row">',
      '<div class="form form-horizontal">',
      '<ul class="nav nav-tabs">',
      '<li activate="single" tabId="html"><a>html</a></li>',
      '<li activate="single" tabId="css"><a>css</a></li>',
      '</ul>',
      '<div region="tabs"></div>',
      '<div editor="data"></div>',
      '</div>',
      '</div>',
      '</div>',
      '<div class="row">',
      '<span class="btn btn-primary" action-click="submit">Submit</span>',
      '<span class="btn btn-info btn-outline" action-click="cancel">Cancel</span>',
      '<span class="btn btn-danger delete-group" action-click="delete">Delete</span>',
      '</div>'
    ],
    onItemActivated: function($item) {
      var tabId = $item.attr('tabId');
      this.tab('tabs', app.view({
        template: ['<div editor="code"></div>'],
        useParentData: tabId,
        editors: {
          code: {
            value: this.get(tabId),
            label: tabId,
            type: 'textarea',
            placeholder: tabId,
            validate: {
              required: true
            }
          }
        }
      }), tabId);
    },
    editors: {
      data: {
        label: 'Data',
        type: 'textarea',
        placeholder: 'Data',
        validate: function(val) {
          try {
            if(val) JSON.parse(val);
          } catch (e) {
            return 'Data needs to be in JSON format';
          }
          return true;
        }
      }
    },
    actions: {
      submit: function() {
        if (this.getViewIn('tabs').$el.find('[region="tab-html"] [editor="code"] textarea').val() &&
          (this.getEditor('data').validate()===true)) {
          //HTML field is not empty
          var obj = this.get('obj'),
            arrayName = obj.name.split('/'),
            boxName = arrayName.pop(),
            viewAndRegion = arrayName[0],
            groupNumber = obj.groupNumber;
          if (this.get('type') === 'edit') {
            //Editing an element
            var allBoxes = app.store.get(viewAndRegion),
              editRegionBoxes = allBoxes[boxName],
              editedObj = {
                template:    this.getViewIn('tabs').$el.find('[region="tab-html"] [editor="code"] textarea').val(),
                data:        this.getEditor('data').getVal(),
                css:         this.getViewIn('tabs').$el.find('[region="tab-css"] [editor="code"] textarea').val(),
                direction:   obj.direction,
              };
            editRegionBoxes[groupNumber] = editedObj;
            allBoxes[boxName] = editRegionBoxes;
            var options = {
              newBoxes: allBoxes[boxName],
              name: obj.name
            };
            app.store.set(viewAndRegion, allBoxes);
            app.coop('update-data', options);
            this.close();
          } else {
            //Adding an element
            var newObj = {
              template:    this.getViewIn('tabs').$el.find('[region="tab-html"] [editor="code"] textarea').val(),
              data:        this.getEditor('data').getVal(),
              css:         this.getViewIn('tabs').$el.find('[region="tab-css"] [editor="code"] textarea').val(),
              direction:   obj.direction,
            },
              cacheData = app.store.get(viewAndRegion),
              addRegionBoxes = cacheData[boxName];

            addRegionBoxes.splice(groupNumber + 1, 0 , newObj);
            cacheData[boxName] = addRegionBoxes;
            var addOptions = {
              newBoxes: cacheData[boxName],
              name: obj.name
            };
            app.store.set(viewAndRegion, cacheData);
            app.coop('update-data', addOptions);
            this.close();
          }
        } else {
          //TODO: Why this is undefined?
          console.log('tbas, ', this.getViewIn('tabs').$el.getViewIn('tab-html'));
          //this.getViewIn('tabs').getViewIn('tab-html').getEditor('code').validate(true);
          this.getEditor('data').validate(true);
        }
      },
      cancel: function() {
        this.close();
      },
      delete: function() {
        var obj = this.get('obj'),
          name = obj.name,
          nameArray = name.split('/'),
          boxName = nameArray.pop(),
          viewAndRegion = nameArray[0],
          groupNumber = obj.groupNumber,
          direction = obj.direction,
          template = obj.template,
          data = obj.data,
          css = obj.css,
          cacheData = app.store.get(viewAndRegion),
          deleteRegionBoxes = cacheData[boxName];

        deleteRegionBoxes.splice(groupNumber, 1);
        cacheData[boxName] = deleteRegionBoxes;
        var options = {
          newBoxes: cacheData[boxName],
          name: name
        };
        app.store.set(viewAndRegion, cacheData);
        var cssId = viewAndRegion + '-' + boxName + '-' + groupNumber + '-css';
        $('#' + cssId).remove();
        app.coop('update-data', options);
        this.close();
      }
    },
    onReady: function() {
      this.$el.find('[tabId="html"]').addClass('active');
      var tabIds = ['css', 'html'],
        self = this;
      _.map(tabIds, function(tabId) {
        self.tab('tabs', app.view({
          template: ['<div editor="code"></div>'],
          useParentData: tabId,
          editors: {
            code: {
              value: self.get(tabId),
              label: tabId,
              type: 'textarea',
              placeholder: tabId,
              validate: {
                required: true
              }
            }
          }
        }), tabId);
      });
      if (this.get('type') === 'add') {
        this.$el.find('.delete-group').addClass('hide');
      }
      this.$el.find('textarea').css('height', '200px');
    }
  });
})(Application);
