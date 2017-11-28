const fs = require('fs'); 
const path = require('path'); 
module.exports = function addMasterPage(generator, siteDefinition, config, mp) {
    const isEdit = mp ? true : false;
    let masterPage = mp || {};
    const prompts = [{
        type: 'list',
        name: 'action',
        message: 'What would you like to do next?',
        choices() {
            return [
                'set title',
                'set description',
                'set force overwrite when deployed',
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
        message: 'What is the title of the page layout?',
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
            masterPage.src = val.trim();
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
        message: 'What is the description of the page layout?',
        when(answers) {
            return !isEdit || answers.action === 'set description';
        },
        default(answers) {
            return masterPage.description;
        }
    }, {
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
                    generator.destinationPath(config.masterPageTemplatesDir, masterPage.src), {});
            }
        })
        .then(() => {
            if (action !== 'back') {
                return addMasterPage(generator, siteDefinition, config, masterPage);
            }
        });
};