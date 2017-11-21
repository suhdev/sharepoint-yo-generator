const generateId = require('./generateid');
const validateGuid = require('./validateguid');
const { CustomActionLocationList, StandardMenuGroupList,
    ContentTypeSettingsGroupList, GroupsPageList, SiteSettingsGroupList,
    ListEditGroupList, DocumentLibraryGroupList,PeoplePageGroupList,
    CreateGroupList} = require('sharepoint-util/lib/provisioning/usercustomaction');
const {TemplateTypesList,ListTemplateType,
    ListTemplateTypeByValue,
    BuiltInContentTypeList,  } = require('sharepoint-util/lib/sharepoint/builtin'); 
function addCustomAction(generator,siteDefinition,list,act){
    let isEdit = act?true:false; 
    let action = act || {}; 
    list.userCustomActions = list.userCustomActions || [];
    const prompts = [{
        type:'input', 
        message:'What is the ID of the action?',
        name:'registrationId', 
        validate:(val)=>{
            return val?true:false; 
        },
        filter:(val)=>{
            action.registrationId = val; 
            return val; 
        },
        default:()=>{
            return action.registrationId || generateId();
        }
    },{
        type:'input',
        message:'What is the name of the custom action', 
        name:'name', 
        validate:(val)=>{
            return val?true:false;
        },
        filter:(val)=>{
            action.name = val; 
            return val; 
        },
        default:()=>{
            return action.name;
        }
    },{
        type:'confirm',
        name:'enabled',
        default:()=>{
            return action.enabled?true:false; 
        },
        filter:(val)=>{
            action.enabled = val; 
            return val; 
        },
        message:'Is the action enabled?'
    },{
        type:'input', 
        name:'url', 
        default:()=>{
            return action.url; 
        },
        filter:(val)=>{
            action.url = val; 
            return val; 
        },
        message:'What is the action URL?', 
    },{
            type: 'input',
            name: 'title',
            default: () => {
                return action.title;
            },
            validate: (val) => {
                return val ? true : false;
            },
            message: 'What is the display name of the custom action?'
        },{
        type:'list',
        message:'What is the registration type?',
        choices:['None','List','ContentType','ProgId','FileType'], 
        default:()=>{
            return action.registrationType || 'List';
        }, 
        filter:(val)=>{
            action.registrationType = val; 
            return val; 
        },
        name:'registrationType'
    },{
        type:'list',
        message:'What is the action location?',
        choices: CustomActionLocationList,
        default:'ViewToolbar',
        filter:(val)=>{
            action.location = val; 
            return val; 
        },
        name:'location'
    },{
        type:'list',
        message:'What is the action group?',
        choices:(answers)=>{
            switch(answers.location){
                case 'Microsoft.SharePoint.StandardMenu':
                return StandardMenuGroupList;
                case "Microsoft.SharePoint.ContentTypeSettings":
                case "Microsoft.SharePoint.ContentTypeTemplateSettings":
                return ContentTypeSettingsGroupList;
                case "Microsoft.SharePoint.Create":
                return CreateGroupList;
                case "Microsoft.SharePoint.GroupsPage":
                return GroupsPageList;
                case "Microsoft.SharePoint.ListEdit":
                return ListEditGroupList;
                case "Microsoft.SharePoint.ListEdit.DocumentLibrary":
                return DocumentLibraryGroupList;
                case "Microsoft.SharePoint.PeoplePage":
                return PeoplePageGroupList;
                case "Microsoft.SharePoint.SiteSettings":
                return SiteSettingsGroupList; 
                default:
                return ["None"];
            }
        },
        filter:(val)=>{
            action.groupId = val; 
            return val; 
        },
        when:(answers)=>{
            return answers.location !== 'DisplayFormToolbar' && 
                answers.location !== 'EditControlBlock' &&
                answers.location !== 'EditFormToolbar' &&
                answers.location !== 'NewFormToolbar' && 
                answers.location !== 'ViewToolbar';
        },
        name:'groupId'
    },{
        type:'confirm',
        message:'Do you want to add a script block?',
        name:'hasScriptBlock',
        default:false, 
    },{
        type:'editor', 
        message:'Enter the script code you want:',
        name:'scriptBlock',
        default:()=>{
            return action.scriptBlock; 
        },
        when:(answers)=>{
            return answers.hasScriptBlock; 
        }
    },{
        type:'confirm',
        message:'Do you want to add a script file?',
        name:'hasScriptSrc', 
        default:()=>{
            return action.scriptSrc?true:false; 
        }, 
    },{
        type:'input', 
        message:'Enter the file URL', 
        name:'scriptSrc', 
        when:(answers)=>{
            return answers.hasScriptSrc; 
        },
        default:()=>{
            return action.scriptSrc; 
        },
        filter:(val)=>{
            action.scriptSrc = val; 
            return val; 
        }
    }];

    return generator.prompt(prompts)
        .then(()=>{
            if (!isEdit){
                list.userCustomActions.push(action); 
            };
        })

}

function editCustomAction(generator,siteDefinition,list){
    const prompts = [
        {
            type:'list', 
            name:'actionName',
            message:'Which action do you want to edit?', 
            choices:()=>{
                return [...(list.userCustomActions||[]).map(e=>e.name),'None']; 
            }
        }
    ]; 
    return generator.prompt(prompts)
        .then((answers)=>{
            if (answers.actionName !== 'None'){
                const action = (list.userCustomActions||[]).find((e)=>{
                    return e.name === answers.actionName; 
                });
                return addCustomAction(generator,siteDefinition,list,action);
            }
        });
}

