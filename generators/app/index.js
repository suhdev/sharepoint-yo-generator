'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path'); 
const addField = require('./addfield');
const addContentType = require('./addcontenttype'); 
const addList = require('./addlist');
const configureSiteDefinition = require('./configuresitedefinition');
const configureProject = require('./configureproject');  
const fs = require('fs'); 
const cleanSiteDefinition = require('./cleansitedefinition');
const generateDeploymentScripts = require('./deploy');
const _ = require('lodash'); 

module.exports = class extends Generator {
  prompting() {
    this.libraries = [];
    var defaultConfig = this._cfg = {
      spHost: this.config.get('spHost') || 'http://tenant.sharepoint.com/',
      name: this.config.get('name') || 'test-project',
      url: this.config.get('url') || 'test-site',
      assetsDir: this.config.get('assetsDir') || './assets',
      libDir: this.config.get('libDir') || './lib',
      useSharePoint:this.config.get('useSharePoint') || true, 
      sharePointVersion:this.config.get('sharePointVersion') || 'online',
      configDir: this.config.get('configDir') || './config',
      srcDir: this.config.get('srcDir') || './src' ,
      sassDir: this.config.get('sassDir') || './sass',
      deploymentDir: this.config.get('deploymentDir') || 'Sysdoc',
      distDir: this.config.get('distDir') || './dist',
      distCssDir: this.config.get('distCssDir') || './dist/css',
      distJsDir: this.config.get('distJsDir') || './dist/js',
      bootstrapVersion: this.config.get('bootstrapVersion') || 'v4',
      provisioningDir: this.config.get('provisioningDir') || './deploy',
      disableNpmDevInstall: this.config.get('disableNpmDevInstall') || false, 
      disableNpmInstall: this.config.get('disableNpmInstall') || false, 
      templatesDir: this.config.get('templatesDir') || './templates',
      version:this.config.get('version') || '1.0.0',
      masterPageTemplatesDir: this.config.get('masterPageTemplatesDir') || './templates/masterpage',
      pageLayoutTemplatesDir: this.config.get('pageLayoutTemplatesDir') || './templates/pagelayouts',
      templatesExtraConfig: this.config.get('templatesExtraConfig') || {},
      cdn: this.config.get('cdn') || [],
      env: this.config.get('env') || 'dev',
      masterpageCatalogDrive: this.config.get('masterpageCatalogDrive') || 'T',
      siteAssetsDrive: this.config.get('siteAssetsDrive') ||'S',
      styleLibraryDrive: this.config.get('styleLibraryDrive') ||'R',
    }; 
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the super-duper ' + chalk.red('generator-sysdoc') + ' generator!'
    ));

    const prompts = [{
      type: 'list',
      name: 'whatAction',
      message:'What would you like to do?',
      default:'configure', 
      choices:[
        'configure',
        'generate deployment scripts',
        'configure cdn libraries',
        'configure SiteDefinition',
        'nothing']
    }];
    return this.prompt(prompts)
    .then(props => {
      var siteDefinitionExists = fs.existsSync(this.destinationPath('SiteDefinition.json'));
      if (this.config.get('useSharePoint') || siteDefinitionExists){
        if (siteDefinitionExists){
          this.siteDefinition = require(this.destinationPath('SiteDefinition.json')); 
        }else {
          this.siteDefinition = require('sharepoint-util/templates/SiteDefinition'); 
        }
      }
      if (props.whatAction === 'generate deployment scripts'){
        return this._generateDeploymentScripts(); 
      }else if (props.whatAction === 'configure'){
        return this._configureProject(); 
      }else if (props.whatAction === 'configure cdn libraries'){
        return this._getLibrary();
      }else if (props.whatAction === 'configure SiteDefinition'){
        return this._configureSiteDefinition(); 
      }
      
    })
    .then(()=>{
      if (this.libraries.length){
        this.cfg.cdn = this.libraries; 
      }
    });
  }

  _generateDeploymentScripts(){
    return generateDeploymentScripts(this,this.siteDefinition,this._cfg); 
  }

  _configureSiteDefinition(){
    this.siteDefinition = this.siteDefinition || {};
    this.siteDefinition.fields = this.siteDefinition.fields || []; 
    this.siteDefinition.contentTypes = this.siteDefinition.contentTypes || []; 
    this.siteDefinition.lists = this.siteDefinition.lists || []; 
    this.siteDefinition.termGroups = this.siteDefinition.termGroups || [];
    return configureSiteDefinition(this,this.siteDefinition); 
  }

  _configureProject(){
    return configureProject(this,this._cfg)
      .then((answers)=>{
        this.config.set(this._cfg);
        this.config.save();
      });
  }

  _getLibrary(){
    let packages = []; 
    this.libraries = this.libraries || [];
    let library = null;
    const libraryPrompts = [{
      type:'list', 
      name:'cdnAction',
      message:'Do you want to add libraries from cdn?',
      choices:['add a library','Remove all libraries','Continue'],
      default:'Continue',
    },{
      type: 'input',
      name: 'cdnLibrary',
      message: 'What is the library name?',
      default: 'jquery',
      when:(answers)=>{
        return answers.cdnAction === 'add a library';
      }
    },
    // {
    //   type:'list',
    //   name:'libraryName',
    //   message:'Available libraries matching your search:', 
    //   choices:(answers)=>{
    //     return new Promise((res)=>{
    //       cdnjs.search(answers.cdnLibrary,(err,pkgs)=>{
    //         if (err){
    //           res([]); 
    //           return; 
    //         }
    //         packages = pkgs; 
    //         res(pkgs.map(e=>e.name)); 
    //       });
    //     });
    //   },
    //   when:(answers)=>{
    //     return answers.cdnValue === 'Add library';
    //   }
    // },
    // {
    //   type:'list',
    //   name:'libraryVersion',
    //   message:(answers)=>{
    //     return `Available versions for ${answers.libraryName}`
    //   },
    //   choices:(answers)=>{
    //     return new Promise((res)=>{
    //       library = packages.find((e)=>e.name=== answers.libraryName); 
    //       return res(_.map((library && library.versions) || {},(e,k)=>{
    //         return k; 
    //       }));
    //     }); 
    //   },
    //   when:(answers)=>{
    //     return answers.cdnValue === 'Add library';
    //   }
    // }
  ]; 

    return this.prompt(libraryPrompts)
      .then((answers)=>{
        if (answers.cdnAction === 'add a library'){
          this.libraries.push(answers.cdnLibrary);
          this._cfg.cdn.push(answers.cdnLibrary); 
          // this.libraries.push(library.versions[answers.libraryVersion]); 
          return this.prompt(libraryPrompts); 
        }
      });
  }

  writing() {
    if (!this.fs.exists(this.destinationPath('gulpfile.js'))){
      this.fs.copy(
        this.templatePath(path.resolve(__dirname,'../../node_modules/sharepoint-util/templates/gulpfile.js')),
        this.destinationPath('gulpfile.js')
      );
    }
    if (!this.fs.exists(this.destinationPath('CodeConventions.md'))) {
      this.fs.copy(
        this.templatePath(path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/CodeConventions.md')),
        this.destinationPath('CodeConventions.md')
      );
    }
    if (!this.fs.exists(this.destinationPath('webpack.config.js'))) {
      this.fs.copy(
        this.templatePath(path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/webpack.config.js')),
        this.destinationPath('webpack.config.js')
      );
    }
    if (!this.fs.exists(this.destinationPath('tsconfig.json'))){
      this.fs.copy(
        this.templatePath(path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/tsconfig.json')),
        this.destinationPath('tsconfig.json')
      );
    }
    if (!this.fs.exists(this.destinationPath('README.md'))){
      this.fs.copyTpl(
        this.templatePath(path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/README.md.ejs')),
        this.destinationPath('README.md'),
        {
          config:this._cfg
        }
      );
    }
    console.log(fs.existsSync(path.resolve(this.destinationPath(), this._cfg.sassDir)), path.resolve(this.destinationPath(), this._cfg.sassDir));
    if (!fs.existsSync(path.resolve(this.destinationPath(),this._cfg.sassDir))){
      this.fs.copy(
        this.templatePath(path.resolve(__dirname,'../../node_modules/sharepoint-util/sass/partials')),
        this.destinationPath(this._cfg.sassDir)
      );
    }
    if (!this.fs.exists(this.destinationPath(path.resolve(this._cfg.sassDir, 'main.min.scss')))){
      this.fs.copyTpl(this.templatePath(path.resolve(__dirname,'../../node_modules/sharepoint-util/templates/main.min.scss.ejs')),
        this.destinationPath(path.resolve(this._cfg.sassDir,'main.min.scss')),{
        config:this._cfg
      });
    }
    if (!this.fs.exists(this.destinationPath(path.resolve(this._cfg.sassDir, '_bootstrap.scss')))){
      this.fs.copy(this.templatePath(path.resolve(__dirname, this._cfg.bootstrapVersion === 'v4' ?'../../node_modules/bootstrap/scss/_variables.scss':
      '../../node_modules/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss')),
        this.destinationPath(path.resolve(this._cfg.sassDir, '_bootstrap.scss')));
    }
    if (this.siteDefinition){
      this.fs.writeJSON('SiteDefinition.json',this.siteDefinition,null,'    '); 
    }
    // this.fs.
  }

  installingDeps() {
    var depsToInstall = ['lodash', 'react', 'sp-pnp-js', 'bluebird', 'react-dom', this._cfg.bootstrapVersion === 'v3' ? 'bootstrap-sass' : 'bootstrap',
      'strikejs-react@^6.0.0', 'strikejs-router']; 
    var devDepsToInstall = ['typescript', 'webpack',
      'gulp', 'gulp-concat', 'gulp-uglify',
      'pump', 'cdnjs', 'colors', 'yargs',
      'gulp-data', 'nunjucks', 'request',
      'gulp-nunjucks', 'gulp-sass',
      'awesome-typescript-loader',
      '@types/react', '@types/react-dom',
      '@types/lodash', '@types/bluebird',
      '@types/sharepoint', 'json-loader']; 
    if (this.destinationPath('package.json')){
      const pack = require(this.destinationPath('package.json')); 
      if (pack.dependencies){
        var installed = Object.keys(pack.dependencies); 
        depsToInstall = depsToInstall.filter((e)=>{
          return installed.indexOf(e) === -1; 
        });
      }
      if (pack.devDependencies){
        var installed = Object.keys(pack.devDependencies); 
        devDepsToInstall = devDepsToInstall.filter((e)=>{
          return installed.indexOf(e) !== -1; 
        });
      }
    }
    if (!this._cfg.disableNpmDevInstall){
      this.npmInstall(devDepsToInstall, { 'save-dev': true });
    }
    if (!this._cfg.disableNpmInstall){
      this.npmInstall(depsToInstall);
    }
  }

  install() {
    if (!this._cfg.disableNpmDevInstall || !this._cfg.disableNpmInstall){
      this.installDependencies();

    }
  }
};
