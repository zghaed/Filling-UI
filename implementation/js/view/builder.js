;(function(app) {
  app.view('Builder', {
    template: [
      '<div class="area" region="middle-box"></div>',
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
        //TODO: empty array remove existing view
        this.getViewIn(boxName).set({
          name:      options.name,
          direction: options.direction,
          boxes:     options.newBoxes
        });
      }
    },
    onReady: function() {
      var boxes = app.store.get(this.get('name'));
      this.$el.css({
        'overflow': 'auto'
      });
      var regionNames = ['middle-box'],
        self = this,
        direction = 'direction';
      app.until(
        _.map(regionNames, function(name) {
          return (self.show(name, Box, {
            data: {
              name: self.get('name') + '/' + name,
              direction: boxes[direction],
              boxes: boxes[name],
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
      '<div class="direction hide" editor="direction" action="change-direction"></div>',
      '<div class="triangle-bottom-left-box hide" ui="toggle-preview" action-click="toggle-preview"></div>',
      '<div region="group"></div>',
      '<div region="string"></div>',
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
        var groups = this.getRegion('group').$el,
          boxName = this.$el.parent().attr('region'),
          currenctDirection = this.getEditor('direction').getVal();
        if (currenctDirection==='v') {
          this.$el.find('.drag-bottom').removeClass('hide');
          this.$el.find('.drag-top').removeClass('hide');
          this.$el.find('.drag-left').addClass('hide');
          this.$el.find('.drag-right').addClass('hide');
          groups.css({
            'flex-direction': 'column',
          });
        } else {
          this.$el.find('.drag-bottom').addClass('hide');
          this.$el.find('.drag-top').addClass('hide');
          this.$el.find('.drag-left').removeClass('hide');
          this.$el.find('.drag-right').removeClass('hide');
          groups.css({
            'flex-direction': 'row',
          });
        }
        var name = this.get('name').split('/'),
          viewAndRegion = name[0],
          allBoxes = app.store.get(viewAndRegion),
          direction = 'direction';
        allBoxes[direction] = currenctDirection;
        app.store.set(viewAndRegion, allBoxes);
      },
      'toggle-preview': function() {
        //  app.notify('Action triggered!', 'Direction changed!');
        //TODO: toggle preview
    //     if(this._preview === undefined)
    //       this._preview = false;
    //     var currentBuilder = this.$el.parent().parent();
    //     this._preview = !this._preview;
    //     currentBuilder.find('[action-click="edit-element"]').toggleClass('toggle-pointer', this._preview);
    //     currentBuilder.find('.add-button').toggleClass('toggle-preview', this._preview);
    //     currentBuilder.find('.direction').toggleClass('toggle-preview', this._preview);
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
        if (self.get('direction') == 'v') {
          group.$el.find('.drag-left').addClass('hide');
          group.$el.find('.drag-right').addClass('hide');
        } else if (self.get('direction') == 'h') {
          group.$el.find('.drag-top').addClass('hide');
          group.$el.find('.drag-bottom').addClass('hide');
        }
        groupNumber = groupNumber + 1;
      });
      if (this.$el.parent().hasClass('region-middle-box')) {
        for (var i=0; i<this.$el.children().length-1; i++) {
          if (!this.$el.children().eq(i).hasClass('direction')) {
            this.$el.children().eq(i).removeClass('hide');
          }
        }
      }
      if (this.get('boxes').length > 0) {
        this.$el.children('.direction').removeClass('hide');
        this.$el.parent().removeClass('hide');
        var triangleName = '.triangle-' + this.$el.parent().attr('region');
        this.$el.parent().parent().children('.region-middle-box').children(':first').children(triangleName).toggleClass('triangle-show');
        var currentDirection = this.get('direction');
        var groups = this.getRegion('group').$el;
        if (currentDirection==='v') {
          groups.css({
            'flex-direction': 'column',
          });
        } else if (currentDirection==='h') {
          this.getEditor('direction').setVal('h');
          groups.css({
            'flex-direction': 'row',
          });
        }
      }
    }
  });

  var Group = app.view('Group', {
    template: [
      '<div class="ui-draggable-item drag-top"></div>',
      '<div class="ui-draggable-item drag-left"></div>',
      '<div region="content"></div>',
      '<div class="ui-draggable-item drag-right"></div>',
      '<div class="ui-draggable-item drag-bottom"></div>',
    ],
    dnd: {
      drag: {
        helper: 'original'
      }
    },
    heightFlag: true,
    widthFlag: true,
    onDrag: function(event, ui) {
      var id = this.$el.parent().attr('id');
      var arrayId = id.split('-');
      arrayId.pop();
      var name = this.get('name').split('/'),
        viewAndRegion = name[0],
        allBoxes = app.store.get(viewAndRegion),
        addGroup = allBoxes[name[1]],
        last = addGroup.length - 1;
        groupNumber = arrayId.pop();
      if (event.hasClass('drag-bottom')) {
        if (this.heightFlag) {
          this.initialHeight = this.$el.height();
          this.initialBasis = parseInt(this.$el.parent().css('flex-basis'));
        }
        var newBottomHeight = parseInt(this.change/this.initialHeight*this.initialBasis);
        this.change = arguments[1].originalPosition.top  - arguments[1].position.top;
        var bottomHeight = this.initialBasis - newBottomHeight;
        this.$el.parent().css('flex', '0 1 '+ bottomHeight +'%');
        if (parseInt(groupNumber) === last) {
          if (this.heightFlag) {
            this.heightFlag = false;
          }
          $('#new').css('flex', '0 1 '+ newBottomHeight +'%');
        } else {
          var currentIdBottom = this.$el.parent().attr('id');
          var nextBottom = $('#' + currentIdBottom).next();
          if (this.heightFlag) {
            this.nextBasis = parseInt(nextBottom.css('flex-basis'));
            this.heightFlag = false;
          }
          var newNextHeightBottom = newBottomHeight + this.nextBasis;
          nextBottom.css('flex', '0 1 '+ newNextHeightBottom +'%');
        }
      } else if (event.hasClass('drag-top')) {
        if (this.heightFlag) {
          this.initialHeight = this.$el.height();
          this.initialBasis = parseInt(this.$el.parent().css('flex-basis'));
        }
        this.change = arguments[1].position.top - arguments[1].originalPosition.top;
        var newTopHeight = parseInt(this.change/this.initialHeight*this.initialBasis);
        var newHeight = this.initialBasis - newTopHeight;
        this.$el.parent().css('flex', '0 1 '+ newHeight +'%');
        if (parseInt(groupNumber) === 0) {
          if (this.heightFlag) {
            this.heightFlag = false;
          }
          $('#new').css('flex', '0 1 '+ newTopHeight +'%');
          this.$el.parent().css('flex', '0 1 '+ newHeight +'%');
        } else {
          var currentId = this.$el.parent().attr('id');
          var prev = $('#' + currentId).prev();
          if (this.heightFlag) {
            this.prevBasis = parseInt(prev.css('flex-basis'));
            this.heightFlag = false;
          }
          var prevHeight = newTopHeight + this.prevBasis;
          prev.css('flex', '0 1 '+ prevHeight +'%');
        }
      } else if (event.hasClass('drag-left')) {
        if (this.widthFlag) {
          this.initialWidth = this.$el.width();
          this.initialBasis = parseInt(this.$el.parent().css('flex-basis'));
        }
        this.change = arguments[1].position.left - arguments[1].originalPosition.left;
        var newLeftWidth = parseInt(this.change/this.initialWidth*this.initialBasis);
        var newWidth = this.initialBasis - newLeftWidth;
        this.$el.parent().css('flex', '0 1 '+ newWidth +'%');
        if (parseInt(groupNumber) === 0) {
          if (this.widthFlag) {
           this.widthFlag = false;
          }
          $('#new').css('flex', '0 1 '+ newLeftWidth +'%');
        } else {
          var currentLeftId = this.$el.parent().attr('id');
          var prevLeft = $('#' + currentLeftId).prev();
          if (this.widthFlag) {
           this.prevBasis = parseInt(prevLeft.css('flex-basis'));
           this.widthFlag = false;
          }
          var prevWidth = newLeftWidth + this.prevBasis;
          prevLeft.css('flex', '0 1 '+ prevWidth +'%');
        }
      } else if (event.hasClass('drag-right')) {
        if (this.widthFlag) {
          this.initialWidth = this.$el.width();
          this.initialBasis = parseInt(this.$el.parent().css('flex-basis'));
        }
        var newRightWidth = parseInt(this.change/this.initialWidth*this.initialBasis);
        this.change = arguments[1].originalPosition.left  - arguments[1].position.left;
        var rightWidth = this.initialBasis - newRightWidth;
        this.$el.parent().css('flex', '0 1 '+ rightWidth +'%');
        if (parseInt(groupNumber) === last) {
          if (this.widthFlag) {
            this.widthFlag = false;
          }
           $('#new').css('flex', '0 1 '+ newRightWidth +'%');
        } else {
          var currentIdRight = this.$el.parent().attr('id');
          var nextRight = $('#' + currentIdRight).next();
          if (this.widthFlag) {
            this.nextBasis = parseInt(nextRight.css('flex-basis'));
            this.widthFlag = false;
          }
          var newNextWidthRight = newRightWidth + this.nextBasis;
          nextRight.css('flex', '0 1 '+ newNextWidthRight +'%');
        }
      }
    },
    onDragStart: function(event, ui) {
      var id = this.$el.parent().attr('id'),
        arrayId = id.split('-');
      arrayId.pop();
      var name = this.get('name').split('/'),
        viewAndRegion = name[0],
        allBoxes = app.store.get(viewAndRegion),
        addGroup = allBoxes[name[1]],
        direction = 'direction',
        last = addGroup.length - 1,
        groupNumber = arrayId.pop(),
        groups = this.$el.parent().parent();
      if (event.hasClass('drag-top')) {
        if (parseInt(groupNumber) === 0) {
          if (last === parseInt(groupNumber)) {
            allBoxes[direction] = 'v';
            groups.css({
              'flex-direction': 'column',
            });
            app.store.set(viewAndRegion, allBoxes);
          }
          this.$el.find('.drag-left').hide();
          this.$el.find('.drag-right').hide();
          $('<div id="new"></div>').insertBefore('#' + id);
        }
      } else if (event.hasClass('drag-bottom')) {
        if (parseInt(groupNumber) === last) {
          if (last === 0) {
            allBoxes[direction] = 'v';
            groups.css({
              'flex-direction': 'column',
            });
            app.store.set(viewAndRegion, allBoxes);
          }
          this.$el.find('.drag-left').hide();
          this.$el.find('.drag-right').hide();
          $('<div id="new"></div>').insertAfter('#' + id);
        }
      } else if (event.hasClass('drag-left')) {
        if (parseInt(groupNumber) === 0) {
          if (last === parseInt(groupNumber)) {
            allBoxes[direction] = 'h';
            groups.css({
              'flex-direction': 'row',
            });
            app.store.set(viewAndRegion, allBoxes);
          }
          this.$el.find('.drag-top').hide();
          this.$el.find('.drag-bottom').hide();
          $('<div id="new"></div>').insertBefore('#' + id);
        }
      } else if (event.hasClass('drag-right')) {
        if (parseInt(groupNumber) === last) {
          if (last === 0) {
            allBoxes[direction] = 'h';
            groups.css({
              'flex-direction': 'row',
            });
            app.store.set(viewAndRegion, allBoxes);
          }
          this.$el.find('.drag-top').hide();
          this.$el.find('.drag-bottom').hide();
          $('<div id="new"></div>').insertAfter('#' + id);
        }
      }
    },
    onDragStop: function(event, ui) {
      var currentId = this.$el.parent().attr('id');
      var prev = $('#' + currentId).prev();
      var next = $('#' + currentId).next();
      this.$el.find('.drag-top').css('left', '50%');
      this.$el.find('.drag-bottom').css('left', '50%');
      this.$el.find('.drag-left').css('top', '50%');
      this.$el.find('.drag-right').css('top', '50%');
      this.initialHeight = parseInt(this.$el.css('height'));
      this.initialWidth = parseInt(this.$el.css('width'));
      this.initialBasis = parseInt(this.$el.parent().css('flex-basis'));
      this.heightFlag = true;
      this.widthFlag = true;
      this.prevBasis = parseInt(prev.css('flex-basis'));
      this.nextBasis = parseInt(next.css('flex-basis'));
      var id = this.$el.parent().attr('id'),
        arrayId = id.split('-'),
        flag = false;
      arrayId.pop();
      var name = this.get('name').split('/'),
        viewAndRegion = name[0],
        allBoxes = app.store.get(viewAndRegion),
        addGroup = allBoxes[name[1]],
        direction = 'direction',
        last = addGroup.length - 1;
        groupNumber = arrayId.pop();
      var newData = {
        template: '',
        data: '',
        less: '',
        css_container: '0 1 ' + $('#new').css('flex-basis')
      };
      var editedData = {
        template: addGroup[parseInt(groupNumber)].template,
        data: addGroup[parseInt(groupNumber)].data,
        less: addGroup[parseInt(groupNumber)].less,
        css_container: '0 1 ' + this.$el.parent().css('flex-basis')
      };
      if (parseInt(groupNumber) === last) {
        if (event.hasClass('drag-bottom')) {
          addGroup = addGroup.slice(0,-1);
          addGroup.push(editedData);
          addGroup.push(newData);
          flag = true;
        } else if (event.hasClass('drag-right')) {
          addGroup = addGroup.slice(0,-1);
          addGroup.push(editedData);
          addGroup.push(newData);
          flag = true;
        }
      }
      if (parseInt(groupNumber) === 0) {
        if (event.hasClass('drag-top')) {
          addGroup.shift();
          addGroup.unshift(editedData);
          addGroup.unshift(newData);
          flag = true;
        } else if (event.hasClass('drag-left')) {
          addGroup.shift();
          addGroup.unshift(editedData);
          addGroup.unshift(newData);
          flag = true;
        }
      }
      if (flag === true) {
        allBoxes[name[1]] = addGroup;
        var options = {
          newBoxes: allBoxes[name[1]],
          direction: allBoxes[direction],
          name: this.get('name')
        };
        app.store.set(viewAndRegion, allBoxes);
        var cssId = viewAndRegion + '-' + name[1] + '-' + groupNumber + '-css';
        $('#' + cssId).remove();
        app.coop('update-data', options);
      }
    },
    onReady: function() {
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
      this.$el.css({
        'order': this.get('groupNumber'),
      });
      this.$el.find('.drag-top').css('left', '50%', 'important');
      this.$el.find('.drag-bottom').css('left', '50%', 'important');
      this.$el.find('.drag-left').css('top', '50%', 'important');
      this.$el.find('.drag-right').css('top', '50%', 'important');
    }
  });

  var Content = app.view({
    template: [
      '<div region="view-lock" action="edit-element">{{{element}}}</div>',
    ],
    actions: {
      'edit-element': function($btn, e) {
        console.log('just clicked with ctrl', e);
        if (e.ctrlKey) {
        console.log('just clicked with ctrl');
        }
        var obj = this.get('obj');
        (new PopOver({
          data: {
            type: 'edit',
            html: obj.template,
            data: obj.data,
            css_container:  obj.css_container,
            less: obj.less,
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
      if (this.get('obj').less) {
        this.$el.attr('id', uniqueId);
        var theme = $('head link[rel="stylesheet"]').attr('href').split('/')[1],
          less = '#' + uniqueId + '-id {' + this.get('obj').less + '}',
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
      if (this.get('obj').css_container) {
        $('#' + uniqueId + '-id').css('flex', this.get('obj').css_container);
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
      '<li activate="single" tabid="less"><a>less</a></li>',
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
            groupNumber = obj.groupNumber,
            direction = 'direction';
          if (this.get('type') === 'edit') {
            //Editing an element
            var allBoxes = app.store.get(viewAndRegion),
              editRegionBoxes = allBoxes[boxName],
              editedObj = {
                template:      this.getViewIn('tabs').$el.find('[region="tab-html"] [editor="code"] textarea').val(),
                data:          this.getEditor('data').getVal(),
                less:          this.getViewIn('tabs').$el.find('[region="tab-less"] [editor="code"] textarea').val(),
                css_container: obj.css_container
              };
            editRegionBoxes[groupNumber] = editedObj;
            allBoxes[boxName] = editRegionBoxes;
            var options = {
              newBoxes: allBoxes[boxName],
              direction: allBoxes[direction],
              name: obj.name
            };
            app.store.set(viewAndRegion, allBoxes);
            app.coop('update-data', options);
            this.close();
          } else {
            //Adding an element
            var newObj = {
              template:      this.getViewIn('tabs').$el.find('[region="tab-html"] [editor="code"] textarea').val(),
              data:          this.getEditor('data').getVal(),
              less:          this.getViewIn('tabs').$el.find('[region="tab-less"] [editor="code"] textarea').val(),
              css_container: obj.css_container
            },
              cacheData = app.store.get(viewAndRegion),
              addRegionBoxes = cacheData[boxName];
            addRegionBoxes.splice(groupNumber + 1, 0 , newObj);
            cacheData[boxName] = addRegionBoxes;
            var addOptions = {
              newBoxes: cacheData[boxName],
              dirction: cacheData[direction],
              name: obj.name
            };
            app.store.set(viewAndRegion, cacheData);
            app.coop('update-data', addOptions);
            this.close();
          }
        } else {
          //TODO: Why this is undefined?
          console.log('tabs, ', this.getViewIn('tabs').$el.getViewIn('tab-html'));
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
          template = obj.template,
          data = obj.data,
          css_container = obj.css_container,
          less = obj.less,
          direction = 'direction',
          cacheData = app.store.get(viewAndRegion),
          deleteRegionBoxes = cacheData[boxName];

        deleteRegionBoxes.splice(groupNumber, 1);
        cacheData[boxName] = deleteRegionBoxes;
        var options = {
          newBoxes: cacheData[boxName],
          direction: cacheData[direction],
          name: name
        };
        if (cacheData[boxName].length > 0) {
          app.store.set(viewAndRegion, cacheData);
        } else {
          app.store.set(viewAndRegion);
        }
        var cssId = viewAndRegion + '-' + boxName + '-' + groupNumber + '-css';
        $('#' + cssId).remove();
        app.coop('update-data', options);
        this.close();
      }
    },
    onReady: function() {
      this.$el.find('[tabid="html"]').addClass('active');
      var tabids = ['less', 'html'],
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
