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
			this.show('middle-box', new Box());//, options);
		}
	});

	var Box = app.view({
		name: 'box',
		template: [
			'<div class="wrapper-full">',
				'<div style="color:#626262;">Boxes</div>',
				'<div region="group"></div>',
			'</div>',
		],
		useParentData: 'boxes',
		onReady: function() {
			console.log(this.get('boxes'));
			this.more('group', this.get('boxes'), Group, true);
		}
	});

	var Group = app.view('Group', {
		template: [
			'<div region="info"></div>',
			'<div region="add"></div>',
		],
		useParentData: 'boxes',
		onReady: function() {
			this.show('info', Info, {
				data: this.get()
			});
			this.show('add', AddButton);
		},
		actions: {
			'add-element': function(){
				 app.notify('Action triggered!', 'Click action!', 'success');
			}
		}
	});

	var Info = app.view({
			template: '<div>{{id}}</div><div>{{name}}</div>',
	});

	var AddButton = app.view({
		template: '<div class="add-element" action-click="add-element" data-placement="bottom">Add</div>'
	});

})(Application);
