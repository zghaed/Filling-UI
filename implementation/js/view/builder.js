;(function(app) {
  app.view('Builder', {
    template: [
      '<div region="hanger-groups"></div>',
      '<div action="update-group" region="group"></div>',
    ],
    coop: ['update-data'],
    onUpdateData: function(options) {
      var cacheName = options.name,
        nameArray = cacheName.split('-');
      nameArray.shift();
      var region = nameArray.join('-');
      if(region === this.$el.parent().attr('region')) {
        this.set({
          name:      options.name,
          direction: options.direction,
          groups:    options.newGroups,
          hangerGroups:   options.newHangerGroups
        });
      }
    },
    actions: {
      'update-group': function($btn, e) {
        var cacheName = this.options.cacheName,
          allGroups = app.store.get(cacheName);
        if (e.shiftKey) {
          var hangerNumber = allGroups.hangerGroups.length,
            hangerGroupId = cacheName + '-' + hangerNumber + '-hanger-id';
          var hangerGroup = {
            template: '',
            data: '',
            less: '',
            css_container: {
              position: 'absolute',
              //-40 ~ 3em for the initial height
              top: e.pageY - this.$el.offset().top - 40,
              left: parseInt((e.pageX - this.$el.offset().left) / this.$el.width() * 100) + '%',
              width: '6em',
              height: '3em',
              'background-color': 'lightgrey',
              'border-bottom': '2px dotted black'
            }
          };
          hangerGroup.name = cacheName;
          hangerGroup.hangerNumber = hangerNumber;
          var hangerGroupsDiv = this.getRegion('hanger-groups').$el;
          hangerGroupsDiv.append('<div id="' + hangerGroupId + '"></div>');
          var newHangerGroup =  new HangerGroup({
            dataSource: this,
            data: hangerGroup
          });
          this.spray(('#' + hangerGroupId), newHangerGroup);
          allGroups.hangerGroups.push(hangerGroup);
          app.store.set(cacheName, allGroups);
        } else {
          var region = $(e.currentTarget),
            groupNumber = region.parent().css('order'),
            currentGroup = allGroups.groups[groupNumber];
          currentGroup.name = cacheName;
          currentGroup.groupNumber = groupNumber;
          (new PopOver({
            dataSource: region.parent().data('view'),
            data: {
              type: 'group',
              html: currentGroup.template,
              data: currentGroup.data,
              css_container:  currentGroup.css_container,
              less: currentGroup.less,
              obj:  currentGroup
            }
          })).popover(region, {placement: 'top', bond: region, style: {width: '600px'}});
        }
      }
    },
    onReady: function() {
      var self = this,
        cacheName = this.options.cacheName,
        allGroups = app.store.get(cacheName),
        currentDirection = allGroups.direction,
        groupNumber = 0,
        hangerNumber = 0;
      _.each(allGroups.groups, function(group) {
        group.name = cacheName;
        var id = cacheName + '-' + groupNumber + '-id';
        group.groupNumber = groupNumber;
        var groupsDiv = self.getRegion('group').$el;
        groupsDiv.append('<div id="' + id + '"></div>');
        var newGroup =  new Group({
          dataSource: self,
          data: group
        });
        self.spray(('#' + id), newGroup);
        if (currentDirection === 'v') {
          if (allGroups.groups.length > 1) {
            newGroup.$el.find('.drag-left').addClass('hide');
            newGroup.$el.find('.drag-right').addClass('hide');
            groupsDiv.css({
              'flex-direction': 'column',
            });
          }
        } else if (currentDirection === 'h') {
          if (allGroups.groups.length > 1) {
            newGroup.$el.find('.drag-top').addClass('hide');
            newGroup.$el.find('.drag-bottom').addClass('hide');
            groupsDiv.css({
              'flex-direction': 'row',
            });
          }
        }
        groupNumber = groupNumber + 1;
      });
      _.each(allGroups.hangerGroups, function(hangerGroup) {
        var hangerGroupId = cacheName + '-' + hangerNumber + '-hanger-id';
        hangerGroup.name = cacheName;
        hangerGroup.hangerNumber = hangerNumber;
        var hangerGroupsDiv = self.getRegion('hanger-groups').$el;
        hangerGroupsDiv.append('<div id="' + hangerGroupId + '"></div>');
        var newHangerGroup =  new HangerGroup({
          dataSource: self,
          data: hangerGroup
        });
        self.spray(('#' + hangerGroupId), newHangerGroup);
        hangerNumber = hangerNumber + 1;
      });
    },
    onClose: function() {
      $('[id^=' + this.options.name + ']').remove();
    },
    extractTemplate: function() {
      var builderName = this.options.cacheName,
        groups = app.store.get(builderName),
        stacks = groups.groups,
        hangerGroups = groups.hangerGroups,
        hangerNumber = 0,
        stackNumber = 0,
        allTemplate = $('<div></div>'),
        direction = '';
      if (groups.direction == 'h') {
        direction = 'flex-direction: row;';
      } else if (groups.direction == 'v') {
        direction = 'flex-direction: column;';
      }
      allTemplate.append('<div region="hanger-groups"></div>');
      allTemplate.append('<div region="group" style="' + direction + '"></div>');
      _.each(stacks, function(stack) {
        if (stack.template) {
          var stackId = builderName + '-' + stackNumber + '-id',
            style = $('#' + stackId).attr('style'),
            stackDiv = '<div id ="' + stackId + '" style="' + style + '">' + stack.template + '</div>';
          if (stack.data) {
            stackDiv = '{{#' + stack.data + '}}' + $(stackDiv).get(0).outerHTML + '{{/' + stack.data + '}}';
          }
          allTemplate.find('[region="group"]').append(stackDiv);
        }
        stackNumber += 1;
      });
      _.each(hangerGroups, function(hangerGroup) {
        if (hangerGroup.template) {
          var hangerGroupId = builderName + '-' + hangerNumber + '-hanger-id',
            style = $('#' + hangerGroupId).attr('style'),
            hangerGroupDiv = '<div id ="' + hangerGroupId + '" style="' + style + '">' + hangerGroup.template + '</div>';
          if (hangerGroup.data) {
            hangerGroupDiv = '{{#' + hangerGroup.data + '}}' + $(hangerGroupDiv).get(0).outerHTML + '{{/' + hangerGroup.data + '}}';
          }
          allTemplate.find('[region="hanger-groups"]').append(hangerGroupDiv);
        }
        hangerNumber += 1;
      });
      return allTemplate.html();
    },
    extractLess: function() {
      var builderName = this.options.cacheName,
        groups = app.store.get(builderName),
        stacks = groups.groups,
        hangerGroups = groups.hangerGroups,
        hangerNumber = 0,
        stackNumber = 0,
        allLess = '';
      _.each(stacks, function(stack) {
        if (stack.less) {
          var cssId = builderName + '-' + stackNumber + '-css',
            currentLess = '#' + cssId + '{' + stack.less + '}';
          allLess += currentLess;
        }
        stackNumber += 1;
      });
      _.each(hangerGroups, function(hangerGroup) {
        if (hangerGroup.less) {
          var cssId = builderName + '-' + hangerNumber + '-hanger-css',
            currentLess = '#' + cssId + '{' + hangerGroup.less + '}';
          allLess += currentLess;
        }
        hangerNumber += 1;
      });
      return allLess;
    }
  });

  var HangerGroup = app.view('HangerGroup', {
    template: [
      '<div class="ui-draggable-item drag-hanger-left"></div>',
      '<div action-click="update-hanger" region="hanger-container"></div>',
      '<div class="ui-draggable-item drag-hanger-right"></div>',
    ],
    dnd: {
      drag: {
        helper: 'original'
      }
    },
    actions: {
      'update-hanger': function($btn, e) {
        (new PopOver({
          dataSource: this,
          data: {
            type: 'hanger',
            html: this.get('template'),
            data: this.get('data'),
            css_container: this.get('css_container'),
            less: this.get('less'),
            obj:  this.get()
          }
        })).popover($btn, {placement: 'top', bond: this, style: {width: '600px'}});
      }
    },
    flagX: false,
    flagY: false,
    onDragStart: function(event, ui) {
      this.initialX = parseInt(this.$el.parent().css('left'));
      this.initialY = parseInt(this.$el.parent().css('top'));
    },
    onDrag: function(event, ui) {
      this.changeX = arguments[1].position.left - arguments[1].originalPosition.left;
      this.changeY = arguments[1].position.top - arguments[1].originalPosition.top;
      this.$el.parent().css('top', this.initialY + this.changeY + 'px');
      this.$el.parent().css('left', this.initialX + this.changeX + 'px');
    },
    onDragStop: function(event, ui) {
      var viewAndRegion = this.get('name'),
        allGroups = app.store.get(viewAndRegion),
        newHangerGroup = this.get();
      newHangerGroup.css_container.top = this.$el.parent().css('top');
      newHangerGroup.css_container.left = this.$el.parent().css('left');
      allGroups.hangerGroups[this.get('hangerNumber')].css_container.top = this.$el.parent().css('top');
      allGroups.hangerGroups[this.get('hangerNumber')].css_container.left = this.$el.parent().css('left');
      this.set(newHangerGroup);
      app.store.set(viewAndRegion, allGroups);
    },
    onReady: function() {
      var viewAndRegion = this.get('name'),
        uniqueId = viewAndRegion + '-' + this.get('hangerNumber') + '-hanger',
        appliedContent = applyGroupContent(this.get('template'), this.options.dataSource.options.dataSource.get(this.get('data')));
      this.$el.find('[region="hanger-container"]').html(appliedContent);
      compileLess(uniqueId, this, 'hanger-container');
      if (this.get('css_container')) {
        $('#' + uniqueId + '-id').css(this.get('css_container'));
        if (this.get('template')) {
          this.$el.parent().css({'height': '', 'width': '', 'background-color': ''});
          var allGroups = app.store.get(viewAndRegion);
          delete allGroups.hangerGroups[this.get('hangerNumber')].css_container.height;
          delete allGroups.hangerGroups[this.get('hangerNumber')].css_container.width;
          delete allGroups.hangerGroups[this.get('hangerNumber')].css_container['background-color'];
          app.store.set(viewAndRegion, allGroups);
        }
      }
    }
  });

  applyGroupContent = function(template, data) {
    var theCompiledTemplate = Handlebars.compile(template),
      appliedContent = theCompiledTemplate(data);
    return appliedContent;
  };

  compileLess = function(id, reference, lockRegion) {
    var cssId = id + '-css';
    var flag = true;
    if (reference.get('less')) {
      var theme = $('head link[rel="stylesheet"]').attr('href').split('/')[1],
        lessContent = '#' + id + '-id {' + reference.get('less') + '}';
      reference.lock(lockRegion, flag, 'fa fa-spinner fa-spin fa-3x');
      flag = !flag;
      app.remote({
        url: 'api/test',
        payload: {
          less: lessContent,
          theme: theme
        }
      }).done(function(data) {
        reference.lock(lockRegion, flag, 'fa fa-spinner fa-spin fa-3x');
        $('#' +  cssId).remove();
        $('head').append('<style id="' + cssId + '">' + data.msg + '</style>');
        flag = true;
      });
    } else {
      $('#' +  cssId).remove();
    }
  };

  var Group = app.view('Group', {
    template: [
      '<div region="view-lock" action="update-group"></div>',
      '<div class="ui-draggable-item drag-top"></div>',
      '<div class="ui-draggable-item drag-left"></div>',
      '<div class="ui-draggable-item drag-right"></div>',
      '<div class="ui-draggable-item drag-bottom"></div>',
    ],
    dnd: {
      drag: {
        helper: 'original'
      }
    },
    actions: {
      _bubble: true,
    },
    heightFlag: true,
    widthFlag: true,
    onDragStart: function(event, ui) {
      var id = this.$el.parent().attr('id'),
        arrayId = id.split('-'),
        newId;
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
          newId = viewAndRegion + '-' + (parseInt(groupNumber)+1) + '-id';
          this.$el.find('.drag-left').hide();
          this.$el.find('.drag-right').hide();
          $('<div id="' + newId + '"></div>').insertAfter('#' + id);
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
          newId = viewAndRegion + '-' + (parseInt(groupNumber)+1) + '-id';
          this.$el.find('.drag-top').hide();
          this.$el.find('.drag-bottom').hide();
          $('<div id="' + newId + '"></div>').insertAfter('#' + id);
        }
      }
    },
    onDrag: function(event, ui) {
      var id = this.$el.parent().attr('id'),
        arrayId = id.split('-'),
        newId;
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
        this.change = arguments[1].originalPosition.top  - arguments[1].position.top;
        var newBottomHeight = parseInt(this.change / this.initialHeight * this.initialBasis);
        var bottomHeight = this.initialBasis - newBottomHeight;
        this.$el.parent().css('flex', '0 1 '+ bottomHeight +'%');
        if (parseInt(groupNumber) === last) {
          newId = viewAndRegion + '-' + (parseInt(groupNumber) + 1) + '-id';
          if (this.heightFlag) {
            this.heightFlag = false;
          }
          $('#' + newId).css('flex', '0 1 '+ newBottomHeight +'%');
        } else {
          var currentIdBottom = this.$el.parent().attr('id');
          var nextBottom = $('#' + currentIdBottom).next();
          if (this.heightFlag) {
            this.nextBasis = parseInt(nextBottom.css('flex-basis'));
            this.heightFlag = false;
          }
          var newNextHeightBottom = newBottomHeight + this.nextBasis;
          nextBottom.css('flex', '0 1 ' + newNextHeightBottom +'%');
        }
      } else if (event.hasClass('drag-top')) {
        if (this.heightFlag) {
          this.initialHeight = this.$el.height();
          this.initialBasis = parseInt(this.$el.parent().css('flex-basis'));
        }
        this.change = arguments[1].position.top - arguments[1].originalPosition.top;
        var newTopHeight = parseInt(this.change / this.initialHeight * this.initialBasis);
        var newHeight = this.initialBasis - newTopHeight;
        this.$el.parent().css('flex', '0 1 ' + newHeight +'%');
        if (parseInt(groupNumber) === 0) {
          if (this.heightFlag) {
            this.heightFlag = false;
          }
          $('#new').css('flex', '0 1 ' + newTopHeight +'%');
          this.$el.parent().css('flex', '0 1 ' + newHeight +'%');
        } else {
          var currentId = this.$el.parent().attr('id');
          var prev = $('#' + currentId).prev();
          if (this.heightFlag) {
            this.prevBasis = parseInt(prev.css('flex-basis'));
            this.heightFlag = false;
          }
          var prevHeight = newTopHeight + this.prevBasis;
          prev.css('flex', '0 1 ' + prevHeight + '%');
        }
      } else if (event.hasClass('drag-left')) {
        if (this.widthFlag) {
          this.initialWidth = this.$el.width();
          this.initialBasis = parseInt(this.$el.parent().css('flex-basis'));
        }
        this.change = arguments[1].position.left - arguments[1].originalPosition.left;
        var newLeftWidth = parseInt(this.change / this.initialWidth * this.initialBasis);
        var newWidth = this.initialBasis - newLeftWidth;
        this.$el.parent().css('flex', '0 1 ' + newWidth + '%');
        if (parseInt(groupNumber) === 0) {
          if (this.widthFlag) {
           this.widthFlag = false;
          }
          $('#new').css('flex', '0 1 ' + newLeftWidth + '%');
        } else {
          var currentLeftId = this.$el.parent().attr('id');
          var prevLeft = $('#' + currentLeftId).prev();
          if (this.widthFlag) {
           this.prevBasis = parseInt(prevLeft.css('flex-basis'));
           this.widthFlag = false;
          }
          var prevWidth = newLeftWidth + this.prevBasis;
          prevLeft.css('flex', '0 1 ' + prevWidth + '%');
        }
      } else if (event.hasClass('drag-right')) {
        if (this.widthFlag) {
          this.initialWidth = this.$el.width();
          this.initialBasis = parseInt(this.$el.parent().css('flex-basis'));
        }
        var newRightWidth = parseInt(this.change / this.initialWidth * this.initialBasis);
        this.change = arguments[1].originalPosition.left  - arguments[1].position.left;
        var rightWidth = this.initialBasis - newRightWidth;
        this.$el.parent().css('flex', '0 1 ' + rightWidth + '%');
        if (parseInt(groupNumber) === last) {
          newId = viewAndRegion + '-' + (parseInt(groupNumber) + 1) + '-id';
          if (this.widthFlag) {
            this.widthFlag = false;
          }
           $('#' + newId).css('flex', '0 1 ' + newRightWidth + '%');
        } else {
          var currentRightId = this.$el.parent().attr('id');
          var nextRight = $('#' + currentRightId).next();
          if (this.widthFlag) {
            this.nextBasis = parseInt(nextRight.css('flex-basis'));
            this.widthFlag = false;
          }
          var newNextWidthRight = newRightWidth + this.nextBasis;
          nextRight.css('flex', '0 1 ' + newNextWidthRight + '%');
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
        position = 'middle',
        newId;
      arrayId.pop();
      var viewAndRegion = this.get('name'),
        allGroups = app.store.get(viewAndRegion),
        addGroup = allGroups.groups,
        last = addGroup.length - 1;
        groupNumber = arrayId.pop();
      var newData = {
        template: '',
        data: '',
        less: '',
        css_container: {
          'flex-grow': '0',
          'flex-shrink': '1',
          'flex-basis': $('#new').css('flex-basis'),
        }
      };
      var editedData = {
        template: addGroup[parseInt(groupNumber)].template,
        data: addGroup[parseInt(groupNumber)].data,
        less: addGroup[parseInt(groupNumber)].less,
        css_container: {
          'flex-grow': '0',
          'flex-shrink': '1',
          'flex-basis': this.$el.parent().css('flex-basis'),
        }
      };
      if (event.hasClass('drag-bottom')) {
        if (parseInt(groupNumber) === last) {
          position = 'end';
        } else {
          position = 'next';
        }
      }
      if (event.hasClass('drag-right')) {
        if (parseInt(groupNumber) === last) {
          position = 'end';
        } else {
          position = 'next';
        }
      }
      if (event.hasClass('drag-top')) {
        if (parseInt(groupNumber) === 0) {
          position = 'start';
          addGroup.shift();
          addGroup.unshift(editedData);
          addGroup.unshift(newData);
        } else {
          position = 'prev';
        }
      }
      if (event.hasClass('drag-left')) {
        if (parseInt(groupNumber) === 0) {
          position = 'start';
          addGroup.shift();
          addGroup.unshift(editedData);
          addGroup.unshift(newData);
        } else {
          position = 'prev';
        }
      }
      if (position === 'prev') {
        //Update the current Stack group
        addGroup[parseInt(groupNumber)].css_container = {
          'flex-grow': '0',
          'flex-shrink': '1',
          'flex-basis': this.$el.parent().css('flex-basis'),
        };
        editedData.groupNumber = this.get('groupNumber');
        editedData.name = this.get('name');
        this.set(editedData);

        //Update the previous Stack group
        addGroup[parseInt(groupNumber) - 1].css_container = {
          'flex-grow': '0',
          'flex-shrink': '1',
          'flex-basis': this.prevBasis + '%',
        };
        var prevId = this.get('name') + '-' + (parseInt(this.get('groupNumber')) - 1) + '-id';
        var prevObj = addGroup[parseInt(groupNumber) - 1];
        prevObj.groupNumber = parseInt(this.get('groupNumber')) - 1;
        prevObj.name = this.get('name');
        this.parentCt.$el.find('#' + prevId + ' .regional-group').data('view').set(prevObj);
      } else if (position === 'next') {
        //Update the current Stack group
        addGroup[parseInt(groupNumber)].css_container = {
          'flex-grow': '0',
          'flex-shrink': '1',
          'flex-basis': this.$el.parent().css('flex-basis'),
        };
        editedData.groupNumber = this.get('groupNumber');
        editedData.name = this.get('name');
        this.set(editedData);

        //Update the next Stack group
        addGroup[parseInt(groupNumber) + 1].css_container = {
          'flex-grow': '0',
          'flex-shrink': '1',
          'flex-basis': this.nextBasis + '%',
        };
        var nextId = this.get('name') + '-' + (parseInt(this.get('groupNumber')) + 1) + '-id';
        var nextObj = addGroup[parseInt(groupNumber) + 1];
        nextObj.groupNumber = parseInt(this.get('groupNumber')) + 1;
        nextObj.name = this.get('name');
        this.parentCt.$el.find('#' + nextId + ' .regional-group').data('view').set(nextObj);
      } else if (position === 'end') {
        newId = this.get('name') + '-' + (parseInt(this.get('groupNumber')) + 1) + '-id';
        //Dragging from end and adding a new stack group to the end
        addGroup = addGroup.slice(0, -1);
        addGroup.push(editedData);
        newData.css_container['flex-basis'] = $('#' + newId).css('flex-basis');
        addGroup.push(newData);
        editedData.groupNumber = this.get('groupNumber');
        editedData.name = this.get('name');
        newData.groupNumber = parseInt(this.get('groupNumber')) + 1;
        newData.name = this.get('name');

        //Update the current Stack group with the updated height
        this.set(editedData);

        //Spray the new Stack group
        var newGroup =  new Group({
          dataSource: this.options.dataSource,
          data: newData
        });
        this.parentCt.spray(('#' + newId), newGroup);
      } else if (position === 'start') {
        //coop for adding to the beginning
        var options = {
          newGroups: addGroup,
          newHangerGroups: allGroups.hangerGroups,
          direction: allGroups.direction,
          name: this.get('name')
        };
        app.coop('update-data', options);
      }
      allGroups.groups = addGroup;

      //Update the cache
      app.store.set(viewAndRegion, allGroups);
    },
    onReady: function() {
      var viewAndRegion = this.get('name'),
        allGroups = app.store.get(viewAndRegion),
        uniqueId = viewAndRegion + '-' + this.get('groupNumber'),
        template = this.get('template'),
        data = this.get('data');

      //Display the content
      var appliedContent = applyGroupContent(template, this.options.dataSource.options.dataSource.get(data));
      this.$el.find('[region="view-lock"]').html(appliedContent);
      this.$el.css({
        'order': this.get('groupNumber'),
      });

      //Locate the flex item
      if (this.get('css_container')) {
        $('#' + uniqueId + '-id').css(this.get('css_container'));
      }

      //Apply less
      compileLess(uniqueId, this, 'view-lock');

      //Remove extra handles
      if (allGroups.direction === 'v') {
        this.$el.find('.drag-left').hide();
        this.$el.find('.drag-right').hide();
      } else if (allGroups.direction === 'h') {
        this.$el.find('.drag-top').hide();
        this.$el.find('.drag-bottom').hide();
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
      '<span class="btn btn-primary" action-click="submit">Apply</span>',
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
        label: 'Data Key',
        type: 'text',
        placeholder: 'Data Key'
      }
    },
    actions: {
      submit: function() {
        if (this.getViewIn('tabs').$el.find('[region="tab-html"] [editor="code"] textarea').val()) {
          //HTML field is not empty
          var obj = this.get('obj'),
            viewAndRegion = obj.name,
            editedObj = {
              template:      this.getViewIn('tabs').$el.find('[region="tab-html"] [editor="code"] textarea').val(),
              data:          this.getEditor('data').getVal(),
              less:          this.getViewIn('tabs').$el.find('[region="tab-less"] [editor="code"] textarea').val(),
              css_container: obj.css_container
            },
            baseId, uniqueId;
          var allGroups = app.store.get(viewAndRegion),
           currentBuilder = this.options.dataSource.options.dataSource;

          if (this.get('type')==='group') {
            var editRegionGroups = allGroups.groups,
              groupNumber = obj.groupNumber;
            baseId = viewAndRegion + '-' + groupNumber;
            uniqueId = baseId + '-id';
            editRegionGroups[groupNumber] = editedObj;
            allGroups.groups = editRegionGroups;

            editedObj.name = viewAndRegion;
            editedObj.groupNumber = groupNumber;

            //Close the popover
            this.close();

            //Reload the Stack group with the new data
            this.options.dataSource.set(editedObj);
          } else if (this.get('type') === 'hanger') {
            var editRegionHangerGroups = allGroups.hangerGroups,
                hangerNumber = obj.hangerNumber;
            baseId = viewAndRegion + '-' + hangerNumber + '-hanger';
            uniqueId = baseId + '-id';
            editRegionHangerGroups[hangerNumber] = editedObj;
            allGroups.hangerGroups = editRegionHangerGroups;

            //Update css_container in the cache
            if (editedObj.css_container) {
              if (editedObj.template) {
                currentBuilder.$el.find('#' + uniqueId).css({'height': '', 'width': '', 'background-color': ''});
                delete allGroups.hangerGroups[hangerNumber].css_container.height;
                delete allGroups.hangerGroups[hangerNumber].css_container.width;
                delete allGroups.hangerGroups[hangerNumber].css_container['background-color'];
              }
            }
            editedObj.name = viewAndRegion;
            editedObj.hangerNumber = hangerNumber;

            //Close the popover
            this.close();

            //Update the Hanger group with the new data
            this.options.dataSource.set(editedObj);
          }
          //Update cache
          app.store.set(viewAndRegion, allGroups);
        } else {
          //TODO: Why this is undefined?
          //console.log('tabs, ', this.getViewIn('tabs').$el.getViewIn('tab-html'));
          //this.getViewIn('tabs').getViewIn('tab-html').getEditor('code').validate(true);
          this.close();
        }
      },
      cancel: function() {
        this.close();
      },
      delete: function() {
        var obj = this.get('obj'),
          viewAndRegion = obj.name,
          groupNumber = obj.groupNumber,
          hangerNumber = obj.hangerNumber,
          cacheData = app.store.get(viewAndRegion),
          deleteGroups = cacheData.groups,
          deleteHangerGroups = cacheData.hangerGroups;
        if (this.get('type')==='group') {
          var groupId = viewAndRegion + '-' + groupNumber + '-id',
            basis = $('#' + groupId).css('flex-basis');
          if (parseInt(groupNumber) === 0) {
            if (cacheData.groups.length > 1) {
              var next = viewAndRegion + '-' + (parseInt(groupNumber) + 1) + '-id',
                nextBasis = parseInt($('#' + next).css('flex-basis')) + parseInt(basis);
              deleteGroups[(parseInt(groupNumber) + 1)].css_container = {
                'flex-grow': '0',
                'flex-shrink': '1',
                'flex-basis': nextBasis + '%',
              };
            }
          } else {
            var prev = viewAndRegion + '-' + (parseInt(groupNumber)-1) + '-id',
              prevBasis = parseInt($('#' + prev).css('flex-basis')) + parseInt(basis);
            deleteGroups[(parseInt(groupNumber) - 1)].css_container = {
              'flex-grow': '0',
              'flex-shrink': '1',
              'flex-basis': prevBasis + '%',
            };
          }
          deleteGroups.splice(groupNumber, 1);
          cacheData.groups = deleteGroups;
          var options = {
            newGroups: cacheData.groups,
            newHangerGroups: cacheData.hangerGroups,
            direction: cacheData.direction,
            name: viewAndRegion
          };
          if (cacheData.groups.length > 0) {
            app.store.set(viewAndRegion, cacheData);
            var cssId = viewAndRegion + '-' + groupNumber + '-css';
            $('#' + cssId).remove();
            this.close();
            app.coop('update-data', options);
          } else {
            this.close();
          }
        } else {
          deleteHangerGroups.splice(hangerNumber, 1);
          cacheData.hangerGroups = deleteHangerGroups;
          var hangerOptions = {
            newGroups: cacheData.groups,
            newHangerGroups: cacheData.hangerGroups,
            direction: cacheData.direction,
            name: viewAndRegion
          };
          app.store.set(viewAndRegion, cacheData);
          var hangerGroupCssId = viewAndRegion + '-' + hangerNumber + '-hanger-css',
            hangerGroupId = viewAndRegion + '-' + hangerNumber + '-hanger-id';

          //Close the popover
          this.close();

          //Remove the Hanger group from the screen
          $('#' + hangerGroupCssId).remove();
          $('#' + hangerGroupId).remove();
        }
      }
    },
    onReady: function() {
      this.$el.find('[tabid="html"]').addClass('active');
      var tabids = ['html', 'less'],
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
    }
  });
})(Application);
