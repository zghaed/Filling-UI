;(function(app){

	app.view('TestA', {
		name: 'TestA',
		template: [
			'<div class="col-md-12 wrapper-full" style="height:75em;"><div region="test-a" style="border: 1px solid black;"></div></div>',
			],
		onReady: function(){
			this.$el.find('[region="test-a"]').flexlayout([
					['1:region1:', ['1:region11:','2:region12:']],
					['2:region2:', ['2:region21:','1:region22:']],
				], {
				adjust: true,
				bars: { flex: '0 0 3px', 'background-color': '#CCC'}
			});
		}
	});

})(Application);
