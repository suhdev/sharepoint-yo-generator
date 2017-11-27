'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const fs = require('fs');
const addField = require('./addfield');
const addContentType = require('./addcontenttype');
const addList = require('./addlist');
const configureSiteDefinition = require('./configuresitedefinition');
const configureProject = require('./configureproject');
const configurePrototypes = require('./configureprototypes');
const configureComposedLook = require('./configurecomposedlook');
const configureSource = require('./configuresource');
const generateDeploymentScripts = require('./deploy');
const cleanSiteDefinition = require('./cleansitedefinition');
const initial = require('./initial');
const _ = require('lodash');

module.exports = class extends Generator {
  prompting() {
    this.libraries = [];
    var defaultConfig = (this._cfg = {
      spHost: this.config.get('spHost') || 'http://tenant.sharepoint.com/',
      name: this.config.get('name') || 'test-project',
      url: this.config.get('url') || 'test-site',
      assetsDir: this.config.get('assetsDir') || './assets',
      description: this.config.get('description') || '',
      libDir: this.config.get('libDir') || './lib',
      useSharePoint: this.config.get('useSharePoint') || true,
      sharePointVersion: this.config.get('sharePointVersion') || 'online',
      configDir: this.config.get('configDir') || './config',
      srcDir: this.config.get('srcDir') || './src',
      sassDir: this.config.get('sassDir') || './sass',
      deploymentDir: this.config.get('deploymentDir') || 'Sysdoc',
      distDir: this.config.get('distDir') || './dist',
      distCssDir: this.config.get('distCssDir') || './dist/css',
      distJsDir: this.config.get('distJsDir') || './dist/js',
      bootstrapVersion: this.config.get('bootstrapVersion') || 'v4',
      provisioningDir: this.config.get('provisioningDir') || './deploy',
      resourcesDir: this.config.get('resourcesDir') || './resources',
      disableNpmDevInstall: this.config.get('disableNpmDevInstall') || false,
      disableNpmInstall: this.config.get('disableNpmInstall') || false,
      templatesDir: this.config.get('templatesDir') || './templates',
      colorPalette: this.config.get('colorPalette') || {},
      useMobx: this.config.get('useMobx') || {},
      version: this.config.get('version') || '1.0.0',
      masterPageTemplatesDir:
        this.config.get('masterPageTemplatesDir') || './templates/masterpages',
      pageLayoutTemplatesDir:
        this.config.get('pageLayoutTemplatesDir') || './templates/pagelayouts',
      prototypeTemplatesDir:
        this.config.get('prototypeTemplatesDir') || './templates/prototypes',
      prototypeDir: this.config.get('prototypeDir') || './prototype',
      templatesExtraConfig: this.config.get('templatesExtraConfig') || {},
      cdn: this.config.get('cdn') || [],
      env: this.config.get('env') || 'dev',
      masterpageCatalogDrive: this.config.get('masterpageCatalogDrive') || 'T',
      siteAssetsDrive: this.config.get('siteAssetsDrive') || 'S',
      styleLibraryDrive: this.config.get('styleLibraryDrive') || 'R'
    });
    // Have Yeoman greet the user.
    this.log(
      yosay('Welcome to the super-duper ' + chalk.red('generator-sysdoc') + ' generator!')
    );
    return initial(this, this._cfg);
  }

  writing() {
    if (!this.fs.exists(this.destinationPath('gulpfile.js'))) {
      this.fs.copy(
        this.templatePath(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/templates/gulpfile.js'
          )
        ),
        this.destinationPath('gulpfile.js')
      );
    }
    if (!this.fs.exists(this.destinationPath('CodeConventions.md'))) {
      this.fs.copy(
        this.templatePath(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/templates/CodeConventions.md'
          )
        ),
        this.destinationPath('CodeConventions.md')
      );
    }
    if (!this.fs.exists(this.destinationPath('webpack.config.js'))) {
      this.fs.copy(
        this.templatePath(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/templates/webpack.config.js'
          )
        ),
        this.destinationPath('webpack.config.js')
      );
    }
    if (!this.fs.exists(this.destinationPath('tsconfig.json'))) {
      this.fs.copy(
        this.templatePath(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/templates/tsconfig.json'
          )
        ),
        this.destinationPath('tsconfig.json')
      );
    }
    if (!this.fs.exists(this.destinationPath('README.md'))) {
      this.fs.copyTpl(
        this.templatePath(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/templates/README.md.ejs'
          )
        ),
        this.destinationPath('README.md'),
        {
          config: this._cfg
        }
      );
    }
    if (!fs.existsSync(this.destinationPath(this._cfg.srcDir))) {
      this.fs.write(path.resolve(this.destinationPath(this._cfg.srcDir), '.gitkeep'), '');
    }
    if (!fs.existsSync(this.destinationPath(this._cfg.srcDir, 'components'))) {
      this.fs.write(
        path.resolve(this.destinationPath(this._cfg.srcDir, 'components'), '.gitkeep'),
        ''
      );
    }
    if (!fs.existsSync(this.destinationPath(this._cfg.srcDir, 'controllers'))) {
      this.fs.write(
        path.resolve(this.destinationPath(this._cfg.srcDir, 'controllers'), '.gitkeep'),
        ''
      );
    }
    if (!fs.existsSync(this.destinationPath(this._cfg.srcDir, 'services'))) {
      this.fs.write(
        path.resolve(this.destinationPath(this._cfg.srcDir, 'services'), '.gitkeep'),
        ''
      );
    }
    if (!fs.existsSync(this.destinationPath(this._cfg.srcDir, 'prototypes'))) {
      this.fs.write(
        path.resolve(this.destinationPath(this._cfg.srcDir, 'prototypes'), '.gitkeep'),
        ''
      );
    }
    if (!fs.existsSync(this.destinationPath(this._cfg.templatesDir))) {
      this.fs.write(
        path.resolve(this.destinationPath(this._cfg.templatesDir), '.gitkeep'),
        ''
      );
    }
    if (!fs.existsSync(this.destinationPath(this._cfg.prototypeDir))) {
      this.fs.write(
        path.resolve(this.destinationPath(this._cfg.prototypeDir), '.gitkeep'),
        ''
      );
    }
    if (!fs.existsSync(this.destinationPath(this._cfg.prototypeTemplatesDir))) {
      this.fs.write(
        path.resolve(this.destinationPath(this._cfg.prototypeTemplatesDir), '.gitkeep'),
        ''
      );
    }
    if (
      !fs.existsSync(
        path.resolve(this.destinationPath(this._cfg.prototypeTemplatesDir), './index.njk')
      )
    ) {
      this.fs.copyTpl(
        this.templatePath(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/templates/baseprototype.ejs'
          )
        ),
        path.resolve(
          this.destinationPath(this._cfg.prototypeTemplatesDir),
          './index.njk'
        ),
        {
          config: this._cfg
        }
      );
    }
    if (!fs.existsSync(this.destinationPath(this._cfg.libDir))) {
      this.fs.write(path.resolve(this.destinationPath(this._cfg.libDir), '.gitkeep'), '');
    }
    if (this._cfg.useSharePoint) {
      if (!fs.existsSync(this.destinationPath(this._cfg.masterPageTemplatesDir))) {
        this.fs.write(path.resolve(this._cfg.masterPageTemplatesDir, '.gitkeep'), '');
      }
      if (!fs.existsSync(this.destinationPath(this._cfg.pageLayoutTemplatesDir))) {
        this.fs.write(
          path.resolve(
            this.destinationPath(this._cfg.pageLayoutTemplatesDir),
            '.gitkeep'
          ),
          ''
        );
      }
      if (
        !fs.existsSync(
          path.resolve(this.destinationPath(this._cfg.templatesDir), './partials')
        )
      ) {
        this.fs.write(
          path.resolve(
            this.destinationPath(this._cfg.templatesDir),
            './partials/.gitkeep'
          ),
          ''
        );
      }
    }
    if (!fs.existsSync(path.resolve(this.destinationPath(), this._cfg.sassDir))) {
      this.fs.copy(
        this.templatePath(
          path.resolve(__dirname, '../../node_modules/sharepoint-util/sass/partials')
        ),
        this.destinationPath(this._cfg.sassDir)
      );
    }
    if (
      !this.fs.exists(
        this.destinationPath(path.resolve(this._cfg.sassDir, 'main.min.scss'))
      )
    ) {
      this.fs.copyTpl(
        this.templatePath(
          path.resolve(__dirname, '../../node_modules/sharepoint-util/sass/main.min.scss')
        ),
        this.destinationPath(path.resolve(this._cfg.sassDir, 'main.min.scss')),
        {
          config: this._cfg
        }
      );
    }
    if (
      !this.fs.exists(
        this.destinationPath(path.resolve(this._cfg.sassDir, '_settings.scss'))
      )
    ) {
      this.fs.copyTpl(
        this.templatePath(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/sass/_settings.scss'
          )
        ),
        this.destinationPath(path.resolve(this._cfg.sassDir, '_settings.scss')),
        {
          config: this._cfg
        }
      );
    }
    if (
      !this.fs.exists(
        this.destinationPath(path.resolve(this._cfg.sassDir, '_siteurl.scss'))
      )
    ) {
      this.fs.copyTpl(
        this.templatePath(
          path.resolve(__dirname, '../../node_modules/sharepoint-util/sass/_siteurl.scss')
        ),
        this.destinationPath(path.resolve(this._cfg.sassDir, '_siteurl.scss')),
        {
          config: this._cfg
        }
      );
    }
    if (
      !this.fs.exists(
        this.destinationPath(path.resolve(this._cfg.sassDir, '_bootstrapinclude.scss'))
      )
    ) {
      this.fs.copyTpl(
        this.templatePath(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/templates/bootstrapinclude.scss.ejs'
          )
        ),
        this.destinationPath(path.resolve(this._cfg.sassDir, '_bootstrapinclude.scss')),
        {
          config: this._cfg
        }
      );
    }
    if (
      !this.fs.exists(
        this.destinationPath(path.resolve(this._cfg.sassDir, '_bootstrap.scss'))
      )
    ) {
      this.fs.copy(
        this.templatePath(
          path.resolve(
            __dirname,
            this._cfg.bootstrapVersion === 'v4'
              ? '../../node_modules/bootstrap/scss/_variables.scss'
              : '../../node_modules/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss'
          )
        ),
        this.destinationPath(path.resolve(this._cfg.sassDir, '_bootstrap.scss'))
      );
    }
    if (this.siteDefinition) {
      this.fs.writeJSON('SiteDefinition.json', this.siteDefinition, null, '    ');
    }
    // This.fs.
  }

  installingDeps() {
    var depsToInstall = [
      'lodash',
      'react',
      'sp-pnp-js',
      'bluebird',
      'react-dom',
      this._cfg.bootstrapVersion === 'v3' ? 'bootstrap-sass' : 'bootstrap@^4.0.0-beta.2'
    ];
    if (this._cfg.useMobx) {
      depsToInstall.push('mobx', 'mobx-react');
    } else {
      depsToInstall.push('strikejs-react');
    }
    var devDepsToInstall = [
      'typescript',
      'webpack',
      'gulp',
      'gulp-concat',
      'gulp-uglify',
      'gulp-autoprefixer',
      'pump',
      'cdnjs',
      'colors',
      'yargs',
      'gulp-data',
      'nunjucks',
      'request',
      'gulp-nunjucks',
      'gulp-sass',
      'gulp-rename',
      'express',
      'serve-static',
      'awesome-typescript-loader',
      '@types/react',
      '@types/react-dom',
      '@types/lodash',
      '@types/bluebird',
      '@types/sharepoint',
      'json-loader'
    ];
    if (this.destinationPath('package.json')) {
      const pack = require(this.destinationPath('package.json'));
      if (pack.dependencies) {
        var installed = Object.keys(pack.dependencies);
        depsToInstall = depsToInstall.filter(e => {
          return installed.indexOf(e) === -1;
        });
      }
      if (pack.devDependencies) {
        var installed = Object.keys(pack.devDependencies);
        devDepsToInstall = devDepsToInstall.filter(e => {
          return installed.indexOf(e) === -1;
        });
      }
    }
    if (!this._cfg.disableNpmDevInstall) {
      this.npmInstall(devDepsToInstall, { 'save-dev': true });
    }
    if (!this._cfg.disableNpmInstall) {
      this.npmInstall(depsToInstall);
    }
  }

  install() {
    if (!this._cfg.disableNpmDevInstall || !this._cfg.disableNpmInstall) {
      this.installDependencies({
        npm: true,
        bower: false
      });
    }
  }
};
