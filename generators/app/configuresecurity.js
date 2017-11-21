const addUserGroup = require('./addusergroup');
module.exports = function configureSecurity(generator,siteDefinition){
    const prompts = [{
        type:'list',
        message:'What would you like to do next?', 
        name:'action',
        choices:()=>{
            var c = [
                'add admin'];
            if (siteDefinition.security && siteDefinition.security.admins && siteDefinition.security.admins.length){
                c.push('view admins');
                c.push('remove admin'); 
            }
            c.push('add owner');
            if (siteDefinition.security && siteDefinition.security.owners && siteDefinition.security.owners.length){
                c.push('view owners');
                c.push('remove owner'); 
            }
            c.push('add member');
            if (siteDefinition.security && siteDefinition.security.members && siteDefinition.security.members.length) {
                c.push('view members');
                c.push('remove member');
            }
            c.push('add visitor');
            if (siteDefinition.security && siteDefinition.security.visitors && siteDefinition.security.visitors.length) {
                c.push('view visitors');
                c.push('remove visitor');
            }
            c.push('add user group');
            if (siteDefinition.security && siteDefinition.security.groups && siteDefinition.security.groups.length){
                c.push('view user groups');
                c.push('edit user group');
                c.push('remove user group'); 
            }
            c.push('back'); 
            return c; 
        }
    },{
        type:'input',
        name:'user', 
        when:(answers)=>{
            return /add (admin|owner|member|visitor)/.test(answers.action); 
        },
        message:(answers)=>{
            if (answers.action === 'add admin'){
                return 'What is the admin user email address?'
            }else if (answers.action === 'add owner'){
                return 'What is the owner user email address?'
            } else if (answers.action === 'add member') {
                return 'What is the member user email address?'
            } else if (answers.action === 'add visitor') {
                return 'What is the visitor user email address?'
            }
        },
        validate:(val)=>{
            return val && val.trim()?true:'Please provide a valid email address'; 
        },
        filter:(val)=>{
            return val; 
        }
    },{
        type:'list',
        name:'removeUser', 
        when:(answers)=>{
            return /remove (visitor|member|admin|owner)/.test(answers.action); 
        },
        choices:(answers)=>{
            if (answers.action === 'remove visitor'){
                return siteDefinition.security.visitors; 
            }else if (answers.action === 'remove owner'){
                return siteDefinition.security.owners; 
            }else if (answers.action === 'remove admin'){
                return siteDefinition.security.admins; 
            }else if (answers.action === 'remove member'){
                return siteDefinition.security.members; 
            }
        },
        message:'Which user do you want to remove?',
    },{
        type:'list',
        name:'group',
        message:(answers)=>{
            return answers.action === 'edit user group'?'Which list do you want to edit':'Which list do you want to remove?'; 
        },
        when:(answers)=>{
            return answers.action === 'edit user group' ||
                answers.action === 'remove user group';
        },
        choices:()=>{
            return siteDefinition.security.groups.map(e=>e.title); 
        }
    },{
        type:'list',
        name:'viewLists', 
        when:(answers)=>{
            return answers.action === 'view user groups'; 
        },
        message:'Here is the list of users groups:',
        choices:()=>{
            return siteDefinition.security.groups.map((e)=>e.title); 
        }
    },{
        type:'checkbox',
        name:'usersList',
        message:(answers)=>{
            if (answers.action === 'view admins'){
                return 'Here is the list of admins:'
            }else if (answers.action === 'view owners'){
                return 'Here is the list of owners'; 
            }else if (answers.action === 'view visitors'){
                return 'Here is the list of visitors'; 
            }else if (answers.action === 'view members'){
                return 'Here is the list of members'; 
            }
        },
        choices:(answers)=>{
            var users = []
            if (answers.action === 'view visitors'){
                users = siteDefinition.security.visitors; 
            }else if (answers.action === 'view owners'){
                users = siteDefinition.security.owners; 
            }else if (answers.action === 'view admins'){
                users = siteDefinition.security.admins; 
            }else if (answers.action === 'view members'){
                users = siteDefinition.security.members; 
            }
            return users.map((e)=>{
                return {
                    name:e,
                    value:e,
                    checked:true
                };
            });
        },
        when:(answers)=>{
            return /view (admins|owners|visitors|members)/.test(answers.action); 
        }
    }];
    let action = null; 
    return generator.prompt(prompts)
        .then((answers)=>{
            action = answers.action; 
            siteDefinition.security = siteDefinition.security || {};
            if (action === 'add admin'){
                siteDefinition.security.admins = siteDefinition.security.admins || []; 
                siteDefinition.security.admins.push(answers.user); 
            }else if (action === 'add member'){
                siteDefinition.security.members = siteDefinition.security.members || []; 
                siteDefinition.security.members.push(answers.user); 
            } else if (action === 'add visitor') {
                siteDefinition.security.visitors = siteDefinition.security.visitors || [];
                siteDefinition.security.visitors.push(answers.user); 
            } else if (action === 'add owner'){
                siteDefinition.security.owners = siteDefinition.security.owners || [];
                siteDefinition.security.owners.push(answers.user); 
            } else if (action === 'add user group'){
                return addUserGroup(generator,siteDefinition); 
            } else if (action === 'edit user group'){
                const group = siteDefinition.security.groups.find((e)=>e.title === answers.group); 
                return addUserGroup(generator,siteDefinition,group); 
            } else if (action === 'remove user group'){
                siteDefinition.security.groups = siteDefinition.security.groups.filter(e=>e.title !== answers.group); 
            }else if (action === 'remove admin'){
                siteDefinition.security.admins = siteDefinition.security.admins.filter(e=>e!==answers.removeUser); 
            }else if (action === 'remove member'){
                siteDefinition.security.members = siteDefinition.security.members.filter(e => e !== answers.removeUser); 
            }else if (action === 'remove owner'){
                siteDefinition.security.owners = siteDefinition.security.owners.filter(e => e !== answers.removeUser); 
            } else if (action === 'remove visitor') {
                siteDefinition.security.visitors = siteDefinition.security.visitors.filter(e => e !== answers.removeUser);
            }else if (action === 'view owners'){
                siteDefinition.security.owners = answers.usersList; 
            }else if (action === 'view members'){
                siteDefinition.security.members = answers.usersList; 
            }else if (action === 'view visitors'){
                siteDefinition.security.visitors = answers.usersList; 
            }else if (action === 'view admins'){
                siteDefinition.security.admins = answers.usersList; 
            }
        })
        .then((e)=>{
            if (action !== 'back'){
                return configureSecurity(generator,siteDefinition);
            }
        })
}