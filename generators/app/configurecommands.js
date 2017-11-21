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
			if (siteDefinition.postConnectCommand && siteDefinition.postConnectCommand.length){
				c.push('view post-connect commands','edit post-connect command','remove post-connect command');
			}

			c.push('back'); 
			return c; 
		}
	}]; 
}