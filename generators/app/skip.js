module.exports = function skip(cfg){
    const { message, name, output } = cfg; 
    return {
        message,
        type:'list', 
        name,
        filter:(val)=>{
            if (val !== 'skip'){
                output[name] = val; 
            }
            return val; 
        },
        choices:[
            'yes',
            'no',
            'skip',
        ],
        default:()=>{
            if (typeof cfg.default === "boolean"){
                return cfg.default?'yes':'no'; 
            }
            return 'skip';
        }
    };
}