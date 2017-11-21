const addField= require('./addfield'); 
const addContentType =require('./addcontenttype');
const addList = require('./addlist'); 
const _ = require('lodash');
const cleanSiteDefinition = require('./cleansitedefinition');
const configureTermStore = require('./configuretermstore');
const configureSecutiry = require('./configuresecurity');
const configureFeatures = require('./configurefeatures');
const configureNavigation = require('./configurenavigation');

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
module.exports = function configureSiteDefinition(generator,siteDefinition){
    const prompts = [{
      type:'list',
      name:'definitionAction',
      message:'What do you want to do?',
      choices:()=>{
        var c = [
        'validate',
        'configure term store', 
        'configure security',
        'configure features',
        'configure navigation'];
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
        return answers.definitionAction === 'edit a field'; 
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
        return answers.definitionAction === 'edit a content type';
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
        return answers.definitionAction === 'edit a list';
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
        return answers.definitionAction === 'remove a field'; 
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
        return answers.definitionAction === 'remove a content type'; 
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
        return answers.definitionAction === 'set default pages library content type';
      },
      filter:(val)=>{
        siteDefinition.defaultPagesContentType = val; 
        return val; 
      }
    }];
    var action = null; 
    return generator.prompt(prompts).then((answers)=>{
      action = answers.definitionAction; 
      if (answers.definitionAction === 'validate') {
        return cleanSiteDefinition(generator,siteDefinition);
      } else if (answers.definitionAction === 'configure term store'){
        return configureTermStore(generator,siteDefinition);
      }else if (answers.definitionAction === 'add a field' ||
        (answers.definitionAction === 'edit a field' && answers.fieldName === 'New')) {
        return addField(generator,siteDefinition);
      } else if (answers.definitionAction === 'edit a field') {
        return addField(generator, siteDefinition, siteDefinition.fields.find((e) => e.name === answers.fieldName));
      } else if (answers.definitionAction === 'add a content type' || (
        answers.definitionAction === 'edit a content type' &&
        answers.contentTypeName === 'New')) {
        return addContentType(generator,siteDefinition);
      } else if (answers.definitionAction === 'edit a content type') {
        return addContentType(generator,siteDefinition,siteDefinition.contentTypes.find((e) => e.name === answers.contentTypeName));
      } else if (answers.definitionAction === 'add a list' || (
        answers.definitionAction === 'edit a list' && answers.listTitle === 'New')) {
        return addList(generator,siteDefinition);
      } else if (answers.definitionAction === 'edit a list') {
        return addList(generator,siteDefinition,siteDefinition.lists.find((e) => e.title === answers.listTitle));
      } else if (answers.definitionAction === 'configure security'){
        return configureSecutiry(generator,siteDefinition);
      }else if (answers.definitionAction === 'configure features'){
        return configureFeatures(generator,siteDefinition); 
      }else if (answers.definitionAction === 'configure navigation'){
        return configureNavigation(generator,siteDefinition); 
      }
    })
    .then(()=>{
      if (action !== 'exit'){
        return configureSiteDefinition(generator,siteDefinition);
      }
    });
}