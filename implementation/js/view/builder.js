;(function(app) {
  app.view('Builder', {
    template: [
      '<div class="triangle-bottom-left-box hide" ui="toggle-preview" action-click="toggle-preview"></div>',
      '<div region="group"></div>',
    //  '<div region="string"></div>',
    ],
    coop: ['update-data'],
    onUpdateData: function(options) {
      var ViewAndRegion = options.name,
        nameArray = ViewAndRegion.split('-');
      nameArray.shift();
      var region = nameArray.join('-');
      if(region === this.$el.parent().attr('region')) {
        //TODO: empty array remove existing view
        this.set({
          name:      options.name,
          direction: options.direction,
          groups:     options.newGroups
        });
      }
    },
    actions: {
      'change-direction': function() {
        var groups = this.getRegion('group').$el,
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
          allGroups = app.store.get(viewAndRegion),
          direction = 'direction';
        allGroups.direction = currenctDirection;
        app.store.set(viewAndRegion, allGroups);
      },
      'toggle-preview': function() {
      // app.notify('Action triggered!', 'Direction changed!');
      // TODO: toggle preview
      // if(this._preview === undefined)
      // this._preview = false;
      // var currentBuilder = this.$el.parent().parent();
      // this._preview = !this._preview;
      // currentBuilder.find('[action-click="edit-element"]').toggleClass('toggle-pointer', this._preview);
      // currentBuilder.find('.direction').toggleClass('toggle-preview', this._preview);
      }
    },
    onReady: function() {
      var self = this,
        allGroups = app.store.get(this.get('name')),
        viewAndRegion = this.get('name'),
        currentDirection = allGroups.direction;
        groupNumber = 0;
      _.each(allGroups.groups, function(group) {
        var id = viewAndRegion + '-' + groupNumber + '-id';
        group.name = self.get('name');
        group.groupNumber = groupNumber;
        var groupsDiv = self.getRegion('group').$el;
        groupsDiv.append('<div id="'+id+'"></div>');
        var newGroup =  new Group({ data: group });
        self.spray($('#' + id), newGroup);
        if (currentDirection === 'v') {
          newGroup.$el.find('.drag-left').addClass('hide');
          newGroup.$el.find('.drag-right').addClass('hide');
          groupsDiv.css({
            'flex-direction': 'column',
          });
        } else if (currentDirection === 'h') {
          newGroup.$el.find('.drag-top').addClass('hide');
          newGroup.$el.find('.drag-bottom').addClass('hide');
          groupsDiv.css({
            'flex-direction': 'row',
          });
        }
        groupNumber = groupNumber + 1;
      });
    },
    onClose: function() {
      $('[id^='+this.get('name')+']').remove();
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
      var viewAndRegion = this.get('name'),
        allGroups = app.store.get(viewAndRegion),
        addGroup = allGroups.groups,
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
      var viewAndRegion = this.get('name'),
        allGroups = app.store.get(viewAndRegion),
        addGroup = allGroups.groups,
        last = addGroup.length - 1,
        groupNumber = arrayId.pop(),
        groups = this.$el.parent().parent();
      if (event.hasClass('drag-top')) {
        if (parseInt(groupNumber) === 0) {
          if (last === parseInt(groupNumber)) {
            allGroups.direction = 'v';
            groups.css({
              'flex-direction': 'column',
            });
            app.store.set(viewAndRegion, allGroups);
          }
          this.$el.find('.drag-left').hide();
          this.$el.find('.drag-right').hide();
          $('<div id="new"></div>').insertBefore('#' + id);
        }
      } else if (event.hasClass('drag-bottom')) {
        if (parseInt(groupNumber) === last) {
          if (last === 0) {
            allGroups.direction = 'v';
            groups.css({
              'flex-direction': 'column',
            });
            app.store.set(viewAndRegion, allGroups);
          }
          this.$el.find('.drag-left').hide();
          this.$el.find('.drag-right').hide();
          $('<div id="new"></div>').insertAfter('#' + id);
        }
      } else if (event.hasClass('drag-left')) {
        if (parseInt(groupNumber) === 0) {
          if (last === parseInt(groupNumber)) {
            allGroups.direction = 'h';
            groups.css({
              'flex-direction': 'row',
            });
            app.store.set(viewAndRegion, allGroups);
          }
          this.$el.find('.drag-top').hide();
          this.$el.find('.drag-bottom').hide();
          $('<div id="new"></div>').insertBefore('#' + id);
        }
      } else if (event.hasClass('drag-right')) {
        if (parseInt(groupNumber) === last) {
          if (last === 0) {
            allGroups.direction = 'h';
            groups.css({
              'flex-direction': 'row',
            });
            app.store.set(viewAndRegion, allGroups);
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
      var viewAndRegion = this.get('name'),
        allGroups = app.store.get(viewAndRegion),
        addGroup = allGroups.groups,
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
        allGroups.groups = addGroup;
        var options = {
          newGroups: allGroups.groups,
          direction: allGroups.direction,
          name: this.get('name')
        };
        app.store.set(viewAndRegion, allGroups);
        var cssId = viewAndRegion + '-' + groupNumber + '-css';
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
      var viewAndRegion = this.get('obj').name,
        uniqueId = viewAndRegion + '-' + this.get('obj').groupNumber ;
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
            viewAndRegion = obj.name,
            groupNumber = obj.groupNumber,
            direction = 'direction';
          if (this.get('type') === 'edit') {
            //Editing an element
            var allGroups = app.store.get(viewAndRegion),
              editRegionGroups = allGroups.groups,
              editedObj = {
                template:      this.getViewIn('tabs').$el.find('[region="tab-html"] [editor="code"] textarea').val(),
                data:          this.getEditor('data').getVal(),
                less:          this.getViewIn('tabs').$el.find('[region="tab-less"] [editor="code"] textarea').val(),
                css_container: obj.css_container
              };
            editRegionGroups[groupNumber] = editedObj;
            allGroups.groups = editRegionGroups;
            var options = {
              newGroups: allGroups.groups,
              direction: allGroups.direction,
              name: obj.name
            };
            app.store.set(viewAndRegion, allGroups);
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
              addRegionGroups = cacheData.groups;
            addRegionGroups.splice(groupNumber + 1, 0 , newObj);
            cacheData.groups = addRegionGroups;
            var addOptions = {
              newGroups: cacheData.groups,
              dirction: cacheData.direction,
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
          viewAndRegion = obj.name,
          region = viewAndRegion.split('-').pop(),
          groupNumber = obj.groupNumber,
          template = obj.template,
          data = obj.data,
          css_container = obj.css_container,
          less = obj.less,
          direction = 'direction',
          cacheData = app.store.get(viewAndRegion),
          deleteRegionGroups = cacheData.groups;

        deleteRegionGroups.splice(groupNumber, 1);
        cacheData.groups = deleteRegionGroups;
        var options = {
          newGroups: cacheData.groups,
          direction: cacheData.direction,
          name: name
        };
        if (cacheData.groups.length > 0) {
          app.store.set(viewAndRegion, cacheData);
        } else {
          app.store.set(viewAndRegion);
        }
        var cssId = viewAndRegion + '-' + groupNumber + '-css';
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
