const { createTransformer } = require('sharepoint-util/lib/provisioning/provisioning');
module.exports = function(generator,siteDefinition,config){
    var cfg = Object.assign({},config); 
    const prompts = [{
        type:'input', 
        name:'spHost', 
        default:()=>{
            return config.spHost; 
        },
        filter:(val)=>{
            cfg.spHost = val;
            return val;  
        },
        validate:(val)=>{
            return val && val.trim()?true:false; 
        },
        message:'Please enter the SharePoint host (spHost) e.g https://contoso.sharepoint.com/'
    },{
        type:'confirm',
        name:'updateConfig', 
        default:false, 
        message:'Do you want to update your config with the spHost', 
        when:(answers)=>{
            return answers.spHost !== config.spHost; 
        },
    },{
        type:'input', 
        name:'siteUrl', 
        default:()=>{
            return config.url || siteDefinition.url; 
        },
        validate:(val)=>{
            return val && val.trim()?true:false; 
        },
        message:'Please provide the site path i.e. my-site',
        filter:(val)=>{
            cfg.url = val; 
            cfg.siteCollectionUrl = cfg.spHost.endsWith('/')?
                (`${cfg.spHost}sites/${cfg.url.startsWith('/')?cfg.url.substr(1):cfg.url}`):
                (`${cfg.spHost}/sites/${cfg.url.startsWith('/')?cfg.url.substr(1):cfg.url}`); 
            return val; 
        }
    },{
        type:'confirm',
        name:'updateSiteUrl', 
        default:()=>{
            var u = config.url || siteDefinition.url; 
            return (u !== cfg.url); 
        },
        message:'Do you want to update the site url in your site definition and config?',
    }];
    return generator.prompt(prompts)
    .then((answers)=>{
        if (answers.updateConfig){
            config.spHost = cfg.spHost; 
        }
        if (answers.updateSiteUrl){
            config.url = cfg.url; 
            siteDefinition.url = cfg.url; 
        }
        var transformer = createTransformer(cfg,siteDefinition);
        return transformer.transform(config,siteDefinition)
    }); 
}