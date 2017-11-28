const fs = require('fs'); 
const path = require('path'); 
const addMasterPage = require('./addmasterpage'); 
const addPageLayout = require('./addpagelayout'); 
module.exports = function configureFiles(generator, config, siteDefinition){
const prompts = [{
        type:'list',
        name:'action',
        message:'What would you like to do next?', 
        choices(){
            let c = ['add page layout'];
            if (siteDefinition.pageLayoutDefinitions && 
                siteDefinition.pageLayoutDefinitions.length){
                c.push('view page layout definitions','edit page layout','remove page layout'); 
            }
            c.push('add master page'); 
            if (siteDefinition.masterPageDefinitions &&
                siteDefinition.masterPageDefinitions.length){
                c.push('view master page definitions', 'edit master page','remove master page'); 
            }
            
            c.push('back'); 

            return c; 
        }
    },{
        type:'list',
        name:'selectedFile', 
        message(answers){
            return (answers.action.indexOf('page layout') === -1?
            'Here are your page layouts':
            'Here are your master pages'); 
        },
        when(answers){
            switch(answers.action){
                case 'view page layout definitions':
                case 'edit page layout':
                case'remove page layout':
                case 'view master page definitions':
                case 'edit master page':
                case 'remove master page':
                return true;
                default:
                return false; 
            }
        },
        choices(answers){
            return (answers.indexOf('page layout') === -1?
                siteDefinition.pageLayoutDefinitions.map(e=>e.title):
                siteDefinition.masterPageDefinitions.map(e=>e.title)); 
        }
    }]; 

    let action = null; 
    return generator.prompt(prompts)
        .then((answers)=>{
        action = answers.action; 
        switch(action){
            case 'add master page':
            return addMasterPage(generator,siteDefinition,config); 
            case 'add page layout':
            return addPageLayout(generator,siteDefinition,config); 
            case 'edit master page':
            const mp = siteDefinition.masterPageDefinitions.find((e)=>e.title === answers.selectedFile);
            return addMasterPage(generator,siteDefinition,config,mp); 
            case 'edit page layout':
            const pl = siteDefinition.pageLayoutDefinitions.find((e)=>e.title === answers.selectedFile); 
            return addPageLayout(generator,siteDefinition,config,pl); 
            case 'remove master page':
            siteDefinition.masterPageDefinitions = siteDefinition.masterPageDefinitions.filter((e)=>{
                return e.title !== answers.selectedFile; 
            });
            break;
            case 'remove page layout':
            siteDefinition.pageLayoutDefinitions = siteDefinition.pageLayoutDefinitions.filter((e) => {
                return e.title !== answers.selectedFile;
            });
            break;
        }
    })
    .then(()=>{
        if (action !== 'back'){
            return configureFiles(generator,config,siteDefinition); 
        }
    });
}