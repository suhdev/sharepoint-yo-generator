const generateId = require('./generateid'); 
const { BuiltInContentTypeList } = require('sharepoint-util/lib/sharepoint/builtin');
module.exports = function addContentType(generator,siteDefinition,c){
    var isEdit = c ? true : false;
    var contentType = c || {};
    siteDefinition.contentTypes = siteDefinition.contentTypes || [];
    const prompts = [
        {
            type:'list',
            name:'action',
            message:'What would you like to do next?', 
            choices:()=>{
                var c = [
                'set name',
                'set id',
                'set description',
                'set parent', 
                'set group'];
                if (siteDefinition.fields && siteDefinition.fields.length){
                    c.push('set fields');
                }
                c.push('back'); 
                return c; 
            },
            when:(answers)=>{
                return isEdit; 
            }
        },
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
            },
            when:(answers)=>{
                return !isEdit || answers.action === 'set name'; 
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
            },
            when:(answers)=>{
                return !isEdit || answers.action === 'set id'; 
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
            },
            when: (answers) => {
                return !isEdit || answers.action === 'set group';
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
            },
            when: (answers) => {
                return !isEdit || answers.action === 'set description';
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
            },
            when: (answers) => {
                return !isEdit || answers.action === 'set parent';
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
            },
            when: (answers) => {
                return !isEdit || answers.action === 'set fields';
            }
        }
    ]; 
    var action = null;
    return generator.prompt(prompts)
        .then((answers)=>{
            action = answers.action; 
            if (!isEdit) {
                this.siteDefinition.contentTypes.push(contentType);
            }
        })
        .then(()=>{
            if (action !== 'back'){
                return addContentType(generator,siteDefinition,contentType); 
            }
        });
}