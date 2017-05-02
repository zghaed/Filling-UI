;(function(app){

	app.view('TestC', {
		name: 'TestC',
		template: [
			'<div class="col-md-12 wrapper-full" style="height:75em;"><div region="test-C" style="border: 1px solid black;"></div></div>',
			],
		onReady: function(){
			this.$el.find('[region="test-C"]').flexlayout([
					['1:region1:', ['1:region-11:','2:region-12:']],
				], {
				adjust: true,
				bars: { flex: '0 0 3px', 'background-color': '#CCC'}
			});
		}
	});

})(Application);
