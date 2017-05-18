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
      console.log('region in coop is, ', region);
      if(region === this.$el.parent().attr('region')) {
        //TODO: empty array remove existing view
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
        //TODO: toggle preview
    //     if(this._preview === undefined)
    //       this._preview = false;
    //     var currentBuilder = this.$el.parent().parent();
    //     this._preview = !this._preview;
    //     currentBuilder.find('[action-click="edit-element"]').toggleClass('toggle-pointer', this._preview);
    //     currentBuilder.find('.add-button').toggleClass('toggle-preview', this._preview);
    //     currentBuilder.find('.direction').toggleClass('toggle-preview', this._preview);
    //     currentBuilder.find('.triangle-top-left-box').toggleClass('toggle-preview', this._preview);
    //     currentBuilder.find('.triangle-top-right-box').toggleClass('toggle-preview', this._preview);
    //     currentBuilder.find('.triangle-bottom-right-box').toggleClass('toggle-preview', this._preview);
    //     currentBuilder.find('.area').toggleClass('toggle-borders', this._preview);
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
      //TODO: add direction and consider height of change direction
      //if (this.get('boxes').length > 1) {
      if (false) {
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
      '<div class="ui-draggable-item drag-top"></div>',
      //  '<div class="ui-draggable-item drag-left"></div>',
      '<div region="content"></div>',
      '<div class="ui-draggable-item drag-bottom"></div>',
      //  '<div class="ui-draggable-item drag-right"></div>',
    //  '<div region="add"></div>',
    ],
    dnd: {
      drag: {
        helper: 'original'
      }
    },
    flag: true,
    onDrag: function(event, ui) {
      var currentHeight;
      if (event.hasClass('drag-bottom')) {
         this.change = arguments[1].originalPosition.top  - arguments[1].position.top;
         this.$el.css('height', arguments[1].position.top + this.$el.find('.drag-bottom').height());
      } else if (event.hasClass('drag-top')) {
      //  this.$el.find('.drag-top').css('top', 0);
        this.$el.css('top', this.initialTop + arguments[1].position.top);
        this.$el.find('.drag-top').css('top', 0);
        this.change = arguments[1].position.top - arguments[1].originalPosition.top;
        if (this.flag) {
          this.initialHeight = this.$el.height();
          this.flag = false;
        }
        this.$el.css('height', this.initialHeight - this.change);
      }
    },
    onDragStop: function(event, ui) {
      //TODO: Disable creating new group for middle dragging
      this.$el.find('.drag-top').css('left', '50%');
      this.$el.find('.drag-bottom').css('left', '50%');
      this.initialHeight = parseInt(this.$el.css('height'));
      this.initialTop = parseInt(this.$el.css('top'));
    //  debugger;
      var id = this.$el.parent().attr('id');
      var arrayId = id.split('-');
      arrayId.pop();
      var name = this.get('name').split('/'),
        viewAndRegion = name[0],
        allBoxes = app.store.get(viewAndRegion),
        addGroup = allBoxes[name[1]],
        last = addGroup.length - 1;
        groupNumber = arrayId.pop();
      if (parseInt(groupNumber) === 0 || parseInt(groupNumber) === last) {
        var newData = {
          template: 'Add',
          data: '',
          css: 'height:' + this.change + 'px;position:relative;.regional-group{position:relative;height:100%;width:100%;}',
          direction: 'v'
        };
        if (event.hasClass('drag-top')) {
          var editedDataTop = {
            template: addGroup[0].template,
            data: addGroup[0].data,
            css: 'height:' + this.initialHeight + 'px;position:relative;.regional-group{position:relative;height:100%;width:100%;}',
            direction: addGroup[0].direction
          };
          addGroup.shift();
          addGroup.unshift(editedDataTop);
          addGroup.unshift(newData);
        } else if (event.hasClass('drag-bottom')){
          var index = addGroup.length - 1;
          var editedDataBottom = {
            template: addGroup[index].template,
            data: addGroup[index].data,
            css: 'height:' + this.initialHeight + 'px;position:relative;.regional-group{position:relative;height:100%;width:100%;}',
            direction: addGroup[index].direction
          };
          addGroup.pop();
          addGroup.push(editedDataBottom);
          addGroup.push(newData);
        }
        allBoxes[name[1]] = addGroup;
        var options = {
          newBoxes: allBoxes[name[1]],
          name: this.get('name')
        };
         app.store.set(viewAndRegion, allBoxes);
         var cssId = viewAndRegion + '-' + name[1] + '-' + groupNumber + '-css';
         $('#' + cssId).remove();
         app.coop('update-data', options);
      } else {
        console.log('middle box is changed', groupNumber===last);
      }
    },
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
      this.$el.find('.drag-top').css('left', '50%');
      this.$el.find('.drag-bottom').css('left', '50%');
      this.initialTop = 0;
    }
  });

  var Content = app.view({
    template: [
      '<div region="view-lock" action-click="edit-element">{{{element}}}</div>',
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
      var name  = this.get('obj').name.split('/'),
        boxName = name.pop(),
        viewAndRegion = name[0],
        uniqueId = viewAndRegion + '-' + boxName + '-' + this.get('obj').groupNumber ;
      if (this.get('obj').css) {
        this.$el.attr('id', uniqueId);
        var theme = $('head link[rel="stylesheet"]').attr('href').split('/')[1],
          less = '#' + uniqueId + '-id {' + this.get('obj').css + '}',
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
      '<li activate="single" tabid="html"><a>html</a></li>',
      '<li activate="single" tabid="css"><a>css</a></li>',
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
      var tabid = $item.attr('tabid');
      this.tab('tabs', app.view({
        template: ['<div editor="code"></div>'],
        useParentData: tabid,
        editors: {
          code: {
            value: this.get(tabid),
            label: tabid,
            type: 'textarea',
            placeholder: tabid,
            validate: {
              required: true
            }
          }
        }
      }), tabid);
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
        //TODO: change the height of surronding elements
        var obj = this.get('obj'),
          name = obj.name,
          nameArray = name.split('/'),
          boxName = nameArray.pop(),
          viewAndRegion = nameArray[0],
          region = viewAndRegion.split('-').pop(),
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
        if (cacheData[boxName].length > 0) {
          app.store.set(viewAndRegion, cacheData);
        } else {
          app.store.set(viewAndRegion);
        //  $('[region='+ region + ']').children(':first').remove();
        }
        var cssId = viewAndRegion + '-' + boxName + '-' + groupNumber + '-css';
        $('#' + cssId).remove();
        app.coop('update-data', options);
        this.close();
      }
    },
    onReady: function() {
      this.$el.find('[tabid="html"]').addClass('active');
      var tabids = ['css', 'html'],
        self = this;
      _.map(tabids, function(tabid) {
        self.tab('tabs', app.view({
          template: ['<div editor="code"></div>'],
          useParentData: tabid,
          editors: {
            code: {
              value: self.get(tabid),
              label: tabid,
              type: 'textarea',
              placeholder: tabid,
              validate: {
                required: true
              }
            }
          }
        }), tabid);
      });
      if (this.get('type') === 'add') {
        this.$el.find('.delete-group').addClass('hide');
      }
      this.$el.find('textarea').css('height', '200px');
    }
  });
})(Application);
