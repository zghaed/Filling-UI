;(function(app){
	app.view('Builder', {
		template: [
			'<div class="area hide" region="top-left-box"></div>',
			'<div class="area hide" region="top-right-box"></div>',
			'<div class="area" region="middle-box"></div>',
			'<div class="area hide" region="bottom-right-box"></div>',
		],
		coop: ['update-data'],
		onUpdateData: function(options){
			this.set(options);
		},
		onReady: function(){
			var boxes = app.store.get(this.get('name')).boxes;
			//console.log('boxes is in the onready in the buillder, ', boxes);
			this.$el.css({
				'padding': '1em',
			  'display': 'flex',
			  'flex-flow': 'row wrap',
			  'justify-content': 'flex-end',
				'align-content': 'flex-start'
			});
			this.show('middle-box', Box, {
				data: {
					name: this.get('name'),
					boxes: _.filter(boxes, function(box){
						return box.boxName === 'middle-box';
					})
				}
			});
			this.show('top-left-box', Box, {
				data: {
					name: this.get('name'),
					boxes: _.filter(boxes, function(box){
						return box.boxName === 'top-left-box';
					})
				}
			});
			this.show('top-right-box', Box, {
				data: {
					name: this.get('name'),
					boxes: _.filter(boxes, function(box){
						return box.boxName === 'top-right-box';
					})
				}
			});
			this.show('bottom-right-box', Box, {
				data: {
					name: this.get('name'),
					boxes: _.filter(boxes, function(box){
						return box.boxName === 'bottom-right-box';
					})
				}
			});
		}
	});

	var Box = app.view({
		name: 'box',
		template: [
			'<div class="triangle-top-left-box hide" action-click="toggle-top-left"></div>',
			'<div class="triangle-top-right-box hide" action-click="toggle-top-right"></div>',
			'<div class="direction hide" editor="direction" action="change-direction"></div>',
			'<div class="triangle-bottom-right-box hide" action-click="toggle-bottom-right"></div>',
			'<div class="triangle-bottom-left-box hide" action-click="toggle-preview"></div>',
			'<div region="group"></div>',
		],
		editors: {
			direction: {
				type: 'radios',
				className: 'radio-success',
				value: ['h'],
				// function() {
				// 	return ['h'];
				// },
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
				//TODO: UPDATE the cache horizontal and vertical
				var groups = this.getRegion('group').$el.children(':first');
				if (this.getEditor('direction').getVal()==='v') {
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
				var currentBuilder = this.$el.parent().parent();
				currentBuilder.find('.add-button').toggleClass('toggle-preview');
		    currentBuilder.find('.direction').toggleClass('toggle-preview');
				currentBuilder.find('.triangle-top-left-box').toggleClass('toggle-preview');
				currentBuilder.find('.triangle-top-right-box').toggleClass('toggle-preview');
				currentBuilder.find('.triangle-bottom-right-box').toggleClass('toggle-preview');
		    currentBuilder.find('.area').toggleClass('toggle-borders');
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
			}
		}
	});

	var Group = app.view('Group', {
		template: [
			'<div region="content"></div>',
			'<div region="add"></div>',
		],
		useParentData: 'name',//'[boxes, name]',
		onReady: function() {
			//console.log('here in the group use parent data , ', this.get());
			if (this.get('template') !== "") {
				var theTemplateScript = this.get('template'),
					inputData = this.get('data'),
			  	jsonData = (inputData === "") ? "" : JSON.parse(inputData),
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
			'<div action-click="edit-element">{{{element}}}</div>'
		],
		actions: {
			'edit-element': function($btn){
				var obj = this.get('obj');
				(new PopOver({
					data: {
						type: 'edit',
						html: obj.template,
					  data: obj.data,
						obj: obj
					}
				 })).popover($btn, {placement: 'top', bond: this, style: {width: '600px'}});
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
						'<div editor="html"></div>',
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
		editors: {
			html: {
				label: 'HTML',
				type: 'textarea',
				placeholder: 'HTML',
				validate: {
					required: true
				}
			},
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
				 	return false;
				}
			}
		},
		actions: {
			submit: function() {
				if (!this.getEditor('html').validate() && this.getEditor('data').validate()) {
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
							template:    this.getEditor('html').getVal(),
							data:        this.getEditor('data').getVal(),
							direction:   this.get('obj').direction,
							boxName:     boxName,
							groupNumber: groupNumber
						};
						rest.push(editedObj);
						var newBoxes = {
							boxes: rest
						};
						app.store.set(this.get('obj').name, newBoxes);
						app.coop('update-data', newBoxes);
						this.close();
					} else {
						//Adding an element
						var newObj = {
							template:    this.getEditor('html').getVal(),
							data:        this.getEditor('data').getVal(),
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
						app.store.set(this.get('obj').name, newData);
						app.coop('update-data', newData);
						this.close();
					}
				} else {
					//HTML field is empty
					this.getEditor('html').validate(true);
					this.getEditor('data').validate(true);
				}
			},
			cancel: function() {
				this.close();
			},
			delete: function() {
				var boxName = this.get('obj').boxName,
					groupNumber = this.get('obj').groupNumber,
					direction = this.get('obj').direction,
					template = this.get('obj').template,
					data = this.get('obj').data;
				var arrayBoxes = app.store.get(this.get('obj').name).boxes;
				var deletedBoxes = _.filter(arrayBoxes, function(box) {
					if (!(box.groupNumber === groupNumber &&
								box.boxName === boxName &&
								box.direction === direction &&
								box.template === template &&
								box.data === data)) {
						return box;
					}
				});
				var newData = {
					boxes: deletedBoxes
				};
				app.store.set(this.get('obj').name, newData);
				app.coop('update-data', newData);
				this.close();
			}
		},
		onReady: function() {
			if (!this.getEditor('html').getVal()) {
				this.$el.children().eq(1).children().eq(2).addClass('hide');
			}
		}
	});
})(Application);
