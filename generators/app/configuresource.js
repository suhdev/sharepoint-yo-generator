const fs = require('fs'); 
const path = require('path');
const addPrototype = require('./addprototype');
module.exports = function configureSource(generator,config){
    const prompts = [{
        type:'list',
        name:'action', 
        message:'What would you like to do?',
        choices:()=>{
            var c = [
                'add component', 
                'add controller', 
                'add service'
            ]; 
            c.push('back'); 
            return c; 
        }
    },{
        type:'input', 
        name:'componentName',
        message:(answers)=>{
            if (answers.action === 'action component'){
                return 'What is the name of the component?';
            }else if (answers.action === 'add controller'){
                return 'What is the naem of the controller?'; 
            }else {
                return 'What is the name of the service?'; 
            }
        },
        validate(val){
            let okay = val && val.trim()?true:false;
            if (!okay){
                return 'Please provide a valid name';
            }
            let fsExists = fs.existsSync(path.resolve(generator.destinationPath(config.srcDir),'components',val+'.tsx'));
            return fsExists?'A component with the same name already exists. Please choose a different name':true;
        },
        when(answers){
            return answers.action !== 'back';
        }
    },{
        type:'confirm',
        name:'createPrototype', 
        message:(answers)=>{
            return answers.action === 'add controller'?'Do you want to create a prototype for this controller?':
                'Do you want to create a prototype for this component?';
        },
        when(answers){
            return answers.action === 'add controller' ||   
                answers.action === 'add component'; 
        },
        default:true, 
    }]; 
    let action = null; 
    return generator.prompt(prompts)
        .then((answers)=>{
            action = answers.action; 
            const componentName = answers.componentName;
            if (answers.action === 'add component'){
                generator.fs.copyTpl(
                    path.resolve(__dirname,'../../node_modules/sharepoint-util/templates/component.ts.ejs'),
                    path.resolve(generator.destinationPath(config.srcDir), 'components/',componentName+'.tsx'),
                    {
                        component:{
                            name: componentName
                        }
                    }
                );
                generator.fs.copyTpl(
                    path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/component.scss.ejs'),
                    path.resolve(generator.destinationPath(config.sassDir), 'components/', `_${componentName.toLowerCase()}.scss`),
                    {
                        component: {
                            name: componentName
                        }
                    }
                );
                generator.fs.append(
                    path.resolve(generator.destinationPath(config.sassDir), 'components/', `_components.scss`),
                    `@import "${componentName.toLowerCase().toLowerCase()}";`,
                    {
                        separator:'\n'
                    }
                );
                if (answers.createPrototype){
                    return addPrototype(generator,config,{
                        name:componentName,
                        type:'component', 
                    });
                }
            }else if (answers.action === 'add controller'){
                generator.fs.copyTpl(
                    path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/controller.ts.ejs'),
                    path.resolve(generator.destinationPath(config.srcDir), 'controllers', answers.componentName, 'index.tsx'),
                    {
                        controller: {
                            name: componentName,
                            isController: true
                        }
                    }
                );
                generator.fs.copyTpl(
                    path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/component.scss.ejs'),
                    path.resolve(generator.destinationPath(config.sassDir), 'controllers/', `_${componentName.toLowerCase()}.scss`),
                    {
                        component: {
                            name: componentName,
                            isController: true
                        }
                    }
                );
                if (!generator.fs.exists(path.resolve(generator.destinationPath(config.sassDir), 'controllers/', `_controllers.scss`))){
                    generator.fs.write(path.resolve(generator.destinationPath(config.sassDir), 'controllers/', `_controllers.scss`),'');
                }
                generator.fs.append(
                    path.resolve(generator.destinationPath(config.sassDir), 'controllers/', `_controllers.scss`),
                    `@import "${componentName.toLowerCase().toLowerCase()}";`,
                    {
                        separator: '\n'
                    }
                );
                generator.fs.copyTpl(
                    path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/actions.ts.ejs'),
                    path.resolve(generator.destinationPath(config.srcDir), 'controllers', answers.componentName, 'Actions.tsx'),
                    {
                        controller: {
                            name: componentName,
                            isController: true
                        }
                    }
                );
                generator.fs.copyTpl(
                    path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/stateandprops.ts.ejs'),
                    path.resolve(generator.destinationPath(config.srcDir), 'controllers', answers.componentName, 'StateAndProps.tsx'),
                    {
                        controller: {
                            name: componentName,
                            isController:true
                        }
                    }
                );
                generator.fs.copyTpl(
                    path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/reducer.ts.ejs'),
                    path.resolve(generator.destinationPath(config.srcDir), 'controllers', answers.componentName, 'Reducer.ts'),
                    {
                        controller: {
                            name: componentName,
                            isController: true
                        }
                    }
                );
                if (answers.createPrototype) {
                    return addPrototype(generator, config, {
                        name: componentName,
                        type: 'controller', 
                    });
                }
            }else if (action === 'add service'){
                generator.fs.copyTpl(
                    path.resolve(__dirname, '../../node_modules/sharepoint-util/templates/service.ts.ejs'),
                    path.resolve(generator.destinationPath(config.srcDir), 'services', answers.componentName+'.tsx'),
                    {
                        service: {
                            name: componentName
                        }
                    }
                );
            }
        })
        .then(()=>{
            if (action !== 'back'){
                return configureSource(generator,config); 
            }
        });
}