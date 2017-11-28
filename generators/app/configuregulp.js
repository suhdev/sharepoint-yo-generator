module.exports = function configureGulp(generator,config,gulp){
    var keys = Object.keys(gulp.tasks); 
    const prompts = [{
        type:'list', 
        name:'action',
        message:'What would you like to do next?', 
        choices(){
            var c = [];
            if (keys.length){
                c.push(...keys); 
            }
            c.push('back'); 
            return c; 
        }
    }]; 
    let action = null; 

    return generator.prompt(prompts)
        .then((answers)=>{
            action = answers.action; 
            if (action !== 'back'){
                if (gulp.parallel){
                    gulp.parallel(action,()=>{
                        console.log(`task ${answers.action} is done`);
                    }); 
                }else if (gulp.start){
                    gulp.start(action, () => {
                        console.log(`task ${answers.action} is done`);
                    }); 
                }
            }
        })
        .then(()=>{
            if (action !== 'back'){
                return configureGulp(generator,config,gulp);
            }
        }); 
}