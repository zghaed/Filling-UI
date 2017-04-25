;(function(app){
	app.view('Builder', {
		template: [
			'<div class="area" region="top_left_box"><button type="button" class="btn btn-success">Test</button></div>',
			'<div class="area" region="top_right_box">2</div>',
			'<div class="area" region="middle_box"><h1>HEADER</h1></div>',
			'<div class="area" region="bottom_right_box">4</div>',
		],

		onReady: function(){
			this.$el.css({
				'padding': '1em',
			  'display': 'flex',
			  'flex-flow': 'row wrap',
			  'justify-content': 'space-between',
			});
			this.$el.find('.area').css({
				'padding': '1em',
				'flex': '0 1 100%',
				'display': 'flex',
				'border-width': '2px',
			  'border-color': 'lightgrey',
			  'border-style': 'dashed'
			});
			this.$el.find('[region="top_left_box"]').css({
				'flex': '0 1 auto',
			  'flex-flow': 'row nowrap',
			  'order': '1',
			  'justify-content': 'flex-start',
			  'align-items': 'flex-start',
			  'align-content': 'flex-start',
			  'border-bottom-style': 'none'
			});
			this.$el.find('[region="top_right_box"]').css({
				'flex': '0 1 auto',
			  'flex-flow': 'row-reverse nowrap',
			  'order': '2',
			  'justify-content': 'flex-start',
			  'align-items': 'flex-start',
			  'align-content': 'flex-start',
			  'border-bottom-style': 'none'
			});
			this.$el.find('[region="middle_box"]').css({
			  'flex-flow': 'column nowrap',
			  'order': '3',
			  'justify-content': 'flex-start',
			  'align-content': 'flex-start'
			});
			this.$el.find('[region="bottom_right_box"]').css({
				'border-top-style': 'none',
			  'flex': '0 1 auto',
			  'order': '4',
			  'float': 'right',
			  'margin-left': 'auto',
			  'flex-flow': 'row-reverse nowrap',
			  'justify-content': 'flex-start',
			  'align-items': 'flex-end',
			  'align-content': 'flex-start'
			});
		}
	});

})(Application);
