module.exports = function configureProject(generator, defaultConfig) {
  const prompts = [
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do next?',
      choices: () => {
        var c = [
          'init',
          'set title',
          'set name',
          'set description',
          'set version',
          'set assets directory',
          'set lib directory',
          'set src directory',
          'set sass directory',
          'set dist directory',
          'set dist CSS directory',
          'set dist JS directory',
          'set use SharePoint',
          'set use mobx',
          'set SharePoint version',
          'set provisioning directory',
          'set deployment directory',
          'set resources directory',
          'set templates directory',
          'set master page templates directory',
          'set page layout templates directory',
          'set master page catalog mapped drive',
          'set site assets mapped drive',
          'set style library mapped drive',
          'disable npm install --save-dev',
          'enable npm install --save-dev',
          'disable npm install --save',
          'enable npm install --save',
          'set bootstrap version'
        ];

        c.push('back');
        return c;
      }
    },
    {
      type: 'input',
      name: 'title',
      message: 'What is the project title?',
      default: defaultConfig.title,
      filter: val => {
        defaultConfig.title = val.trim();
        return val;
      },
      when: answers => {
        return answers.action === 'init' || answers.action === 'set title';
      },
      validate(val) {
        return val && val.trim() ? true : 'Please provide a valid title';
      }
    },
    {
      type: 'input',
      name: 'name',
      message: 'What is the project name?, this should be lower case and no spaces',
      default: () => {
        return (
          defaultConfig.name ||
          (defaultConfig.title &&
            defaultConfig.title
              .trim()
              .replace(/([a-z])([A-Z])/g, '$1-$2')
              .replace(/[\s]+/g, '-')
              .toLowerCase())
        );
      },
      filter: val => {
        defaultConfig.name = val
          .trim()
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .toLowerCase();
        return val;
      },
      when: answers => {
        return answers.action === 'init' || answers.action === 'set name';
      },
      validate(val) {
        return val && val.trim() ? true : 'Please provide a valid name';
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'What is the description of the project?',
      default: () => {
        return defaultConfig.description;
      },
      filter: val => {
        defaultConfig.description = val;
        return val;
      },
      when: answers => {
        return answers.action === 'init' || answers.action === 'set description';
      }
    },
    {
      type: 'confirm',
      name: 'useMobx',
      message: 'Do you want to use mobx?',
      default: () => {
        return defaultConfig.mobx || true;
      },
      filter(val) {
        defaultConfig.useMobx = val;
        return val;
      },
      when(answers) {
        return answers.action === 'init' || answers.action === 'set use mobx';
      }
    },
    {
      type: 'input',
      name: 'version',
      message: 'What is the version number of the project?',
      default: defaultConfig.version || '1.0.0',
      filter: val => {
        defaultConfig.version = val;
        return val;
      },
      when: answers => {
        return answers.action === 'init' || answers.action === 'set version';
      }
    },
    {
      type: 'confirm',
      name: 'useDefaultFolders',
      message: 'Would you like to use default folders/directories configurations?',
      default: true,
      when(answers) {
        return answers.action === 'init';
      }
    },
    {
      type: 'input',
      name: 'assetsDir',
      message: 'What is the path to the assets directory?',
      default: defaultConfig.assetsDir,
      filter: val => {
        defaultConfig.assetsDir = val;
        return val;
      },
      when(answers) {
        return (
          (!answers.useDefaultFolders && answers.action === 'init') ||
          answers.action === 'set assets directory'
        );
      }
    },
    {
      type: 'input',
      name: 'libDir',
      filter: val => {
        defaultConfig.libDir = val;
        return val;
      },
      message: 'What is the path to the library (vendor) directory?',
      default: './lib',
      when(answers) {
        return (
          (!answers.useDefaultFolders && answers.action === 'init') ||
          answers.action === 'set lib directory'
        );
      }
    },
    {
      type: 'input',
      name: 'srcDir',
      filter: val => {
        defaultConfig.srcDir = val;
        return val;
      },
      message: 'What is the path to the source directory?',
      default: './src',
      when(answers) {
        return (
          (!answers.useDefaultFolders && answers.action === 'init') ||
          answers.action === 'set src directory'
        );
      }
    },
    {
      type: 'input',
      name: 'sassDir',
      filter: val => {
        defaultConfig.sassDir = val;
        return val;
      },
      message: 'What is the path to the sass source directory?',
      default: './sass',
      when(answers) {
        return (
          (!answers.useDefaultFolders && answers.action === 'init') ||
          answers.action === 'set sass directory'
        );
      }
    },
    {
      type: 'input',
      name: 'distDir',
      filter: val => {
        defaultConfig.distDir = val;
        return val;
      },
      message:
        'What is the path to the distribution directory (to host the compiled files)?',
      default: './dist',
      when(answers) {
        return (
          (!answers.useDefaultFolders && answers.action === 'init') ||
          answers.action === 'set dist directory'
        );
      }
    },
    {
      type: 'input',
      name: 'distCssDir',
      filter: val => {
        defaultConfig.distCssDir = val;
        return val;
      },
      message: 'What is the path to the CSS distribution directory?',
      default: './dist/css',
      when(answers) {
        return (
          (!answers.useDefaultFolders && answers.action === 'init') ||
          answers.action === 'set dist CSS directory'
        );
      }
    },
    {
      type: 'input',
      name: 'distJsDir',
      filter: val => {
        defaultConfig.distJsDir = val;
        return val;
      },
      message: 'What is the path to the JS distribution directory?',
      default: './dist/js',
      when(answers) {
        return (
          (!answers.useDefaultFolders && answers.action === 'init') ||
          answers.action === 'set dist JS directory'
        );
      }
    },
    {
      type: 'confirm',
      name: 'useSharePoint',
      message: 'Are you using SharePoint?',
      default: true,
      when(answers) {
        return answers.action === 'init' || answers.action === 'set use SharePoint';
      }
    },
    {
      type: 'list',
      name: 'sharePointVersion',
      filter: val => {
        defaultConfig.sharePointVersion = val;
        return val;
      },
      message: 'What version of SharePoint are you using?',
      default: 'online',
      choices: ['online', '2013', '2016'],
      when: answers => {
        return (
          (answers.userSharePoint && answers.action === 'init') ||
          answers.action === 'set SharePoint version'
        );
      }
    },
    {
      type: 'confirm',
      name: 'useSpDefaultDirectories',
      default: true,
      message: 'Do you want to use the default directory configurations for SharePoint?',
      when: answers => {
        return answers.usersSharePoint && answers.action === 'init';
      }
    },
    {
      type: 'input',
      name: 'provisioningDir',
      filter: val => {
        defaultConfig.provisioningDir = val;
        return val;
      },
      message: 'What is the path to the provisioning directory?',
      default: './deploy',
      when: answers => {
        return (
          (answers.userSharePoint &&
            !answers.useSpDefaultDirectories &&
            answers.action === 'init') ||
          answers.action === 'set provisioning directory'
        );
      }
    },
    {
      type: 'input',
      name: 'deploymentDir',
      filter: val => {
        defaultConfig.deploymentDir = val;
        return val;
      },
      message:
        'What is the assets deployment directory (i.e. the top level folder in Site Assets)?',
      default: 'Sysdoc',
      when: answers => {
        return (
          (answers.userSharePoint &&
            !answers.useSpDefaultDirectories &&
            answers.action === 'init') ||
          answers.action === 'set deployment directory'
        );
      }
    },
    {
      type: 'input',
      name: 'templatesDir',
      filter: val => {
        defaultConfig.templatesDir = val;
        return val;
      },
      message: 'What is the path to the Nunjucks templates directory?',
      default: './templates',
      when: answers => {
        return answers.action === 'init' || answers.action === 'set templates directory';
      }
    },
    {
      type: 'input',
      name: 'masterPageTemplatesDir',
      filter: val => {
        defaultConfig.masterPageTemplatesDir = val;
        return val;
      },
      message: 'What is the path to the master page templates directory?',
      default: './templates/masterpage',
      when: answers => {
        return (
          (answers.userSharePoint &&
            !answers.useSpDefaultDirectories &&
            answers.action === 'init') ||
          answers.action === 'set master page templates directory'
        );
      }
    },
    {
      type: 'input',
      name: 'pageLayoutTemplatesDir',
      filter: val => {
        defaultConfig.pageLayoutTemplatesDir = val;
        return val;
      },
      message: 'What is the path to the page layout templates directory?',
      default: './templates/pagelayout',
      when: answers => {
        return (
          (answers.userSharePoint &&
            !answers.useSpDefaultDirectories &&
            answers.action === 'init') ||
          answers.action === 'set page layout templates directory'
        );
      }
    },
    {
      type: 'confirm',
      name: 'mappingDrives',
      message: 'Have you mapped drives?',
      default: true,
      when: answers => {
        return answers.userSharePoint && answers.action === 'init';
      }
    },
    {
      type: 'confirm',
      name: 'useDefaultMappedDrives',
      message: 'Do you want to use the default drives for SharePoint drives?',
      default: true,
      when: answers => {
        return (
          answers.userSharePoint && answers.mappingDrives && answers.action === 'init'
        );
      }
    },
    {
      type: 'input',
      name: 'masterpageCatalogDrive',
      filter: val => {
        defaultConfig.masterpageCatalogDrive = val;
        return val;
      },
      message: 'What is the drive pointing to the master page library?',
      default: 'T',
      when(answers) {
        return (
          (answers.mappingDrives &&
            answers.useSharePoint &&
            answers.useDefaultMappedDrives &&
            answers.action === 'init') ||
          answers.action === 'set master page catalog mapped drive'
        );
      }
    },
    {
      type: 'input',
      name: 'siteAssetsDrive',
      validate(val) {
        return val && val.trim() ? true : 'Please provide a valid site assets drive';
      },
      filter: val => {
        defaultConfig.siteAssetsDrive = val.trim();
        return val;
      },
      message: 'What is the drive pointing to the Site Assets library?',
      default: 'S',
      when(answers) {
        return (
          (answers.mappingDrives &&
            answers.useSharePoint &&
            answers.useDefaultMappedDrives &&
            answers.action === 'init') ||
          answers.action === 'set site assets mapped drive'
        );
      }
    },
    {
      type: 'input',
      name: 'resourceDir',
      filter: val => {
        defaultConfig.resourcesDir = val.trim();
        return val;
      },
      validate(val) {
        return val && val.trim() ? true : 'Please provide a valid resources file';
      },
      message: 'What is the directory for your resources files?',
      default: './resources',
      when(answers) {
        return answers.action === 'init' || answers.action === 'set resources directory';
      }
    },
    {
      type: 'input',
      name: 'styleLibraryDrive',
      filter: val => {
        defaultConfig.styleLibraryDrive = val;
        return val;
      },
      message: 'What is the drive pointing to the Style Library?',
      default: 'R',
      when(answers) {
        return (
          (answers.mappingDrives &&
            answers.useSharePoint &&
            answers.useDefaultMappedDrives &&
            answers.action === 'init') ||
          answers.action === 'set style library mapped drive'
        );
      }
    },
    {
      type: 'list',
      name: 'bootstrapVersion',
      filter: val => {
        defaultConfig.bootstrapVersion = val;
        return val;
      },
      message: 'Which bootstrap version do you want to use?',
      default: () => {
        return defaultConfig.bootstrapVersion || 'v3';
      },
      choices: ['v3', 'v4'],
      when: answers => {
        return answers.action === 'init' || answers.action === 'set bootstrap version';
      }
    }
  ];
  let action = null;
  return generator
    .prompt(prompts)
    .then(answers => {
      action = answers.action;
      if (answers.action === 'disable npm install --save-dev') {
        defaultConfig.disableNpmDevInstall = true;
      } else if (answers.action === 'enable npm install --save-dev') {
        defaultConfig.disableNpmDevInstall = false;
      } else if (answers.action === 'disable npm install --save') {
        defaultConfig.disableNpmInstall = true;
      } else if (answers.action === 'enable npm install --save') {
        defaultConfig.disableNpmInstall = false;
      }
      generator.config.set(defaultConfig);
      generator.config.save();
    })
    .then(() => {
      if (action !== 'back' && action !== 'init') {
        return configureProject(generator, defaultConfig);
      }
    });
};
