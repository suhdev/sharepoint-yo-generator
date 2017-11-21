module.exports = function configureApps(generator,siteDefinition){
	const prompts = [{
		type:'list',
		choices:()=>{
			var c = ['remove app','set force flag','view apps','back']; 
			return c; 
		},
		message:'What would you like to do next?',
		name:'action'
	},{
		type:"checkbox", 
		message:'Which of the apps do you want to ',
		name:'appsToForce',
		choices:()=>{
			return siteDefinition.apps.map((e)=>{
				return {
					name:e.name, 
					value:e.name, 
					checked:e.force
				};
			});
		},
		when:(answers)=>{
			return (answers.action === 'set force flag'); 
		},
		filter:(val)=>{
			siteDefinition.apps = siteDefinition.apps.map((e)=>{
				e.force = val.indexOf(e.name) !== -1; 
				return e; 
			});
			return val; 
		}
	},{
		type:'checkbox', 
		message:'Which app do you want to remove?',
		name:'appsToRemove',
		choices:()=>{
			return siteDefinition.apps.map((e)=>{
				return {
					name:e.name,
					value:e.name
				};
			}); 
		},
		filter:(val)=>{
			siteDefinition.apps = siteDefinition.apps.filter((e)=>{
				return val.indexOf(e) === -1; 
			})
			return val; 
		},
		when:(answers)=>{
			return answers.action === 'remove app'; 
		}
	},{
		type:'list', 
		message:'Here is a list of all apps:',
		name:'listOfApps',
		choices:()=>{
			return siteDefinition.apps.map((e)=>{
				return e.name;
			}); 
		},
		when:(answers)=>{
			return answers.action === 'view apps'; 
		}
	}]; 
	return generator.prompt(prompts)
		.then((answers)=>{
			if (answers.action !== 'back'){
				return configureApps(generator,siteDefinition);
			}
		})

}