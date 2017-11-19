const _ = require('lodash');
module.exports = function(siteDefinition){
    var navAction = 'exit';
    return [
        {
            type:'list',
            name:'navAction',
            message:'What would you like to do?',
            filter:(val)=>{
                navAction = val;
                return val; 
            },
            choices:[
                'configure global navigation',
                'configure current navigation',
                'exit'
            ],
        },
        {
            type:'list', 
            name:'navType',
            message:'What is the type of navigation?',
            choices:[
                'Managed',
                'Structural'
            ],
            filter:(val)=>{
                siteDefinition.navigation = siteDefinition.navigation || {};
                if (navAction === 'configure global navigation'){
                    siteDefinition.navigation.global = siteDefinition.navigation.global || {};
                    siteDefinition.navigation.global.type = val;   
                }else if (navAction === 'configure current navigation'){
                    siteDefinition.navigation.current = siteDefinition.navigation.current || {};
                    siteDefinition.navigation.current.type = val;   
                }
                return val; 
            },
            default:'Managed'
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
                        .filter(e=>e)
                        .map(e=>`${e.name}:${e.id}`)
                        .value();
                }
                return ["None:"]; 
            },
            filter:(val)=>{
                var termSetId = val.split(':').pop(); 
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
    ]; 
}