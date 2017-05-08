;(function(app) {

  app.view('Builder', {
    template: [
      '<div class="area hide" region="top-left-box"></div>',
      '<div class="area hide" region="top-right-box"></div>',
      '<div class="area" region="middle-box"></div>',
      '<div class="area hide" region="bottom-right-box"></div>',
    ],
    coop: ['update-data'],
    onUpdateData: function(options) {
      var nameArray = options.name.split('-');
      nameArray.shift();
      var region = nameArray.join('-');
      if(region === this.$el.parent().attr('region')) {
        var boxes =  _.filter(options.newBoxes.boxes, function(box) {
          return box.boxName === options.box;
        });
        this.getViewIn(options.box).set({
          name: options.name,
          boxes: boxes
        });
      }
    },
    onReady: function() {
      var boxes = app.store.get(this.get('name')).boxes;
      this.$el.css({
        'padding': '1em',
        'display': 'flex',
        'flex-flow': 'row wrap',
        'justify-content': 'flex-end',
        'align-content': 'flex-start',
        'align-items': 'stretch',
        'overflow': 'auto'
      });
      var regionNames = ['top-left-box', 'top-right-box', 'middle-box', 'bottom-right-box'];
      var self = this;
      app.until(
        _.map(regionNames, function(name) {
          return (self.show(name, Box, {
            data: {
              name: self.get('name'),
              boxes: _.filter(boxes, function(box) {
                return box.boxName === name;
              })
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
      '<div class="triangle-top-left-box hide" action-click="toggle-top-left"></div>',
      '<div class="triangle-top-right-box hide" action-click="toggle-top-right"></div>',
      '<div class="direction hide" editor="direction" action="change-direction"></div>',
      '<div class="triangle-bottom-right-box hide" action-click="toggle-bottom-right"></div>',
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
        var groups = this.getRegion('group').$el.children(':first'),
          boxName = this.$el.parent().attr('region'),
          currenctDirection = this.getEditor('direction').getVal();
        if (currenctDirection==='v') {
          groups.css({
            'flex-direction': 'column',
          });
          var rowChildren = groups.children();
          for (var i=0; i<rowChildren.length; i++) {
            $(rowChildren[i]).css({
              'flex-direction': 'column',
            });
          }
        } else {
          groups.css({
            'flex-direction': 'row',
          });
          var columnChildren = groups.children();
          for (var j=0; j<columnChildren.length; j++) {
            $(columnChildren[j]).css({
              'flex-direction': 'row',
            });
          }
        }
        var arrayBoxes = app.store.get(this.get('name')).boxes;
        var editedBoxes = _.map(arrayBoxes, function(box) {
          if (box.boxName === boxName) {
            return {
              template:    box.template,
              data:        box.data,
              css:				 box.css,
              direction:   currenctDirection,
              boxName:     box.boxName,
              groupNumber: box.groupNumber
            };
          } else {
            return box;
          }
        });
        var newData = {
          boxes: editedBoxes
        };
        app.store.set(this.get('name'), newData);
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
        currentBuilder.find('.triangle-top-left-box').toggleClass('toggle-preview', this._preview);
        currentBuilder.find('.triangle-top-right-box').toggleClass('toggle-preview', this._preview);
        currentBuilder.find('.triangle-bottom-right-box').toggleClass('toggle-preview', this._preview);
        currentBuilder.find('.area').toggleClass('toggle-borders', this._preview);
      }
    },
    onReady: function() {
      this.more('group', this.get('boxes'), Group, true);
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
        var name = '.triangle-' + this.$el.parent().attr('region');
        this.$el.parent().parent().children('.region-middle-box').children(':first').children(name).toggleClass('triangle-show');
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
      '<div region="content"></div>',
      '<div region="add"></div>',
    ],
    useParentData: 'name',
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
      var addData = {
        obj: this.get()
      };
      this.show('add', AddButton, {
        data: addData
      });
    }
  });

  var Content = app.view({
    template: [
      '<div region="view-lock" action-click="edit-element">{{{element}}}</div>'
    ],
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
      var uniqueId = this.get('obj').name + '-' + this.get('obj').boxName + '-' + this.get('obj').groupNumber;
      if (this.get('obj').css) {
        this.$el.attr('id', uniqueId);
        var theme = $('head link[rel="stylesheet"]').attr('href').split('/')[1];
        var less = '#' + uniqueId + '{' + this.get('obj').css + '}';
        var self = this;
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
          var boxName = this.get('obj').boxName,
            groupNumber = this.get('obj').groupNumber;
          if (this.get('type') === 'edit') {
            //Editing an element
            var boxes = app.store.get(this.get('obj').name).boxes,
              rest = _.filter(boxes, function(box) {
                return (box.boxName !== boxName || box.groupNumber !== groupNumber);
              });
            var editedObj = {
              template:    this.getViewIn('tabs').$el.find('[region="tab-html"] [editor="code"] textarea').val(),
              data:        this.getEditor('data').getVal(),
              css:         this.getViewIn('tabs').$el.find('[region="tab-css"] [editor="code"] textarea').val(),
              direction:   this.get('obj').direction,
              boxName:     boxName,
              groupNumber: groupNumber
            };
            rest.push(editedObj);
            var newBoxes = {
              boxes: rest
            };
            var options = {
              newBoxes: newBoxes,
              name: this.get('obj').name,
              box: this.get('obj').boxName
            };
            app.store.set(this.get('obj').name, newBoxes);
            app.coop('update-data', options);
            this.close();
          } else {
            //Adding an element
            var newObj = {
              template:    this.getViewIn('tabs').$el.find('[region="tab-html"] [editor="code"] textarea').val(),
              data:        this.getEditor('data').getVal(),
              css:         this.getViewIn('tabs').$el.find('[region="tab-css"] [editor="code"] textarea').val(),
              direction:   this.get('obj').direction,
              boxName:     boxName,
              groupNumber: groupNumber + 1
            };
            var arrayBoxes = app.store.get(this.get('obj').name).boxes;
            var editedBoxes = _.map(arrayBoxes, function(box) {
              if (box.groupNumber <= groupNumber) {
                return box;
              } else {
                return {
                  template:    box.template,
                  data:        box.data,
                  css:         box.css,
                  direction:   box.direction,
                  boxName:     box.boxName,
                  groupNumber: box.groupNumber + 1
                };
              }
            });
            editedBoxes.push(newObj);
            var newData = {
              boxes: editedBoxes
            };
            var addOptions = {
              newBoxes: newData,
              name: this.get('obj').name,
              box: this.get('obj').boxName
            };
            app.store.set(this.get('obj').name, newData);
            app.coop('update-data', addOptions);
            this.close();
          }
        } else {
          //TODO: Why this is undefined?
      //    this.getViewIn('tabs').getViewIn('tab-html').getEditor('code').validate(true);
          this.getEditor('data').validate(true);
        }
      },
      cancel: function() {
        this.close();
      },
      delete: function() {
        var boxName   = this.get('obj').boxName,
          groupNumber = this.get('obj').groupNumber,
          direction   = this.get('obj').direction,
          template    = this.get('obj').template,
          data        = this.get('obj').data,
          css         = this.get('obj').css;
        var arrayBoxes = app.store.get(this.get('obj').name).boxes;
        var deletedBoxes = _.filter(arrayBoxes, function(box) {
          if (!(box.groupNumber === groupNumber &&
                box.boxName     === boxName &&
                box.direction   === direction &&
                box.template    === template &&
                box.data        === data &&
                box.css         === css)) {
            return box;
          }
        });
        var newData = {
          boxes: deletedBoxes
        };
        var options = {
          newBoxes: newData,
          name: this.get('obj').name,
          box: this.get('obj').boxName
        };
        app.store.set(this.get('obj').name, newData);
        var cssId = this.get('obj').name + '-' + this.get('obj').boxName + '-' + this.get('obj').groupNumber + '-css';
        $('#' + cssId).remove();
        app.coop('update-data', options);
        this.close();
      }
    },
    onReady: function() {
      this.$el.find('[tabId="html"]').addClass('active');
      var tabIds = ['css', 'html'];
      var self = this;
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
