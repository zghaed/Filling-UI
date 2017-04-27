;(function(app){
	app.view('Builder', {
		template: [
			'<div class="area" region="top-left-box"></div>',
			'<div class="area" region="top-right-box"></div>',
			'<div class="area" region="middle-box"></div>',
			'<div class="area" region="bottom-right-box"></div>',
		],
		data: app.store.get('boxes') || 
			app.store.set('boxes',
			{"boxes":
				[
					{"boxName":"top-left-box", "groupNumber":"0"},
		 			{"boxName":"top-right-box", "groupNumber":"0"},
		  		{"boxName":"middle-box", "groupNumber":"0"},
		 			{"boxName":"bottom-right-box", "groupNumber":"0"}
				]
			}
		),
		// onCertainEvents: function(payload){
		// 	//
		// 	//on boxes.json changed
		// 	this.refresh();
		//
		// 	//0000
		// 	this.set(newBoxes);
		// },
		onReady: function(){
			this.$el.css({
				'padding': '1em',
			  'display': 'flex',
			  'flex-flow': 'row wrap',
			  'justify-content': 'space-between',
			});
			this.show('middle-box', Box, {
				data: {
					boxes: _.filter(this.get('boxes'), function(box){ return box.boxName === 'middle-box'; })
				}
			});
			this.show('top-left-box', Box, {
				data: {
					boxes: _.filter(this.get('boxes'), function(box){ return box.boxName === 'top-left-box'; })
				}
			});
			this.show('top-right-box', Box, {
				data: {
					boxes: _.filter(this.get('boxes'), function(box){ return box.boxName === 'top-right-box'; })
				}
			});
			this.show('bottom-right-box', Box, {
				data: {
					boxes: _.filter(this.get('boxes'), function(box){ return box.boxName === 'bottom-right-box'; })
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
						{label: 'H', value: 'h'},
						{label: 'V', value: 'v'}
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
			if (this.get('containerTemplate')) {
				var theTemplateScript = this.get('containerTemplate'),
					inputData = this.get('containerData'),
			  	jsonData = (inputData === "") ? "" : JSON.parse(inputData),
			  	preCompiledTemplateScript;
				if (Array.isArray(jsonData)) {
					preCompiledTemplateScript = '{{#each .}}' + theTemplateScript + '{{/each}}';
				} else {
					preCompiledTemplateScript = theTemplateScript;
				}
				var theTemplate = Handlebars.compile(preCompiledTemplateScript),
					theCompiledHTML = theTemplate(jsonData),
					d = {id: theCompiledHTML};
				this.show('content', Content, {
					data: d
				});
			}
			this.$el.css({
				'order': this.get('groupNumber'),
			});
			this.show('add', AddButton);
		}
	});

	var Content = app.view({
		template: [
			'<div action-click="edit-element">{{{id}}}</div>'
		],
		actions: {
			'edit-element': function($btn){
				 app.notify('Action triggered!', 'You are editing an element!', 'danger');
				 (new PopOver({
					 data: {t: 'ttt'}
				 })).popover($btn, {placement: 'top', bond: this});
			}
		},
		onReady: function() {

		}
	});

	var AddButton = app.view({
		template: [
			'<div class="add-button" action-click="add-element" data-placement="bottom">Add</div>'
		],
		actions: {
			'add-element': function($btn){
				 app.notify('Action triggered!', 'Click action!', 'success');
				 (new PopOver()).popover($btn, {placement: 'top', bond: this, style: {width: '600px'}});
			}
		}
	});

	var PopOver = app.view({
		template: [
			'<div class="col-md-12">',
				'<div class="row">',
					'<div class="form form-horizontal">',
						'<div editor="t"></div>',
						'<div editor="data"></div>',
					'</div>',
				'</div>',
			'</div>',
			'<div class="row">',
				'<span class="btn btn-primary" action-click="submit">Submit</span> ',
				'<span class="btn btn-info btn-outline" action-click="cancel">Cancel</span> ',
			'</div>'
		],
		editors: {
			t: {
				label: 'HTML',
				type: 'textarea',
				value: 'HTML',
				validate: {
					required: true
				}
			},
			data: {
				label: 'Data',
				type: 'textarea',
				value: 'Data',
				validate: {
					//TODO: Data should be in a JSON format
				}
			}
		},
		actions: {
			submit: function() {
				if (this.getEditor('html').validate())
					app.notify('Error', this.getEditor('html').validate(), 'danger');
				var inputHtml = this.getEditor('html').getVal(),
					inputData = this.getEditor('data').getVal(),
					jsonData = (inputData === "") ? "" : JSON.parse(inputData),
			  	preCompiledTemplateScript;
				if (Array.isArray(jsonData)) {
					preCompiledTemplateScript = '{{#each .}}' + inputHtml + '{{/each}}';
				} else {
					preCompiledTemplateScript = inputHtml;
				}
				var theTemplate = Handlebars.compile(preCompiledTemplateScript),
					theCompiledHTML = theTemplate(jsonData);
				//console.log(theCompiledHTML);


				//get all objects
				// Application.remote({
				// 	url: 'boxes.json',
				// 	params: {
				// 		'groupNumber': 3,
				// 		'boxName': 'top-left-box'
				// 	}
				// }).done(function(json) {
				// 	console.log(json);
				// });


				//POST
				// var res  = Application.remote({
				// 	url: 'boxes.json',
				// 	payload: {
				// 		'_id': '45',
				// 		'boxName': 'middle-box',
				// 		"containerTemplate": "<h2>SUB HEADER</h2>",
				// 		"containerData": "",
				// 		"isHorizontal": 'false',
				// 		"groupNumber": '-2'
				// 	}
				// });
				// console.log(res);
			},
			cancel: function() {
				console.log('cancel clicked');
				//this.popover('hide');
				this.close();
			}
		},
		onReady: function() {
			// this.$el.css({
			// 	'width': '600px',
			// });
		}
	});

})(Application);
