module.exports = function configureCommands(generator,siteDefinition){
	const prompts = [
	{
		type:'list',
		name:'action', 
		message:'What would you like to do next?', 
		list:()=>{
			var c = [
				'add pre-connect command', 
			];
			if (siteDefinition.preConnectCommands && siteDefinition.preConnectCommands.length){
				c.push('view pre-connect commands','edit pre-connect command','remove pre-connect command');
			}
			c.push('add post-connect command'); 
			if (siteDefinition.postConnectCommands && siteDefinition.postConnectCommands.length){
				c.push('view post-connect commands','edit post-connect command','remove post-connect command');
			}
			c.push('back'); 
			return c; 
		}
	},{
		type:'input', 
		name:'selectCmd', 
		message(answers){
			return (answers.action.indexOf('pre-connect') !== -1?
			'Here are your pre-connect commands':
			'Here are your post-connect commands');
		},
		when(answers){
			return answers.action === 'view pre-connect commands' ||
				answers.action === 'edit pre-connect command' ||
				answers.action === 'remove pre-connect command' ||
				answers.action === 'view post-connect commands' ||
				answers.action === 'edit post-connect command' ||
				answers.action === 'remove post-connect command'; 
		},
		choices(answers){
			if (answers.action.indexOf('pre-connect') !== -1){
				return siteDefinition.preConnectCommands.map((e,i)=>{
					return {
						name:e.type || e.fn, 
						value:i
					};
				});
			}else {
				return siteDefinition.postConnectCommands.map((e,i)=>{
					return {
						name:e.type || e.fn, 
						value:i
					};
				}); 
			}
		}
	},{
		type:'input', 
		name:'cmd',
		message:'What is the command you want to add?', 
		when(answers){
			return answers.action === 'add pre-connect command' ||
				answers.action === 'add post-connect command' ||
				answers.action === 'edit pre-connect command' ||
				answers.action === 'edit post-connect command'; 
		},
		validate(val){
			return val && val.trim()?true:'Please enter a valid command';
		},
		default(answers){
			if (answers.action === 'edit pre-connect command'){
				return siteDefinition.preConnectCommands[answers.selectCmd].fn;
			}else if(answers.action === 'edit post-connect command'){
				return siteDefinition.postConnectCommands[answers.selectCmd].fn; 
			}
		}
	}]; 
	let action = null; 
	return generator.prompt(prompts)
		.then((answers)=>{
			action = answers.action; 
			if (action === 'add pre-connect command'){
				siteDefinition.preConnectCommands.push({
					fn:answers.cmd
				});
			}else if (action === 'add post-connect command'){
				siteDefinition.postConnectCommands.push({
					fn:answers.cmd
				});
			}else if (action === 'remove pre-connect command'){
				siteDefinition.preConnectCommands.splice(answers.selectCmd,1); 
			}else if (action === 'remove post-connect command'){
				siteDefinition.postConnectCommands.splice(answers.selectCmd,1); 
			}else if (action ==='edit pre-connect command'){
				siteDefinition.preConnectCommands[answers.selectCmd].fn = answers.cmd; 
			} else if (action === 'edit post-connect command') {
				siteDefinition.postConnectCommands[answers.selectCmd].fn = answers.cmd;
			}
		})
		.then(()=>{
			if (action !== 'back'){
				return configureCommands(generator,siteDefinition); 
			}
		});
}