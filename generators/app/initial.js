const generateDeploymentScripts = require('./deploy');
const addField = require('./addfield');
const addContentType = require('./addcontenttype');
const addList = require('./addlist');
const fs = require('fs'); 
const path = require('path'); 
const configureSiteDefinition = require('./configuresitedefinition');
const configureProject = require('./configureproject');
const configurePrototypes = require('./configureprototypes');
const configureComposedLook = require('./configurecomposedlook');
const configureSource = require('./configuresource');
const cleanSiteDefinition = require('./cleansitedefinition');
const configureGulp = require('./configuregulp'); 
const configureLibraries = require('./configurelibraries'); 
function loadSiteDefinition(generator){
    var siteDefinitionExists = fs.existsSync(generator.destinationPath('SiteDefinition.json'));
    if (generator.config.get('useSharePoint') || siteDefinitionExists) {
        if (siteDefinitionExists) {
            siteDefinition = generator.siteDefinition = require(generator.destinationPath('SiteDefinition.json'));
        } else {
            siteDefinition = generator.siteDefinition = require('sharepoint-util/templates/SiteDefinition');
        }
    }
    
    generator.siteDefinition = generator.siteDefinition || {};
    generator.siteDefinition.fields = generator.siteDefinition.fields || [];
    generator.siteDefinition.contentTypes = generator.siteDefinition.contentTypes || [];
    generator.siteDefinition.lists = generator.siteDefinition.lists || [];
    generator.siteDefinition.termGroups = generator.siteDefinition.termGroups || [];
    return generator.siteDefinition; 
}
let gulp = null; 
module.exports = function initial(generator,config){
    let siteDefinition = generator.siteDefinition || null; 
    if (fs.existsSync(path.resolve(generator.destinationPath('gulpfile.js')))) {
        try{
            gulp = require(path.resolve(generator.destinationPath('gulpfile.js')));
        }catch(err){
            console.log(`Could not load gulpfile.js: ${err.message}`);
            gulp = null;
        }
    }
    const prompts = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            default: 'configure',
            choices(){
                var c = [
                    'configure',
                    'generate deployment scripts',
                    'configure cdn libraries',
                    'configure SiteDefinition',
                    'configure source',
                    'configure prototypes',
                    'nothing'
                ];
                if (gulp){
                    c.unshift('run gulp tasks');
                }

                return c; 
            }
        }
    ];
    let action = null;
    return generator.prompt(prompts)
        .then(props => {
            action = props.action;
            if (props.action === 'generate deployment scripts') {
                if (!siteDefinition){
                    siteDefinition = loadSiteDefinition(generator); 
                }
                return generateDeploymentScripts(generator, siteDefinition, config);
            } else if (props.action === 'configure') {
                return configureProject(generator,config);
            } else if (props.action === 'configure cdn libraries') {
                return configureLibraries(generator,config);
            } else if (props.action === 'configure SiteDefinition') {
                if (!siteDefinition) {
                    siteDefinition = loadSiteDefinition(generator);
                }
                return configureSiteDefinition(generator,siteDefinition,config);
            } else if (props.action === 'configure prototypes') {
                return configurePrototypes(generator, config);
            } else if (props.action === 'configure source') {
                return configureSource(generator, config);
            } else if (props.action === 'run gulp tasks'){
                return configureGulp(generator,config,gulp); 
            }
        })
        .then(() => {
            if (action !== 'nothing') {
                return initial(generator,config,siteDefinition);
            }
        });
}