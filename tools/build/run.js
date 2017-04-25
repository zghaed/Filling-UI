/**
 * This is the build script for building your web application front-end. (for theme/css prep, see themeprep/)
 *
 * 1. read build config;
 * 2. combine all the view templates (*.html) into all.json;
 * 3. load target html and process js targets on it, producing a cached map of js targets -- through /shared/process-html.js; 
 * 	  (we also support patching in the auto-loaded scripts)
 * 4. output <target>.js files, index.html and related folder structure based on config.structure -- through /shared/hammer.js;
 *
 * Note: this script use process-html.js to build js targets (cachedFiles) then use hammer.js with config.structure to copy/reveal the files
 * into final deployment folder (config.output).
 *
 * @author Tim Lauv
 * @created 2013.09.26
 * @updated 2014.03.13
 */

var program = require('commander'), 
_ = require('underscore'),
path = require('path'),
colors = require('colors'),
moment = require('moment'),
hammer = require('../shared/hammer'),
processor = require('../shared/process-html'),
rimraf = require('rimraf'),
AdmZip = require('adm-zip'),
targz = new (require('tar.gz'))(9, 9),
fs = require('fs-extra'),
wrench = require('wrench');
_.string = require('underscore.string');


program.version('1.0.1')
		.usage('[options] [output folder]')
		.option('-B --base <path>', 'implementation base folder, default to config.src.root')
		.option('-C --config [dist]', 'config name used for the build, \'abc\' means to use \'config.abc.js\'', 'dist')
		.option('-G --targz <path>', 'put the output path into a compressed .tar.gz file')
		.option('-Z --zip <path>', 'put the output path into a compressed .zip file [use only on non-Unix env]');

program.parse(process.argv);
var outputFolder = program.args[0] || 'dist';
var startTime = new Date();

if(!program.config) throw new Error('You must choose a config.[profile].js for this build...');

//0. load build config according to --config
var configName = './config.' + program.config + '.js';
try{
	var config = require(configName);
}catch(e){
	console.log('Error'.red, e);
	process.exit(1);
}
config.src.root = program.base || config.src.root;
config.src.root = path.join(_.string.startsWith(config.src.root, path.sep)?'':__dirname, config.src.root);
console.log('Start building using config ['.yellow, configName, '] >> ['.yellow, outputFolder, ']'.yellow);

//1. combine view templates into all.json
if(config.src.templates){
	var tplBase = path.join(config.src.root, config.src.templates);
	if(fs.existsSync(tplBase)){
		var tpls = wrench.readdirSyncRecursive(tplBase);
		tpls = _.reject(tpls, function(name){
			return !name.match(/(\.html|\.md)$/);
		});
		var all = {};
		_.each(tpls, function(name){
			var tpl = fs.readFileSync(path.join(tplBase, name), {encoding: 'utf8'});
			name = '@' + name.split(path.sep).join('/');//tag tpl name as @remote tpl, normalize file path from different OS
			console.log('[template]'.green, name, '+'.green);
			if(_.string.endsWith(name, '.html'))
				all[name] = tpl.replace(/[\n\t]/g, '');
			else
				all[name] = tpl;
		});
		var allJSON = path.join(tplBase, 'all.json');
		fs.outputJSONSync(allJSON, all);
		console.log(tplBase, '=>', allJSON);	
	}
	else console.log('Templates not found...'.grey, tplBase);


}

//2. start processing index page --> cachedFiles for later use by folder hammer.
var result = config.src.index ? processor.combine({
	root: config.src.root,
	html: config.src.index,
	js: config.js,
	cfgName: program.config
}): {};

//3. hammer the output folder structure out
hammer.createFolderStructure(_.extend({cachedFiles: result, output: outputFolder}, config), function(){
	//check if --G
	if(program.targz) {
		//tar.gz
		var tarball = path.normalize(program.targz);
		targz.compress(outputFolder, tarball, function(err){
			if(err) console.log('ERROR'.red, err.message);
			else console.log('Gzipped into ', tarball.yellow);
		});
	}
	//check if --Z
	if(program.zip) {
		//zip (problem on Unix based machine)
		var zip = new AdmZip();
		zip.addLocalFolder(outputFolder);
		var name = path.normalize(program.zip);
		zip.writeZip(name);
		console.log('Zipped into ', name.yellow);
	}
	console.log('Build Task [app] Complete'.rainbow, '-', moment.utc(new Date().getTime() - startTime.getTime()).format('HH:mm:ss.SSS').underline, '@', startTime);
});

