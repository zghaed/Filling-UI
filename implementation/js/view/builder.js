;(function(app){
	app.view('Builder', {
		template: [
			'<div class="area" region="top-left-box"></div>',
			'<div class="area" region="top-right-box"></div>',
			'<div class="area" region="middle-box"></div>',
			'<div class="area" region="bottom-right-box"></div>',
		],
		data: 'boxes.json',
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
				tooltip: {
					title: 'Where is the tooltip?'
				},
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
				 (new PopOver()).popover($btn, {placement: 'top', bond: this});
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
				'<span class="btn btn-primary" action-click="submit">Submit</span> ',
				'<span class="btn btn-info btn-outline" action-click="cancel">Cancel</span> ',
			'</div>'
		],
		editors: {
			html: {
				label: 'HTML',
				type: 'textarea',
				validate: {
						required: true
				}
			},
			data: {
				label: 'Data',
				type: 'textarea',
				validate: {
						required: true
				}
			}
		},
		actions: {
			submit: function() {
				console.log('submit');
				// this.getViewIn('fieldset-a').validate(true);
				// this.getViewIn('fieldset-b').validate(true);
				// this.validate(true);
				// app.debug(_.extend(this.get(), {
				// 		'fieldset-a': this.getViewIn('fieldset-a').get(),
				// 		'fieldset-b': this.getViewIn('fieldset-b').get()
				// }));
			},
			cancel: function() {
				console.log('cancel clicked');
			}
		}
	});

})(Application);
