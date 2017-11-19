const generateId = require('./generateid');
const {TemplateTypesList,ListTemplateType,
    ListTemplateTypeByValue,
    BuiltInContentTypeList} = require('sysdoc-util/lib/sharepoint/builtin'); 
module.exports = function(siteDefinition,list){
    return [{
        type:'input',
        name:'title',
        message:'What is the title of the list?',
        filter:(val)=>{
            list.title = val; 
            return val;
        },
        default:()=>{
            return list.title; 
        }
    },{
        type:'input', 
        name:'id', 
        message:'What is the GUID of the list?', 
        filter:(val)=>{
            list.id = val; 
            return val; 
        },
        default:()=>{
            return list.id || generateId();
        }
    },{
        type:'input', 
        name:'description', 
        message:'Please provide a descrition for this list:', 
        filter:(val)=>{
            list.description = val; 
            return val; 
        },
        default:()=>{
            return list.description || `Description for ${list.title}`;
        }
    },{
        type:'list', 
        name:'templateType', 
        message:'Which template do you want to use for the library?', 
        filter:(val)=>{
            list.templateType = ListTemplateType[val]; 
            return val; 
        },
        choices:TemplateTypesList,
        default:()=>{
            return (list.templateType && ListTemplateTypeByValue[list.templateType]) || 'GenericList';
        }
    },{
        type:'confirm',
        name:'createInterface', 
        message:'Do you want to create an interface for this list?',
        default:()=>{
            if (typeof list.interface){
                return true; 
            }
            return true; 
        }
    },{
        type:'input', 
        name:'interface', 
        message:'What is the inteface name?',
        filter:(val)=>{
            list.interface = val; 
            return val;
        },
        default:()=>{
            if (list.interface){
                return list.interface; 
            }
            if (list.title.endsWith('ies')){
                return list.title.substr(0,list.title.length - 3)+'y';
            }else if (list.title.endsWith('s')){
                return list.title.substr(0,list.title.length - 1); 
            }else {
                return list.title; 
            }
        }
    },{
        type:'confirm',
        name:'enableAttachments', 
        message:'Does this list support attachments?',
        filter:(val)=>{
            list.enableAttachments = val; 
            return val; 
        },
        default:()=>{
            if (typeof list.enableAttachments !== "undefined"){
                return list.enableAttachments; 
            }
            return true; 
        }
    },{
        type:'confirm',
        name:'enableContentTypes', 
        message:'Does this list support content types?',
        filter:(val)=>{
            list.enableContentTypes = val; 
            return val; 
        },
        default:()=>{
            if (typeof list.enableContentTypes !== "undefined"){
                return list.enableContentTypes; 
            }
            return true; 
        }
    },{
        type:'confirm',
        name:'enableFolderCreation', 
        message:'Does this list support folder creation?',
        filter:(val)=>{
            list.enableFolderCreation = val; 
            return val; 
        },
        default:()=>{
            if (typeof list.enableFolderCreation !== "undefined"){
                return list.enableFolderCreation; 
            }
            return false; 
        }
    },{
        type:'checkbox',
        name:'contentTypes', 
        message:'Which content types do you want to add to the list?',
        choices:()=>{
            return [...siteDefinition.contentTypes.map(e=>e.name),...BuiltInContentTypeList];
        },
        default:()=>{
            return list.contentTypes;
        },
        filter:(val)=>{
            list.contentTypes = val; 
            return val;
        },
    }];
}