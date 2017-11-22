const fs = require('fs');
module.exports = function configureComposedLook(generator,siteDefintion,config){
	var colorFiles = [];
	var fontFiles = []; 
	if (fs.existsSync(generator.destinationPath(config.resourcesDir))){
		var files = fs.readdirSync(generator.destinationPath(config.resourcesDir));
		colorFiles = files.filter((e)=>{
			return e.endsWith('.spcolor'); 
		});
		fontFiles = files.filter((e)=>{
			return e.endsWith('.spfont');
		});
	}
	const prompts = [{
		type:'list',
		name:'action',
		choices:()=>{
			return ['init','set name',
			'set color file','set font file',
			'set background file',
			'set version','back'];
		},
		message:'What do you want to do next?'
	},{
		type:'input',
		name:'name',
		validate(val){
			return val && val.trim() ?true:'Please provide a valid name'; 
		},
		filter:(val)=>{
			siteDefintion.composedLook = siteDefintion.composedLook || {}; 
			siteDefintion.composedLook.name = val.trim();
			return val; 
		},
		message:'What is the composed look name?', 
		default:()=>{
			return siteDefintion.composedLook && siteDefintion.composedLook.name;  
		},
		when(answers){
			return answers.action === 'init' ||
				answers.action === 'set name'; 
		}

	},{
		type:'list',
		name:'colorFile',
		choices:()=>{
			return colorFiles;
		},
		filter:(val)=>{
			siteDefintion.composedLook = siteDefintion.composedLook || {}; 
			siteDefintion.composedLook.colorFile = val;
			return val; 
		},
		message:'Which file is the composed look color file?', 
		default:()=>{
			return siteDefintion.composedLook && siteDefintion.composedLook.fontColor;  
		},
		when(answers){
			return answers.action === 'init' ||
				answers.action === 'set color file'; 
		}
	},{
		type:'list',
		name:'fontFile',
		choices:()=>{
			return fontFiles;
		},
		filter:(val)=>{
			siteDefintion.composedLook = siteDefintion.composedLook || {}; 
			siteDefintion.composedLook.fontFile = val;
			return val; 
		},
		message:'Which file is the composed look font file?', 
		default:()=>{
			return siteDefintion.composedLook && siteDefintion.composedLook.fontFile;  
		},
		when(answers){
			return answers.action === 'init' ||
				answers.action === 'set font file'; 
		}
	},{
		type:'input',
		name:'backgroundFile',
		default:()=>{
			return siteDefintion.composedLook && siteDefintion.composedLook.backgroundFile; 
		},
		filter:(val)=>{
			siteDefintion.composedLook = siteDefintion.composedLook || {}; 
			siteDefintion.composedLook.backgroundFile = val;
			return val; 
		},
		message:'What is the background file name?', 
		default:()=>{
			return siteDefintion.composedLook && siteDefintion.composedLook.backgroundFile;  
		},
		when(answers){
			return answers.action === 'init' ||
				answers.action === 'set background file'; 
		}
	},{
		type:'input',
		name:'version',
		default:()=>{
			return siteDefintion.composedLook && siteDefintion.composedLook.version || '1.0.0'; 
		},
		validate:(val)=>{
			return val && val.trim()?true:'Please provide a valid version';
		},
		filter:(val)=>{
			siteDefintion.composedLook = siteDefintion.composedLook || {}; 
			siteDefintion.composedLook.version = val.trim();
			return val; 
		},
		message:'What is the version of thie composed look?', 
		default:()=>{
			return siteDefintion.composedLook && siteDefintion.composedLook.version;  
		},
		when(answers){
			return answers.action === 'init' ||
				answers.action === 'set version'; 
		}
	}]; 

	return generator.prompt(prompts)
		.then((answers)=>{
			if (answers.action !== 'back'){
				return configureComposedLook(generator,siteDefintion,config); 
			}
		});
}