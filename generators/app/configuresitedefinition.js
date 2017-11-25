const addField= require('./addfield'); 
const addContentType =require('./addcontenttype');
const addList = require('./addlist'); 
const _ = require('lodash');
const fs = require('fs');
const cleanSiteDefinition = require('./cleansitedefinition');
const configureTermStore = require('./configuretermstore');
const configureSecutiry = require('./configuresecurity');
const configureApps = require('./configureapps'); 
const configureFeatures = require('./configurefeatures');
const configureNavigation = require('./configurenavigation');
const configureCommands = require('./configurecommands'); 
const configureLocalizations = require('./configureloclization'); 
const configureComposedLook = require('./configurecomposedlook');
const configureFontPalette = require('./configurefontpalette');
const configureColorPalette = require('./configurecolorpalette');

function getDocumentContentTypes(contentType,cTypes,doneTypes,output){
  if (doneTypes[contentType.name]){
    return false;
  }else if (cTypes[contentType.parent]){
    if (getDocumentContentTypes(cTypes[contentType.parent],cTypes,output)){
      if (!doneTypes[contentType.name]){
        output.push(contentType);
        doneTypes[contentType.name] = true; 
      }
      return true; 
    }
  } else if (contentType.parent === 'Document') {
    if (!doneTypes[contentType.name]){
      output.push(contentType);
      doneTypes[contentType.name] = true; 
    }
    return true;
  } 
  return false;
}

