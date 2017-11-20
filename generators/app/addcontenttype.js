const generateId = require('./generateid'); 
const { BuiltInContentTypeList } = require('sharepoint-util/lib/sharepoint/builtin');
module.exports = function addContentType(generator,siteDefinition,c){
    var isEdit = c ? true : false;
    var contentType = c || {};
    siteDefinition.contentTypes = siteDefinition.contentTypes || [];
    const prompts = [
        {
            type:'input', 
            name:'name', 
            message:'What is the name of the content type?',
            filter:(val)=>{
                contentType.name = val; 
                return val; 
            }, 
            default:()=>{
                return contentType.name; 
            }
        },
        {
            type:"input",
            name:"id", 
            filter:(val)=>{
                contentType.id = val; 
                return val; 
            }, 
            message:"What is the GUID of the content type?", 
            default:()=>{
                return contentType.id || generateId();
            }
        },
        {
            type:'input',
            name:'group',
            message:'What is the content type group?',
            filter:(val)=>{
                contentType.group = val; 
                return val; 
            }, 
            default:()=>{
                if (contentType.group){
                    return contentType.group; 
                }
                if (siteDefinition.contentTypes && siteDefinition.contentTypes.length){
                    return siteDefinition.contentTypes[0].group; 
                }
            }
        },
        {
            type:'input', 
            name:'description', 
            filter:(val)=>{
                contentType.description = val; 
                return val; 
            },
            message:'What is the description of the field?', 
            default:()=>{
                return contentType.description || `Description for ${contentType.name}`;
            }
        },
        {
            type:"list", 
            name:"parent", 
            message:"What is the parent of this content type?", 
            choices:()=>{
                return [...siteDefinition.contentTypes.map((e)=>e.name),...BuiltInContentTypeList];
            },
            filter:(val)=>{
                contentType.parent = val; 
                return val; 
            },
            default:()=>{
                if (contentType.parent){
                    return contentType.parent; 
                }
                return "Item"; 
            }
        },
        {
            type:"checkbox",
            name:'fields',
            filter:(val)=>{
                contentType.fields = val; 
                return val;
            },
            choices:()=>{
                return siteDefinition.fields.map((e)=>e.name); 
            },
            message:'What fields do you want to include in this content type?', 
            default:()=>{
                return contentType.fields;
            }
        }
    ]; 

    return generator.prompt(prompts)
        .then((answers)=>{
            if (!isEdit) {
                this.siteDefinition.contentTypes.push(contentType);
            }
            return this._configureSiteDefinition();
        });
}