module.exports = function configureProject(generator,defaultConfig){
    const prompts = [{
      type: 'input',
      name: 'name',
      message: 'What is the project name, this should be lower case and no spaces?',
      default: defaultConfig.name,
    },{
      type:'input', 
      name:'version', 
      message:'What is the version number of the project?', 
      default:defaultConfig.version
    },{
      type:'confirm',
      name:'useDefaultFolders',
      message:'Would you like to use default folders/directories configurations?',
      default:true,
    },{
      type:'input', 
      name:'assetsDir', 
      message:'What is the path to the assets directory?',
      default:defaultConfig.assetsDir,
      when(answers){
        return !answers.useDefaultFolders;
      }
    },{
      type:'input', 
      name:'libDir', 
      message:'What is the path to the library (vendor) directory?', 
      default:'./lib',
      when(answers){
        return !answers.useDefaultFolders;
      }
    },{
        type:'input',
        name:'srcDir', 
        message:'What is the path to the source directory?', 
        default:'./src',
        when(answers){
          return !answers.useDefaultFolders;
        }
    },{
        type:'input', 
        name:'sassDir', 
        message:'What is the path to the sass source directory?', 
        default:'./sass',
        when(answers){
          return !answers.useDefaultFolders;
        }
    },{
        type:'input', 
        name:'distDir', 
        message:'What is the path to the distribution directory (to host the compiled files)?',
        default:'./dist',
        when(answers){
          return !answers.useDefaultFolders;
        }
    },{
        type:'input',
        name:'distCssDir',
        message:'What is the path to the CSS distribution directory?',
        default:'./dist/css',
        when(answers){
          return !answers.useDefaultFolders;
        }
    },{
        type:'input', 
        name:'distJsDir', 
        message:'What is the path to the JS distribution directory?', 
        default:'./dist/js',
        when(answers){
          return !answers.useDefaultFolders;
        }
    },{
        type:'confirm',
        name:'useSharePoint',
        message:'Are you using SharePoint?',
        default: true,
        when(answers){
          return answers.whatAction === 'configure';
        }
      },{
        type:'list',
        name:'sharePointVersion',
        message:'What version of SharePoint are you using?', 
        default:'online', 
        choices:['online','2013','2016'],
        when:(answers)=>{
          return answers.userSharePoint; 
        }
    },{
        type:'confirm',
        name:'useSpDefaultDirectories',
        default:true, 
        message:'Do you want to use the default directory configurations for SharePoint?',
        when:(answers)=>{
          return answers.usersSharePoint; 
        }
    },{
        type:'input',
        name:'provisioningDir', 
        message:'What is the path to the provisioning directory?', 
        default:'./deploy',
        when:(answers)=>{
          return answers.userSharePoint && !answers.useSpDefaultDirectories; 
        }
    },{
        type:'input',
        name:'deploymentDir', 
        message:'What is the assets deployment directory (i.e. the top level folder in Site Assets)?', 
        default:'Sysdoc',
        when:(answers)=>{
          return answers.userSharePoint && !answers.useSpDefaultDirectories; 
        }
    },{
        type:'input', 
        name:'templatesDir', 
        message:'What is the path to the Nunjucks templates directory?', 
        default:'./templates',
        when:(answers)=>{
          return answers.whatAction === 'configure'; 
        }
    },{
        type:'input',
        name:'masterPageTemplatesDir', 
        message:'What is the path to the master page templates directory?',
        default:'./templates/masterpage',
        when:(answers)=>{
          return answers.userSharePoint && !answers.useSpDefaultDirectories; 
        }
    },{
        type:'input',
        name:'pageLayoutTemplatesDir', 
        message:'What is the path to the page layout templates directory?', 
        default:'./templates/pagelayout',
        when:(answers)=>{
          return answers.userSharePoint && !answers.useSpDefaultDirectories; 
        } 
    },{
        type:'confirm',
        name:'mappingDrives',
        message:'Have you mapped drives?',
        default:true, 
        when:(answers)=>{
          return answers.userSharePoint; 
        }
    },{
        type:'confirm',
        name:'useDefaultMappedDrives',
        message:'Do you want to use the default drives for SharePoint drives?',
        default:true, 
        when:(answers)=>{
          return answers.userSharePoint && answers.mappingDrives; 
        }
    },{
        type:'input',
        name:'masterpageCatalogDrive', 
        message:'What is the drive pointing to the master page library?',
        default:'T',
        when(answers){
          return answers.mappingDrives && answers.useSharePoint && answers.useDefaultMappedDrives;
        }
    },{
        type:'input',
        name:'siteAssetsDrive', 
        message:'What is the drive pointing to the Site Assets library?',
        default:'S',
        when(answers){
          return answers.mappingDrives && answers.useSharePoint && answers.useDefaultMappedDrives;
        }
    },{
        type:'input',
        name:'styleLibraryDrive', 
        message:'What is the drive pointing to the Style Library?',
        default:'R',
        when(answers){
          return answers.mappingDrives && answers.useSharePoint && answers.useDefaultMappedDrives;
        }
    }]; 

    return generator.prompt(prompts)
}