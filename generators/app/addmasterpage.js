const fs = require('fs'); 
const path = require('path'); 
module.exports = function addMasterPage(generator, siteDefinition, config, mp) {
    const isEdit = mp ? true : false;
    let masterPage = mp || {
        isMasterPage:true,
    };
    const prompts = [{
        type: 'list',
        name: 'action',
        message: 'What would you like to do next?',
        choices() {
            return [
                'set title',
                'set description',
                'set force overwrite when deployed',
                'set field',
                'back'
            ];
        },
        when() {
            return isEdit;
        }
    }, {
        type: 'input',
        name: 'title',
        filter(val) {
            masterPage.title = val.trim();
            return val;
        },
        message: 'What is the title of the master page?',
        when(answers) {
            return !isEdit || answers.action === 'set title';
        },
        valiate(val) {
            return val && val.trim() ? true : 'Please provide a valid title';
        },
        default(answers) {
            return masterPage.title;
        }
    }, {
        type: 'input',
        name: 'src',
        message: 'What is the file name?',
        filter(val) {
            let fileName = val.trim();
            fileName = fileName.endsWith('.njk') ? fileName : fileName + '.njk';
            masterPage.template = fileName;
            masterPage.src = path.basename(fileName, path.extname('.njk')) + '.master'; 
            return val;
        },
        validate(val) {
            return val && val.trim() ? true : 'Please provide a valid file name';
        },
        default(answers) {
            return masterPage.src || masterPage.title.replace(/[\s]+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '.njk';
        },
        when(answers) {
            return !isEdit;
        }
    }, {
        type: 'input',
        name: 'description',
        filter(val) {
            masterPage.description = val;
            return val;
        },
        message: 'What is the description of the master page?',
        when(answers) {
            return !isEdit || answers.action === 'set description';
        },
        default(answers) {
            return masterPage.description;
        }
    }, {
        type:'list', 
        name:'field',
        message:'Which field do you want to set?',
        choices:()=>{
            let keys = Object.keys(masterPage.fields||{}); 
            return ['add new field',...keys]; 
        },
        default:'add new field', 
        when(answers){
            return answers.action === 'set field'; 
        }
    },{
        type:'input', 
        name:'fieldName', 
        message:'What is the name of the field?', 
        when(answers){
            return answers.field === 'add new field' && answers.action === 'set field'; 
        },
        validate(val){
            return val.trim()?true:'Please provide a valid name'; 
        },
        filter(val){
            return fieldName = val.trim(); 
        }
    },{
        type:'input', 
        name:'fieldValue', 
        message:(answers)=>{
            return `What is the value of ${answers.fieldName}?`; 
        },
        when(answers){
            return answers.action === 'set field'; 
        },
        validate(val){
            return val && val.trim()?true:'Please provide a valid value';
        },
        filter(val){
            masterPage.fields = masterPage.fields || {}; 
            masterPage.fields[fieldName] = val.trim(); 
        }
    },{
        type: 'confirm',
        name: 'overwrite',
        message: 'Do you want to force overwriting this file when you deploy?',
        when(answers) {
            return !isEdit || answers.action === 'set force overwrite when deployed';
        },
        default() {
            return masterPage.overwrite;
        },
        filter(val) {
            masterPage.overwrite = val;
            return val;
        }
    }];

    let action = null;

    return generator.prompt(prompts)
        .then((answers) => {
            action = answers.action;
            if (!isEdit) {
                siteDefinition.masterPageDefinitions = siteDefinition.masterPageDefinitions || [];
                siteDefinition.masterPageDefinitions.push(masterPage);
                generator.fs.copy(path.resolve(__dirname, `../../node_modules/sharepoint-util/templates/masterpagemacros.${config.sharePointVersion || 'online'}.njk`),
                    generator.destinationPath(config.templatesDir, `masterpagemacros.${config.sharePointVersion || 'online'}.njk`), {});
                generator.fs.copy(path.resolve(__dirname, `../../node_modules/sharepoint-util/templates/masterpage.${config.sharePointVersion || 'online'}.njk`),
                    generator.destinationPath(config.masterPageTemplatesDir, masterPage.template), {});
            }
        })
        .then(() => {
            if (action !== 'back') {
                return addMasterPage(generator, siteDefinition, config, masterPage);
            }
        });
};