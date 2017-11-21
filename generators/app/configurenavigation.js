const _ = require('lodash');
module.exports = function configureNavigation(generator,siteDefinition){
    var navAction = 'back';
    var action = null; 
    return generator.prompt([
        {
            type:'list',
            name:'action',
            message:'What would you like to do?',
            filter:(val)=>{
                navAction = val;
                return val; 
            },
            choices:[
                'configure global navigation',
                'configure current navigation',
                'back'
            ],
        },
        {
            type:'list', 
            name:'navType',
            message:'What is the type of navigation?',
            choices:()=>{
                var termSets = _(siteDefinition.termGroups||[]).map(e=>e.termSets).flatten().filter(e=>e).value(); 
                if (termSets.length > 0){
                    return ['Managed','Structural']; 
                }else {
                    return ['Structural']; 
                }
            },
            filter:(val)=>{
                siteDefinition.navigation = siteDefinition.navigation || {};
                if (navAction === 'configure global navigation'){
                    siteDefinition.navigation.global = siteDefinition.navigation.global || {};
                    siteDefinition.navigation.global.navType = val;   
                }else if (navAction === 'configure current navigation'){
                    siteDefinition.navigation.current = siteDefinition.navigation.current || {};
                    siteDefinition.navigation.current.navType = val;   
                }
                return val; 
            },
            when:(answers)=>{
                return answers.action === 'configure global navigation' ||
                    answers.action === 'configure current navigation'; 
            },
            default:'Structural'
        },
        {
            type:'list',
            name:'termSetId', 
            message:'Which term set do you want to use for this navigation?', 
            choices:(answers)=>{
                var termGroups = siteDefinition.termGroups || [];
                if (termGroups.length){
                    return _(termGroups).map((e)=>e.termSets)
                        .flatten()
                        .map(e=>{
                            return {
                                name:e.name,
                                value:e.id
                            };  
                        })
                        .value();
                } 
            },
            filter:(val)=>{
                var termSetId = val;
                if (navAction === 'configure global navigation') {
                    siteDefinition.navigation.global = siteDefinition.navigation.global || {};
                    siteDefinition.navigation.global.termSetId = termSetId;
                } else if (navAction === 'configure current navigation') {
                    siteDefinition.navigation.current = siteDefinition.navigation.current || {};
                    siteDefinition.navigation.current.termSetId = termSetId;
                }
                return val;
            },
            when:(answers)=>{
                return answers.navType === 'Managed';
            }
        }
    ])
    .then((answers)=>{
        if (navAction !== 'back'){
            return configureNavigation(generator,siteDefinition); 
        }
    });
}