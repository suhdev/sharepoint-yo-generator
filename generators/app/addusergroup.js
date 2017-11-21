module.exports = function addUserGroup(generator,siteDefinition,g){
    let isEdit = g? true:false; 
    let group = g || {members:[]}; 

    const prompts = [
        {
            type:'list',
            name:'action',
            message:'What would you like to do next?', 
            choices:()=>{
                var c = ['set group title',
                'set group description',
                'set group owner',
                'add member'];
                if (group.members && group.members.length){
                    c.push('remove member'); 
                }
                c.push('back'); 
                return c; 
            },
            when:()=>{
                return isEdit; 
            }
        },
        {
            type:'input',
            name:'title',
            filter:(val)=>{
                group.title = val; 
                return val; 
            },
            message:'What is the title of the user group?', 
            when:(answers)=>{
                return answers.action === 'set group title' || !isEdit; 
            },
            validate: (val) => {
                return val && val.trim() ? true : 'Please provide a valid description';
            },
            default:()=>{
                return group.title; 
            }
        },{
            type:'input',
            name:'description',
            filter:(val)=>{
                group.description = val; 
                return val; 
            },
            validate:(val)=>{
                return val && val.trim()?true:'Please provide a valid description'; 
            },
            messsage:'What is the description of the user group?', 
            when:(answers)=>{
                return answers.action === 'set group description' || !isEdit; 
            },
            default:()=>{
                return group.description || `Users for ${group.title}`; 
            }
        },{
            type:'input',
            name:'owner',
            filter:(val)=>{
                group.owner = val; 
                return val; 
            },
            validate: (val) => {
                return val && val.trim() ? true : 'Please provide a valid description';
            },
            messsage:'Who is the owner of the use group? please provide an email address example@example.com',
            default:()=>{
                return group.owner; 
            },
            when:(answers)=>{
                return answers.action === 'set group owner' || !isEdit; 
            }
        },{
            type:'input',
            name:'member', 
            filter:(val)=>{
                group.members.push(val.trim()); 
                return val; 
            },
            message:'Please provide the member email address',
            validate: (val) => {
                return val && val.trim() ? true : 'Please provide a valid description';
            },
            when:(answers)=>{
                return answers.action === 'add member'; 
            }
        },{
            type:'list',
            name:'memberRemove',
            filter:(val)=>{
                group.members = group.members.filter((e)=>e !== val); 
                return val; 
            },
            choices:()=>{
                return group.members; 
            },
            when:(answers)=>{
                return answers.action === 'remove member'; 
            }
        }
    ];
    var action = null; 
    return generator.prompt(prompts)
        .then((answers)=>{
            action = answers.action;
            if (!isEdit){
                siteDefinition.security = siteDefinition.security || {};
                siteDefinition.security.groups = siteDefinition.security.groups || [];
                siteDefinition.security.groups.push(group);

            }
            if (action !== 'back'){
                return addUserGroup(generator,siteDefinition,group);
            } 
        });
}