const request = require('request'); 
function searchForLibrary(libraryName){
    return new Promise((res,rej)=>{
        console.log(`https://api.cdnjs.com/libraries?search=${libraryName}&fields=name`)
        request(`https://api.cdnjs.com/libraries?search=${libraryName}&fields=name`,(err,response,body)=>{
            let box = typeof body === "string"?JSON.parse(body):body; 
            res(box && box.results || [{name:'No results'}]);
        });
    });
}

function getLibraryVersions(libraryName){
    return new Promise((res, rej) => {
        request(`https://api.cdnjs.com/libraries/${libraryName}?fields=name,assets,version`, (err, response, body) => {
            if (err){
                res([{ name: 'No results' }]); 
            }
            let box = typeof body === "string" ? JSON.parse(body) : body; 
            res(box && box.assets && assets.length?box.assets:[{ name: 'No results' }]);
        });
    });
}

module.exports = function configureLibraries(generator,config){
    let packages = [];
    let versions = []; 
    generator.libraries = generator.libraries || [];
    let library = null;
    const libraryPrompts = [
        {
            type: 'list',
            name: 'action',
            message: 'Do you want to add libraries from cdn?',
            choices:()=>{
                var c = ['add a library using URL', 'add library from cdnjs.com.com']; 
                if (config.cdn && config.cdn.length > 0){
                    c.push('remove libraries'); 
                }
                c.push('remove all libraries','back'); 
                return c; 
            }
        },
        {
            type: 'input',
            name: 'libUrl',
            message: 'What is the library URL?',
            default: 'jquery',
            validate(val){
                return val && val.trim() && val.startsWith('http')?true:'Please provide a valid URL';
            },
            when: answers => {
                return answers.action === 'add a library using URL';
            }
        },
        {
            type:'input',
            name:'librarySearchName',
            message:'What is the library name you are looking for?', 
            when(answers){
                return answers.action === 'add library from cdnjs.com'; 
            },
            
        },{
            type:'list',
            name:'libraryName',
            filter(val){
                if (val !== 'No results'){
                    library = library || {};
                    library.name =val;
                }
                return val; 
            },
            message:'Which library do you want to add?',
            when(answers) {
                return answers.action === 'add library from cdnjs.com';
            },
            choices(answers) {
                return searchForLibrary(answers.librarySearchName)
                    .then((e) => {
                        packages = e || []; 
                        return e.map((e) => {
                            return {
                                name: e.name,
                                value: e.name
                            };
                        })
                    });
            }
        },{
            type:'list',
            name:'libraryVersion',
            message:'Which version of the library do you want to use?',
            filter(val) {
                if (val !== 'No results') {
                    library = library || {};
                    library.version = val;
                }
                return val;
            },
            choices(answers){
                return getLibraryVersions(answers.libraryName)
                    .then((e)=>{
                        versions = e; 
                        return e.map((e)=>{
                            return {
                                name:e.version,
                                value:e.version
                            };
                        });
                    })
            },
            when(answers){
                return answers.action === 'add library from cdnjs.com' && 
                answers.libraryName !== 'No results';
            }
        },{
            type:'checkbox',
            name:'assetsToDownload',
            message:'Which assets do you want to download?', 
            filter(val){
                library = library || {};
                library.files = val;
                return val; 
            },
            choices(answers){
                return versions.find((e)=>{
                    return e.version === answers.libraryVersion; 
                }).files.map((e)=>{
                    return {
                        name:e,
                        value:e
                    };
                });
            },
            when(answers){
                return answers.action === 'add library from cdnjs.com';
            }
        },
        {
            type:'checkbox',
            name:'librariesToRemove',
            message:'Which libraries do you want to remove?',
            choices(){
                return config.cdn; 
            },
            when(answers){
                return answers.action === 'remove libraries'; 
            }
        }
    ];

    let action = null; 

    return generator.prompt(libraryPrompts).then(answers => {
        action = answers.action; 
        if (answers.action === 'add a library using URL') {
            generator.libraries.push(answers.libUrl);
            config.cdn = config.cdn || []; 
            config.cdn.push(answers.libUrl);
            generator.config.set(config);
            generator.config.save(); 
        }else if (answers.action === 'add library from cdnjs.com.com'){
            if (library && library.files && library.name && library.version){
                config.cdn = config.cdn || []; 
                library.files.forEach((e)=>{
                    config.cdn.push(`https://cdnjs.cloudflare.com/ajax/libs/${library.name}/${library.version}/${e}`);
                });
                generator.config.set(config);
                generator.config.save(); 
            }
        }else if (answers.action === 'remove libraries'){
            config.cdn = config.cdn.filter((e) => {
                return answers.librariesToRemove.indexOf(e) === -1;
            });
            generator.config.set(config); 
            generator.config.save();
        }
    })
    .then(()=>{
        if (action !== 'back'){
            return configureLibraries(generator,config); 
        }
    });
}