function getDocTypes(contentTypes){
  var output = [];
  var cTypes = _.keyBy(contentTypes,'name');
  var doneTypes = {}; 
  contentTypes.forEach((e)=>{
    getDocumentContentTypes(e,cTypes,doneTypes,output); 
  })
  return output; 
}
module.exports = function configureSiteDefinition(generator,siteDefinition,config){
    const prompts = [{
      type:'list',
      name:'action',
      message:'What do you want to do?',
      choices:()=>{
        var c = [
        'validate',
        'configure term store', 
        'configure security',
        'configure features',
        'configure navigation',
        'configure localizations',
        'configure composed look',
        'configure font palette',
        'configure color palette',
        'set home page',
        'set default page layout', 
        // 'configure commands', 
        'enable using site collection term group',
        'disable using site collection term group'];
          if (fs.existsSync(generator.destinationPath('./apps'))){
            c.push('refresh sharepoint apps list');
          }
          if (siteDefinition.apps && siteDefinition.apps.length){
            c.splice(5,0,'configure apps');
          }
          var ctypes = getDocTypes(siteDefinition.contentTypes||[]);
          if (ctypes.length > 0){
            c.push('set default pages library content type');
          }
          c.push('add a field');
          if (siteDefinition.fields && siteDefinition.fields.length){
            c.push('edit a field','remove a field');
          }
          c.push('add a content type')
          if (siteDefinition.contentTypes && siteDefinition.contentTypes.length){
            c.push('edit a content type','remove a content type');
          }
          c.push('add a list'); 
          if (siteDefinition.lists && siteDefinition.lists.length){
            c.push('edit a list','remove a list');
          }
          c.push('exit');
          return c; 
        }
    },{
      type:'list',
      name:'fieldName', 
      message:'Which field do you want to edit?', 
      choices:()=>{
        if (siteDefinition.fields.length === 0){
          return ['New']; 
        }
        return ['New',...siteDefinition.fields.map((e)=>e.name)]; 
      },
      when:(answers)=>{
        return answers.action === 'edit a field'; 
      }
    },{
      type:'list',
      name:'contentTypeName',
      message:'Which content type do you want to edit?',
      choices:()=>{
        if (siteDefinition.contentTypes.length === 0){
          return ['New']; 
        }
        return ['New',...siteDefinition.contentTypes.map((e)=>e.name)]; 
      },
      when:(answers)=>{
        return answers.action === 'edit a content type';
      }
    },{
      type:'list',
      name:'listTitle',
      message:'Which list do you want to edit?',
      choices:()=>{
        if (siteDefinition.lists.length === 0){
          return ['New']; 
        }
        return ['New',...siteDefinition.lists.map((e)=>e.title)]; 
      },
      when:(answers)=>{
        return answers.action === 'edit a list';
      }
    },{
      type:'list',
      name:'removeField', 
      message:'Which field do you want to remove?', 
      choices:()=>{
        return siteDefinition.fields.map(e=>e.name); 
      },
      filter:(val)=>{
        siteDefinition.fields = siteDefinition.fields.filter((e)=>{
          return e.name !== val; 
        });
        return val;
      },
      when:(answers)=>{
        return answers.action === 'remove a field'; 
      }
    },{
      type:'list',
      name:'removeContentType', 
      message:'Which content type do you want to remove?', 
      choices:()=>{
        return siteDefinition.contentTypes.map(e=>e.name); 
      },
      filter:(val)=>{
        siteDefinition.contentTypes = siteDefinition.contentTypes.filter((e)=>{
          return e.name === val; 
        });
      },
      when:(answers)=>{
        return answers.action === 'remove a content type'; 
      }
    },{
      type:'list',
      name:'defaultPagesLibraryContentType', 
      message:'Which content type do you want to use as the default for the pages library?',
      choices:()=>{
        return getDocTypes(siteDefinition.contentTypes||[]).map((e)=>{
          return e.name;
        });
      },
      when:(answers)=>{
        return answers.action === 'set default pages library content type';
      },
      filter:(val)=>{
        siteDefinition.defaultPagesContentType = val; 
        return val; 
      }
    },{
      type:'input', 
      name:'homePage', 
      message:'What is the URL for the homepage? i.e. Pages/Home.aspx',
      when:(answers)=>{
        return answers.action === 'set home page'; 
      },
      filter:(val)=>{
        siteDefinition.homePage = val.trim(); 
        return val; 
      },
      validate:(val)=>{
        return val && val.trim();
      },
      default:()=>{
        return siteDefinition.homePage; 
      }
    },{
      type:'input',
      name:'defaultPageLayout', 
      message:'What is the name of the page layout to set as default? i.e. Test/DefaultLayout.aspx (this internally translates to _catalog/masterpage/Test/DefaultLayout.aspx',
      when:(answers)=>{
        return answers.action === 'set default page layout'; 
      },
      filter:(val)=>{
        return siteDefinition.defaultPageLayout = val.trim(); 
      },
      validate:(val)=>{
        return val && val.trim();
      },
      default:()=>{
        return siteDefinition.defaultPageLayout;
      }
    },{
      type:'checkbox', 
      name:'appList', 
      message:'Here is a list of all the available apps', 
      filter:(val)=>{
        siteDefinition.apps = val.filter((e)=>e !== 'None').map((e)=>{
          return {
            name:e,
            path:generator.destinationPath(`./app/${e}`),
            force:false
          };
        });
        return val;
      },
      choices:(answers)=>{
        var apps = []; 
        try{
          apps = fs.readdirSync(generator.destinationPath('./apps'));
          apps = apps.filter((e)=>{
            return e.endsWith('.app'); 
          })
          .map((e)=>{
            return {
              name:e, 
              value:e
            };
          });
        }catch(err){
          apps = [{name:'None',value:'None'}]; 
        }
        return apps;
      },
      when:(answers)=>{
        return answers.action === 'refresh sharepoint apps list'; 
      }
    }];
    var action = null; 
    return generator.prompt(prompts).then((answers)=>{
      action = answers.action; 
      if (answers.action === 'validate') {
        return cleanSiteDefinition(generator,siteDefinition);
      } else if (answers.action === 'configure term store'){
        return configureTermStore(generator,siteDefinition);
      }else if (answers.action === 'add a field' ||
        (answers.action === 'edit a field' && answers.fieldName === 'New')) {
        return addField(generator,siteDefinition);
      } else if (answers.action === 'edit a field') {
        return addField(generator, siteDefinition, siteDefinition.fields.find((e) => e.name === answers.fieldName));
      } else if (answers.action === 'add a content type' || (
        answers.action === 'edit a content type' &&
        answers.contentTypeName === 'New')) {
        return addContentType(generator,siteDefinition);
      } else if (answers.action === 'edit a content type') {
        return addContentType(generator,siteDefinition,siteDefinition.contentTypes.find((e) => e.name === answers.contentTypeName));
      } else if (answers.action === 'add a list' || (
        answers.action === 'edit a list' && answers.listTitle === 'New')) {
        return addList(generator,siteDefinition);
      } else if (answers.action === 'edit a list') {
        return addList(generator,siteDefinition,siteDefinition.lists.find((e) => e.title === answers.listTitle));
      } else if (answers.action === 'configure security'){
        return configureSecutiry(generator,siteDefinition);
      }else if (answers.action === 'configure features'){
        return configureFeatures(generator,siteDefinition); 
      }else if (answers.action === 'configure navigation'){
        return configureNavigation(generator,siteDefinition); 
      }else if (answers.action === 'enable using site collection term group'){
        siteDefinition.setSiteCollectionTermGroupName = true; 
      }else if (answers.action === 'disable using site collection term group'){
        siteDefinition.setSiteCollectionTermGroupName = false; 
      }else if (answers.action === 'configure commands'){
        return configureCommands(generator,siteDefinition); 
      }else if (answers.action === 'configure apps'){
        return configureApps(generator,siteDefinition);
      }else if (answers.action === 'configure localizations'){
        return configureLocalizations(generator,siteDefinition); 
      }else if (answers.action === 'configure composed look'){
        return configureComposedLook(generator,siteDefinition,config);
      }else if (answers.action === 'configure color palette'){
        return configureColorPalette(generator,config,siteDefinition); 
      }else if (answers.action === 'configure font palette') {
        return configureFontPalette(generator,config,siteDefinition);
      }
    })
    .then(()=>{
      if (action !== 'exit'){
        return configureSiteDefinition(generator,siteDefinition);
      }
    });
}