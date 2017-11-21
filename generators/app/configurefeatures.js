const { FeaturesList} = require('sharepoint-util/lib/sharepoint/builtin'); 
module.exports = function configureFeatures(generator,siteDefinition){
    const prompts = [{
        type:'list',
        name:'action',
        message:'What would you like to do next?',
        choices:['enable web features',
            'disable web features',
            'enable site features',
            'disable site features',
            'back'],
    },{
        type:'checkbox',
        name:'enableFeatures',
        choices:(answers)=>{
            var ff = []; 
            if (answers.action === 'enable web features'){
                ff = (siteDefinition.features && siteDefinition.features.web && siteDefinition.features.web) || []; 
                ff = ff.map(e=>e.id); 
                return FeaturesList.filter(e=>e.scope === 'Web')
                    .map((e)=>{
                        e.checked = ff.indexOf(e.id) !== -1;
                        e.value = e.id;  
                        return e; 
                    });
            }else if (answers.action === 'enable site features'){
                ff = (siteDefinition.features && siteDefinition.features.site && siteDefinition.features.site) || [];
                ff = ff.map(e => e.id);

                return FeaturesList.filter(e=>e.scope === 'Site')
                .map((e)=>{
                    e.checked = ff.indexOf(e.id) !== -1; 
                    e.value = e.id;
                    return e; 
                }); 
            }
        },
        when:(answers)=>{
            return answers.action === 'enable web features' ||
                answers.action === 'enable site features'; 
        },
        message:'Which features do you want to enable?', 
    },{
        type:'list', 
        name: 'disableFeatures',
        choices: (answers) => {
            if (answers.action === 'disable web features') {
                return FeaturesList.filter(e => e.scope === 'Web'); 
            }else if (answers.action === 'disable site features'){
                return FeaturesList.filter(e => e.scope === 'Site');
            }
        },
        message:'Which features do you want to disable?',
        when: (answers) => {
            return answers.action === 'disable web features' ||
                answers.action === 'disable site features';
        },
    }];
    var action = null; 
    return generator.prompt(prompts)
        .then((answers)=>{
            action = answers.action; 
            siteDefinition.features || siteDefinition.features || {};
            siteDefinition.features.web = siteDefinition.features.web || [];
            siteDefinition.features.site = siteDefinition.features.site || [];
            if (answers.action === 'enable site features'){
                const enableFeatures = answers.enableFeatures; 
                siteDefinition.features.site = FeaturesList.filter(e => e.scope === 'Site' && enableFeatures.indexOf(e.id) !== -1)
                    .map(e=>{
                        return {
                            enable:true, 
                            name:e.name, 
                            id:e.id
                        };
                    });
            }else if (answers.action === 'enable web features') {
                const enableFeatures = answers.enableFeatures;
                siteDefinition.features.web = FeaturesList.filter(e => e.scope === 'Web' && enableFeatures.indexOf(e.id) !== -1)
                    .map(e => {
                        return {
                            enable: true,
                            name: e.name,
                            id: e.id
                        };
                    });
            }else if (answers.action === 'disable site features'){
                const disableFeatures = answers.disableFeatures;
                siteDefinition.features.site.features.map((e)=>{
                    var idx = disableFeatures.indexOf(e.id);
                    if (idx !== -1){
                        e.enable = false; 
                        disableFeatures.splice(idx,1); 
                    }
                    return e; 
                });
                siteDefinition.features.site = [...siteDefinition.features.site,FeaturesList.filter(e => e.scope === 'Site' && disableFeatures.indexOf(e.id) !== -1)
                    .map(e => {
                        return {
                            enable: false,
                            name: e.name,
                            id: e.id
                        };
                    })];
            } else if (answers.action === 'disable web features') {
                const disableFeatures = answers.disableFeatures;
                siteDefinition.features.web.features.map((e) => {
                    var idx = disableFeatures.indexOf(e.id);
                    if (idx !== -1) {
                        e.enable = false;
                        disableFeatures.splice(idx, 1);
                    }
                    return e;
                });
                siteDefinition.features.web = [...siteDefinition.features.web, FeaturesList.filter(e => e.scope === 'Web' && disableFeatures.indexOf(e.id) !== -1)
                    .map(e => {
                        return {
                            enable: false,
                            name: e.name,
                            id: e.id
                        };
                    })];
            }
        })
        .then((e)=>{
            if (action !== 'back'){
                return configureFeatures(generator,siteDefinition);
            }
        });
}