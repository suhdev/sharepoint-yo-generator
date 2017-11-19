'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const cdnjs = require('cdnjs'); 
const path = require('path'); 
const addField = require('./addfield');
const addContentType = require('./addcontenttype'); 
const addList = require('./addlist');
const configureSiteDefinition = require('./configuresitedefinition');
const configureProject = require('./configureproject');  
const fs = require('fs'); 
const _ = require('lodash'); 

module.exports = class extends Generator {
  prompting() {
    this.libraries = [];
    var defaultConfig = this._cfg = {
      spHost: this.config.get('spHost') || 'http://tenant.sharepoint.com/',
      name: this.config.get('name') || 'test-project',
      url: this.config.get('url') || 'test-site',
      assetsDir: this.config.get('assetsDir') || './assets',
      libDir: this.config.get('libDir') || './libDir',
      useSharePoint:this.config.get('useSharePoint') || true, 
      sharePointVersion:this.config.get('sharePointVersion') || 'online',
      configDir: this.config.get('configDir') || './config',
      srcDir: this.config.get('srcDir') || './src' ,
      sassDir: this.config.get('sassDir') || './sass',
      deploymentDir: this.config.get('deploymentDir') || 'Sysdoc',
      distDir: this.config.get('distDir') || './dist',
      distCssDir: this.config.get('distCssDir') || './dist/css',
      distJsDir: this.config.get('distJsDir') || './dist/js',
      provisioningDir: this.config.get('provisioningDir') || './deploy',
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
      choices:['configure','configure cdn libraries',
        'configure SiteDefinition',
        'nothing']
    }];
    return this.prompt(prompts)
    .then(props => {
      if (props.whatAction === 'configure'){
        return this._configureProject(); 
      }else if (props.whatAction === 'configure cdn libraries'){
        return this._getLibrary();
      }else if (props.whatAction === 'configure SiteDefinition'){
        return this._configureSiteDefinition(); 
      }
      // To access props later use this.props.someAnswer;
      this.props = Object.assign({},this.props || {},props);
    })
    .then(()=>{
      if (this.libraries.length){
        this.cfg.cdn = this.libraries; 
      }
    });
  }

  _addAField(f){
    var isEdit = f?true:false; 
    var field = f || {}; 
    this.siteDefinition.fields = this.siteDefinition.fields || []; 
    return this.prompt(addField(this.siteDefinition,field))
      .then((answers)=>{
        delete answers.provideDefault; 
        if (!isEdit){
          this.siteDefinition.fields.push(field); 
        }
        return this._configureSiteDefinition();
      }); 
  }

  _addAContentType(c){
    var isEdit = c?true:false; 
    var contentType = c || {}; 
    this.siteDefinition.contentTypes = this.siteDefinition.contentTypes || []; 
    return this.prompt(addContentType(this.siteDefinition,contentType))
      .then((answers)=>{
        if (!isEdit){
          this.siteDefinition.contentTypes.push(contentType);
        }
        return this._configureSiteDefinition();
      });
  }

  _addAList(l){
    var isEdit = l?true:false; 
    var list = l || {}; 
    this.siteDefinition.lists = this.siteDefinition.lists || []; 
    return this.prompt(addList(this.siteDefinition,list))
      .then((answers)=>{
        if (!isEdit){
          this.siteDefinition.lists.push(list);
        }
        return this._configureSiteDefinition();
      });
  }

  _configureSiteDefinition(){
    this.siteDefinition = require('sysdoc-util/templates/SiteDefinition'); 
    if (fs.existsSync(path.resolve(process.cwd(),'./SiteDefinition'))){
      this.siteDefinition = require(path.resolve(process.cwd(),'./SiteDefinition')); 
    }
    this.siteDefinition = this.siteDefinition || {};
    this.siteDefinition.fields = this.siteDefinition.fields || []; 
    this.siteDefinition.contentTypes = this.siteDefinition.contentTypes || []; 
    this.siteDefinition.lists = this.siteDefinition.lists || []; 
    return this.prompt(configureSiteDefinition(this.siteDefinition))
      .then((answers)=>{
        this.props = Object.assign({},this.props,answers); 
        if (answers.definitionAction === 'add a field' || 
        (answers.definitionAction === 'edit a field' && answers.fieldName === 'New')){
          return this._addAField();
        }else if (answers.definitionAction === 'edit a field'){
          return this._addAField(this.siteDefinition.fields.find((e)=>e.name === answers.fieldName));
        }else if (answers.definitionAction === 'add a content type' || (
          answers.definitionAction === 'edit a content type' && 
          answers.contentTypeName === 'New')){
          return this._addAContentType();
        }else if (answers.definitionAction === 'edit a content type'){
          return this._addAContentType(this.siteDefinition.contentTypes.find((e)=>e.name === answers.contentTypeName));
        }else if (answers.definitionAction === 'add a list' || (
          answers.definitionAction === 'edit a list' && answers.listTitle === 'New')){
          return this._addAList();
        }else if (answers.definitionAction === 'edit a list'){
          return this._addAList(this.siteDefinition.lists.find((e)=>e.title === answers.listTitle)); 
        }
      });
  }

  _configureProject(){
    return this.prompt(configureProject(this._cfg))
      .then((answers)=>{
        this.cfg = Object.assign({},this.cfg,props);
        this.config.set(this.cfg); 
        this.config.save();
      })
  }

  _getLibrary(){
    let packages = []; 
    this.libraries = this.libraries || [];
    let library = null;
    const libraryPrompts = [{
      type:'list', 
      name:'cdnValue',
      message:'Do you want to add libraries from cdn?',
      choices:['Add library','Remove all libraries','Continue'],
      default:'Continue',
    },{
      type: 'input',
      name: 'cdnLibrary',
      message: 'What is the library name?',
      default: 'jquery',
      when:(answers)=>{
        return answers.cdnValue === 'Add library';
      }
    },{
      type:'list',
      name:'libraryName',
      message:'Available libraries matching your search:', 
      choices:(answers)=>{
        return new Promise((res)=>{
          cdnjs.search(answers.cdnLibrary,(err,pkgs)=>{
            if (err){
              res([]); 
              return; 
            }
            packages = pkgs; 
            res(pkgs.map(e=>e.name)); 
          });
        });
      },
      when:(answers)=>{
        return answers.cdnValue === 'Add library';
      }
    },{
      type:'list',
      name:'libraryVersion',
      message:(answers)=>{
        return `Available versions for ${answers.libraryName}`
      },
      choices:(answers)=>{
        return new Promise((res)=>{
          library = packages.find((e)=>e.name=== answers.libraryName); 
          return res(_.map((library && library.versions) || {},(e,k)=>{
            return k; 
          }));
        }); 
      },
      when:(answers)=>{
        return answers.cdnValue === 'Add library';
      }
    }]; 

    return this.prompt(libraryPrompts)
      .then((answers)=>{
        if (answers.cdn){
          this.libraries.push(library.versions[answers.libraryVersion]); 
          return this.prompt(libraryPrompts); 
        }
      });
  }

  writing() {
    this.fs.copy(
      this.templatePath(path.resolve(__dirname,'../../node_modules/sysdoc-util/templates/gulpfile.js')),
      this.destinationPath('gulpfile.js')
    );
    this.fs.writeJSON('SiteDefinition.json',this.siteDefinition,null,'    '); 
    // this.fs.
  }

  installingDeps() {
    this.npmInstall(['typescript','webpack',
      'gulp','gulp-concat','gulp-uglify',
      'pump','cdnjs','colors','yargs',
      'gulp-data','nunjucks','request',
      'gulp-nunjucks','gulp-sass'], { 'save-dev': true });
    this.npmInstall(['lodash','react','react-dom',
    'strikejs-react','strikejs-router']);
  }

  install() {
    this.installDependencies();
  }
};
