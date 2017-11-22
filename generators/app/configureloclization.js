const {LocaleList,LanguagesWithStringLcids} = require('sharepoint-util/lib/sharepoint/builtin');
const fs = require('fs'); 
const _ = require('lodash');
function addLocalization(generator,siteDefinition,l){
	var isEdit = l?true:false; 
	var loc = l || {}; 
	const prompts = [{
		type:'list',
		name:'action',
		choices:()=>{
			var c = ['set name','set resource file','set locale id','back'];
			return c; 
		},
		when:()=>{
			return isEdit; 
		},
		message:'What Would yo like to do next?', 
	},{
		type:'input',
		name:'name',
		message:'What is the name of the locale file?',
		when:(answers)=>{
			return !isEdit || answers.action === 'set name'; 
		},
		default:()=>{
			return loc.name; 
		},
		filter:(val)=>{
			loc.name = val.trim(); 
			return val;
		},
	},{
		type:'list',
		name:'lcid', 
		when:(answers)=>{
			return !isEdit || answers.action === 'set locale id'; 
		},
		message:'What is the locale of this resource file?',
		choices:()=>{
			return LanguagesWithStringLcids.map((e)=>{
				return {
					name:e.language, 
					value:e.lcid
				};
			});
		},
		filter:(val)=>{
			loc.lcid = +val; 
			return val; 
		},
		default:()=>{
			return loc.lcid; 
		}
	},{
		type:'input', 
		name:'resourceFile', 
		message:'What is the name of the resource file?', 
		filter:(val)=>{
			loc.resourceFile = val.trim(); 
			return val; 
		},
		validate:(val)=>{
			return val && val.trim();
		},
		when:(answers)=>{
			return !isEdit || answers.action === 'set resource file'; 
		},
		default:()=>{
			if (loc.resourceFile){
				return loc.resouceFile; 
			}
			if (loc.lcid){
				const vv = LanguagesWithStringLcids.find((e)=>{
					return e.lcid === +loc.lcid; 
				});
				return `resources-${loc.name}.${vv.lcidString}.resx`;
			}
			return loc.resourceFile || `resources-${loc.name}.en-us.resx`; 
		}
	}];
	return generator.prompt(prompts)
		.then((answers)=>{
			if (!isEdit){
				siteDefinition.localizations = siteDefinition.localizations || [];
				siteDefinition.localizations.push(loc);
			}
			if (answers.action !== 'back'){
				return addLocalization(generator,siteDefinition,loc); 
			}
		});
}
module.exports = function configureLocalization(generator,siteDefinition){
	var resources = []; 
	const prompts = [{
		type:'list', 
		name:'action',
		choices:()=>{
			var c= ['add localization'];
			if (fs.existsSync(generator.destinationPath('./resources'))){
				try{
					resources = fs.readdirSync(generator.destinationPath('./resources'));
					resources = resources.filter((e)=>e.endsWith('.resx')); 
					if (resources.length){
						c.unshift('refresh resources from folder'); 
					} 
				}catch(err){

				}
			}
			if (siteDefinition.localizations && siteDefinition.localizations){
				c.push('edit localization','remove localization');
			}
			c.push('back'); 
			return c; 
		},
		message:'What would you like to do next?' 
	},{
		type:'checkbox',
		name:'fileList', 
		message:'Which files do you want to include?', 
		choices:()=>{
			var locales = _.keyBy(siteDefinition.localizations,(e)=>e.resourceFile); 
			return resources.map((e)=>{
				return {
					name:e,
					value:e,
					checked:locales[e]
				};
			}); 
		},
		when:(answers)=>{
			return answers.action === 'refresh resources from folder';
		}, 
		filter:(val)=>{
			siteDefinition.localizations = siteDefinition.localizations || []; 
			var langs = _.keyBy(LanguagesWithStringLcids,(e)=>{
				return e.lcidString; 
			});
			var items = []; 
			val.forEach((e)=>{
				var item = {};
				var name = e.match(/resources-([\S]+?)\.([\S]+)\.resx/);
				if (name){
					item.name = name[0]; 
					item.resourceFile = e; 
					item.lcid = langs[name[1]] || 1033; 
				}else {
					item.resourceFile = e;
					item.lcid = 1033; 
					item.name = e; 
				}
				siteDefinition.localizations.push(item); 
			});

			return val;
		}
	},{
		type:'list', 
		name:'locList', 
		choices:()=>{
			return siteDefinition.localizations.map((e)=>{
				return {
					name:e.name, 
					value:e.lcid
				};
			});
		},
		when:(answers)=>{
			return answers.action === 'edit localization' ||
				answers.action === 'remove localization'; 
		},
		message:(answers)=>{
			if (answers.action === 'edit localization'){
				return 'Which localization do you want to edit?'; 
			}else if (answers.action === 'remove localization'){
				return 'Which localization do you want to remove?'; 
			}
		}
	}]; 
	var action = null; 
	return generator.prompt(prompts)
		.then((answers)=>{
			action = answers.action; 
			if (answers.action === 'edit localization'){
				const ltemp = siteDefinition.localizations.find((e)=>e.lcid == answers.locList); 
				return addLocalization(generator,siteDefinition,ltemp); 
			}else if (answers.action === 'remove localization'){
				siteDefinition.localizations = siteDefinition.localizations.filter((e)=>e.lcid == answers.locList); 
			}
		})
		.then(()=>{
			if (action !== 'back'){
				return configureLocalization(generator,siteDefinition); 
			}
		});
}