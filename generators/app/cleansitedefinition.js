const { createTransformer } = require('sharepoint-util/lib/provisioning/provisioning');
const addField = require('./addfield');
const addContentType = require('./addcontenttype'); 
const addList = require('./addlist');
const _ = require('lodash');
module.exports = function(generator,siteDefinition){
    let transformer = createTransformer({});
    var result = transformer.validate(siteDefinition);
    if (result.cleanActions && result.cleanActions.length){
        return generator.prompt([{
            type:'checkbox',
            message:'Found the following errors, check the ones that you want to fix',
            name:'actions',
            choices:result.cleanActions 
        }])
        .then((answers)=>{
            
            let actionsByValue = _.keyBy(result.cleanActions,e=>e.value);
            let actions = answers.actions.map(e=>actionsByValue[e]); 
            return actions.reduce((prev,curr)=>{
                return prev.then(()=>{
                    if (curr && curr.fn){
                        var act = curr.fn(generator);
                        if (act && act.action){
                            switch(act.action){
                                case 'addField':
                                if (act.param){
                                    siteDefinition.fields.push(act.param); 
                                }
                                return addField(generator,siteDefinition,act.param); 
                                case 'addContentType':
                                if (act.param){
                                    siteDefinition.contentTypes.push(act.param); 
                                }
                                return addContentType(generator,siteDefinition,act.param); 
                                case 'addList':
                                if (act.param){
                                    siteDefinition.lists.push(act.param);
                                }
                                return addList(generator,siteDefinition,act.param);
                            }
                        }
                    }
                })
            },new Promise((r)=>r()));
        })
    }
}