const addField= require('./addfield'); 
const addContentType =require('./addcontenttype');
const addList = require('./addlist'); 
const cleanSiteDefinition = require('./cleansitedefinition');
const configureTermStore = require('./configuretermstore');
module.exports = function configureSiteDefinition(generator,siteDefinition){
    const prompts = [{
      type:'list',
      name:'definitionAction',
      message:'What do you want to do?',
      choices:[
      'validate',
      'configure term store', 
      'add a field',
      'edit a field', 
      'remove a field', 
      'add a content type', 
      'edit a content type',
      'remove a content type', 
      'add a list', 
      'edit a list',
      'remove a list',
      'add a term group',
      'edit a term group',
      'remove a term group',
      'exit']
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
        return addField(generator, siteDefinition.fields.find((e) => e.name === answers.fieldName));
      } else if (answers.definitionAction === 'add a content type' || (
        answers.definitionAction === 'edit a content type' &&
        answers.contentTypeName === 'New')) {
        return addContentType(generator,siteDefinition);
      } else if (answers.definitionAction === 'edit a content type') {
        return addContentType(generator,siteDefinition.contentTypes.find((e) => e.name === answers.contentTypeName));
      } else if (answers.definitionAction === 'add a list' || (
        answers.definitionAction === 'edit a list' && answers.listTitle === 'New')) {
        return addList(generator,siteDefinition);
      } else if (answers.definitionAction === 'edit a list') {
        return addList(generator,siteDefinition.lists.find((e) => e.title === answers.listTitle));
      }
    })
    .then(()=>{
      if (action !== 'exit'){
        return configureSiteDefinition(generator,siteDefinition);
      }
    });
}