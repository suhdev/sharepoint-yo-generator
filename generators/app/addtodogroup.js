module.exports = function addTodoGroup(generator,groups,g){
    let isEdit = g?true:false; 
    let group = g || {
        created:+new Date()
    }; 
    const prompts = [{
        type:'input', 
        name:'name',
        message:'What is the group name?', 
        default(){
            return group.name; 
        },
        validate(val){
            let vv = groups.find((e)=>{
                return e.name === val.trim(); 
            });
            if (vv && !isEdit){
                return 'A group with the same name already exists, please try a different name'; 
            }
            return true; 
        },
        filter(val){
            group.name = val.trim();
            return val; 
        }
    }];

    return generator.prompt(prompts)
        .then((answers)=>{
            if (!isEdit && groups) {
                groups.push(group); 
            }
        });
}