/**
 * Sample MAIN script.
 *
 * @author Stagejs.CLI
 * @created Fri Apr 21 2017 17:11:03 GMT-0700 (PDT)
 */
;(function(app){

	/////////////////setup/////////////////
	app.setup({
		template: '@main.html', //can be undefined if using layout
		layout: undefined,
		navRegion: 'contexts',
		curtains: {},

		//Note: Always set navRegion if using app template here, unless you've merged it(the tpl) with index.html;

		defaultContext: 'Default',
		viewSrcs: 'js', //set this to a folder path to enable view dynamic loading.
		//---------------------------------------------------------------------------------------------
		fullScreen: false, //this will put <body> to be full screen sized (window.innerHeight).
		//---------------------------------------------------------------------------------------------
		i18nTransFile: 'i18n.json', //can be {locale}.json
		i18nLocale: '', //if you really want to force the app to certain locale other than browser preference. (Still override-able by ?locale=.. in url)
		//---------------------------------------------------------------------------------------------
		baseAjaxURI: '', //modify this to fit your own backend apis. e.g index.php?q= or '/api'
		timeout: 5 * 60 * 1000 //general communication timeout (ms), e.g when using app.remote()
	});

	///////////initializers/////////// - [optional]
	app.addInitializer(function(){

	});

	app.addInitializer(function(){

	});
	//Note: initializer can return a promise object for async loading,
	//add more initializers if you need. e.g `return app.remote() or $.ajax()`.

	///////////////////////////warning///////////////////////////
	//Don't put app.run() here, use the one found in index.html//
	/////////////////////////////////////////////////////////////

})(Application);