function removeCustomAction(generator,siteDefinition,list){
    const prompts = [
        {
            type: 'list',
            name: 'actionName',
            message: 'Which action do you want to remove?',
            choices: () => {
                return [...(list.userCustomActions || []).map(e => e.name), 'None'];
            }
        }
    ];
    return generator.prompt(prompts)
        .then((answers)=>{
            list.userCustomActions = list.userCustomActions.filter((e)=>{
                return e.name !== answers.actionName; 
            });
        });
}

function listExtraActions(generator,siteDefinition,list){
    let listAction = null; 
    list.userCustomActions = list.userCustomActions || [];
    const prompts = [{
        type: 'list',
        name: 'listAction',
        message: 'What do you want to do next?',
        default: ['back'],
        filter:(val)=>{
            listAction = val; 
            return val; 
        },
        choices: ()=>{
            if (list.userCustomActions && list.userCustomActions.length){
                return ['add a custom action',
                'edit a custom action',
                'remove a custom action',
                'back'];
            }else {
                return ['add a custom action',
                    'back'];
            }
        }
    }]; 

    return generator.prompt(prompts)
        .then((answers)=>{
            if (answers.listAction === 'add a custom action'){
                return addCustomAction(generator,siteDefinition,list);
            }else if (answers.listAction === 'edit a custom action'){
                return editCustomAction(generator,siteDefinition,list); 
            }else if (answers.listAction === 'remove a custom action'){
                return removeCustomAction(generator,siteDefinition,list); 
            }
        })
        .then(()=>{
            if (listAction !== 'back'){
                return listExtraActions(generator,siteDefinition,list); 
            }
        })

}
module.exports = function addList(generator,siteDefinition,l){
    var isEdit = l ? true : false;
    var list = l || {};
    console.log(l);
    siteDefinition.lists = siteDefinition.lists || []; 
    let nextAction = null;
    var basePrompts = [{
        type:'list',
        name:'action',
        message:'What do you want to do next?', 
        when:(answers)=>{
            return isEdit; 
        },
        choices:(answers)=>{

            var c = ['set title',
            'set id',
            'set indexed',
            'set description',
            'templateType',
            'create interface',
            'set enable attachments',
            'set enable content types',
            'set enable folder creation',
            'set enable versioning',
            'set content types'];
            if (list.contentTypes && list.contentTypes.length){
                c.push('set default content type');
            }
            c.push('set custom actions');
            c.push('back'); 
            return c; 
        }
    },{
        type:'input',
        name:'title',
        message:'What is the title of the list?',
        filter:(val)=>{
            list.title = val; 
            return val;
        },
        validate:(val)=>{
            return val && val.trim()?true:"Please provide a valid title for the list";
        },
        default:()=>{
            return list.title; 
        },
        when:()=>{
            return !isEdit; 
        }
    },{
        type:'input', 
        name:'id', 
        message:'What is the GUID of the list?', 
        filter:(val)=>{
            list.id = val; 
            return val; 
        },
        validate:validateGuid,
        default:()=>{
            return list.id || generateId();
        },
        when: () => {
            return !isEdit;
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
        },
        when:(answers)=>{
            return !isEdit || answers.action === 'set description';
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
        },
        when:(answers)=>{
            return !isEdit || answers.action === 'set template type';
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
        },
        when:(answers)=>{
            return !isEdit || answers.action === 'create interface'; 
        },
    },{
        type:'input', 
        name:'interface', 
        message:'What is the inteface name?',
        filter:(val)=>{
            list.interface = val; 
            return val;
        },
        when:(answers)=>{
            return (!isEdit || answers.action === 'create interface') && answers.createInterface;
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
        },
        when:(answers)=>{
            return !isEdit || answers.action === 'set enable attachments'; 
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
        },
        when: (answers) => {
            return !isEdit || answers.action === 'set enable content types';
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
        },
        when: (answers) => {
            return !isEdit || answers.action === 'set enable folder creation';
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
        when: (answers) => {
            return !isEdit || answers.action === 'set content types';
        }
    },{
        type:'list',
        name:'defaultContentType', 
        message:'Which content type is the default for this list?',
        choices:()=>{
            return list.contentTypes;
        },
        default:()=>{
            return list.contentTypes[0];
        },
        when: (answers) => {
            return !isEdit || answers.action === 'set default content type';
        }
    },{
        type:'confirm',
        name:'enableVersioning',
        message:'Do you want to enable versioning on this list?',
        default:()=>{
            if (typeof list.enableVersioning !== "undefined"){
                return list.enableVersioning; 
            }
            return false; 
        },
        filter:(val)=>{
            list.enableVersioning = val; 
            return val; 
        },
        when: (answers) => {
            return !isEdit || answers.action === 'set enable versioning';
        }
    }];
    let action = null; 
    return generator.prompt(basePrompts)
        .then((answers)=>{
            action = answers.action; 
            if (!isEdit) {
                siteDefinition.lists.push(list);
            }
            if (action === 'set custom actions'){
                return listExtraActions(generator,siteDefinition,list); 
            }
        })
        .then(()=>{
            if (action !== 'back'){
                return addList(generator,siteDefinition,list);
            }
        });
}