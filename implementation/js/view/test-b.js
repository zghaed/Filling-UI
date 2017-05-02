;(function(app){

	app.view('TestB', {
		name: 'TestB',
		template: [
			'<div class="col-md-12 wrapper-full" style="height:75em;"><div region="test-a" style="border: 1px solid black;"></div></div>',
			],
		onReady: function(){
			this.$el.find('[region="test-a"]').flexlayout([
					['1:region1:', ['1:region-1-1:']],
					['1:region2:', ['1:region-2-1:']],
				], {
				adjust: true,
				bars: { flex: '0 0 3px', 'background-color': '#CCC'}
			});
		}
	});

})(Application);
