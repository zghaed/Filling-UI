;(function(app){
	app.view('Builder', {
		template: [
			'<div class="area" region="top-left-box"></div>',
			'<div class="area" region="top-right-box"></div>',
			'<div class="area" region="middle-box"></div>',
			'<div class="area" region="bottom-right-box"></div>',
		],
		data:
			app.store.set('boxes', app.store.get('boxes') ||
			{"boxes":
				[
					{"template": "", "data":"", "direction":"h", "boxName":"top-left-box",     "groupNumber":0},
		 			{"template": "", "data":"", "direction":"h", "boxName":"top-right-box",    "groupNumber":0},
					{"template": "", "data":"", "direction":"v", "boxName":"middle-box",       "groupNumber":0},
		 			{"template": "", "data":"", "direction":"h", "boxName":"bottom-right-box", "groupNumber":0}
				]
			}
		),
		coop: ['update-data'],
		onUpdateData: function(data){
			this.show(data.boxName, Box,{
				data: {
					boxes: _.filter(data.boxes, function(box){
						return box.boxName === data.boxName;
					})
				}
			});
		},
		onReady: function(){
			this.$el.css({
				'padding': '1em',
			  'display': 'flex',
			  'flex-flow': 'row wrap',
			  'justify-content': 'space-between',
			});
			this.show('middle-box', Box, {
				data: {
					boxes: _.filter(this.get('boxes'), function(box){
						return box.boxName === 'middle-box';
					})
				}
			});
			this.show('top-left-box', Box, {
				data: {
					boxes: _.filter(this.get('boxes'), function(box){
						return box.boxName === 'top-left-box';
					})
				}
			});
			this.show('top-right-box', Box, {
				data: {
					boxes: _.filter(this.get('boxes'), function(box){
						return box.boxName === 'top-right-box';
					})
				}
			});
			this.show('bottom-right-box', Box, {
				data: {
					boxes: _.filter(this.get('boxes'), function(box){
						return box.boxName === 'bottom-right-box';
					})
				}
			});
		}
	});

	var Box = app.view({
		name: 'box',
		template: [
			'<div editor="direction" action="change-direction"></div>',
			'<div region="group"></div>',
		],
		editors: {
			direction: {
				type: 'radios',
				className: 'radio-success',
				value: ['h'],
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
			'change-direction': function(){
				app.notify('Action triggered!', 'Direction changed!');
				//TODO: UPDATE the database horizontal and vertical?
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
			}
		},
		onReady: function() {
			this.more('group', this.get('boxes'), Group, true);
		}
	});

	var Group = app.view('Group', {
		template: [
			'<div region="content"></div>',
			'<div region="add"></div>',
		],
		useParentData: 'boxes',
		onReady: function() {
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
			'<div class="add-button" action-click="add-element" data-placement="bottom">Add</div>'
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
				validate: {
					//TODO: Data should be in a JSON format
				}
			}
		},
		actions: {
			submit: function() {
				if (!this.getEditor('html').validate()) {
					//HTML field is not empty
					var boxName = this.get('obj').boxName,
						groupNumber = this.get('obj').groupNumber;
					if (this.get('type') === 'edit') {
						//Editing an element
						var boxes = app.store.get('boxes').boxes,
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
							boxes: rest,
							boxName: boxName
						};
						app.store.set('boxes', newBoxes);
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
						var arrayBoxes = app.store.get('boxes').boxes;
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
							boxes: editedBoxes,
							boxName: boxName
						};
						app.store.set('boxes', newData);
						app.coop('update-data', newData);
						this.close();
					}
				} else {
					//HTML field is empty
					this.getEditor('html').validate(true);
				}
			},
			cancel: function() {
				this.close();
			}
		}
	});
})(Application);
