const generateId = require('./generateid'); 
const skip = require('./skip');
const validateGuid = require('./validateguid');
const configs = [{
  name: 'Indexed',
  value: 'indexed',
  checked:false, 
}, {
  name: 'Hidden',
  value:'hidden',
  checked:false, 
}, {
  name: 'Required',
  value: 'required',
  checked:false,
}, {
  name: 'Sortable',
  value:'sortable', 
  checked:false,
},{
  name: 'Sealed',
  value:'sealed',
  checked:false,
},{
  name:'Filterable',
  value:'filterable',
  checked:false,
},{
  name: 'Multi Field',
  value: 'mult',
  checked:false
}, {
  name: 'Show In File Dialog',
  value: 'showInFileDlg',
  checked: true,
}, {
  name: 'Show In Edit Form',
  value: 'showInEditForm',
  checked: true,
}, {
  name: 'Show In New Form',
  value: 'showInNewForm',
  checked: true,
}, {
  name: 'Show In Display Form',
  value: 'showInDisplayForm',
  checked: true
},{
  name:'Rich Text Field',
  value:'richText', 
  checked:true,
  when:(field)=>{
    return field.type === 'HTML' || field.type==='Note'; 
  }
},{
  name:'Show In List Settings',
  value:'showInListSettings', 
  checked:true
}];
module.exports = function addField(generator,siteDefinition,f){
  var isEdit = f ? true : false;
  var field = f || {};
  var settingAction = null;
  
  siteDefinition.fields = siteDefinition.fields || [];
    const prompts = [{
      type:'list',
      name:'action',
      message:'What do you want to do next?', 
      choices:()=>{
        var c = [
          'set id',
          'set internal name', 
          'set display name', 
          'set type',
          'set group',
          'set description',
          'set default',
          'set field settings'
        ];
        if (field.type.toLowerCase().indexOf('taxonomy') !== -1 && siteDefinition.termGroups && siteDefinition.termGroups.length){
          c.push('set term store settings');
        }
        if (field.type === 'Text' || field.type === "Note" || field.type === "HTML"){
          c.push('set maximum length');
        }
        if (field.type.toLowerCase().indexOf('user') !== -1){
          c.push('set user selection mode'); 
          c.push('set user selection scope'); 
        }
        if (field.type === 'DateTime' || field.type === 'Choice' ||
          field.type === 'MultiChoice' || field.type === 'URL'){
          c.push('set choice list');
          c.push('set format');
        }
        if (field.type.toLowerCase().indexOf('lookup') !== -1){
          c.push('set show field'); 
          c.push('set lookup list');
        }
        if (field.type === 'Number' ||
        field.type === 'Integer'){
          c.push('set minimum value','set maximum value');
        }
        c.push('back');
        return c;
      },
      when:()=>{
        return isEdit; 
      }
    },{
      type:'input',
      name:'id',
      message:'What is the GUID of the field?',
      default:()=>{
        if (field.id){
          return field.id; 
        }
        return generateId();
      },
      filter:(val)=>{
        field.id = val;
        return val; 
      },
      validate: validateGuid,
      when:(answers)=>{
        return !isEdit || answers.action === 'set id'; 
      }
    },{
      type:'input',
      name:'name',
      message:'What is the name of the field?',
      validate:(val)=>{
        return (!(/[\s]+/.test(val)) && val && val.trim())?true:'Please provide a valid field name';
      },
      filter:(val)=>{
        field.name = val; 
        return val; 
      },
      default:()=>{
        return field.name;
      },
      when:(answers)=>{
        return !isEdit || answers.action === 'set name'; 
      }
    },{
      type:'input',
      name:'description',
      message:'Provide a description for the field.',
      filter:(val)=>{
        field.description = val; 
        return val;
      },
      default:(answers)=>{
        return field.description || `Content for field ${answers.name}`;
      },
      when:(answers)=>{
        return !isEdit || answers.action === 'set description';
      }
    },{
      type:'input',
      name:'displayName',
      message:'What is the display name of the field?',
      validate:(val)=>{
        return val && val.trim()?true:'Please provide a valid display name';
      },
      when:(answers)=>{
        return !isEdit || answers.action === 'set display name'; 
      },
      filter:(val)=>{
        field.displayName = val; 
        return val; 
      },
      default:(answers)=>{
        return field.displayName || answers.name.replace(/([a-z])([A-Z])/g, '$1 $2');
      }
    },{
      type:'input',
      name:'group',
      message:'What is the group of the field?', 
      filter:(val)=>{
        field.group = val; 
        return val; 
      },
      when:(answers)=>{
        return !isEdit || answers.action === 'set group';
      },
      default:(answers)=>{
        if (field.group){
          return field.group;
        }
        let fields = siteDefinition.fields;
        if (fields && fields.length){
          return fields[0].group; 
        }
      }
    },{
      type:'list',
      name:'type',
      message:'What is the type of the field?',
      choices:['Text','Note','HTML','Boolean',
        'Number','Integer','User',
        'UserMulti','Lookup','LookupMulti',
        'DateTime','TaxonomyFieldType',
        'TaxonomyFieldTypeMulti',
        'Choice','MultiChoice'],
      filter:(val)=>{
          field.type = val;
          return val; 
      },
      default:()=>{
        if (field.type){
          return field.type; 
        }
        return 'Text'
      },
      when:(answers)=>{
        return !isEdit || answers.action === 'set type';
      }
    },{
      type:'input',
      name:'choices', 
      when:(answers)=>{
        return (!isEdit && (answers.type === 'Choice' ||
          answers.type === 'MultiChoice')) || answers.action === 'set choice list'; 
      },
      validate:(val)=>{
        var c1= val && val.trim();
        var c2= c1 && val.trim().split(';').filter((e)=>e.trim()).length > 0;
        return c1 && c2?true:'Please provide a valid choice list'; 
      },
      filter:(val)=>{
        var choices = val.split(';').filter(e=>e.trim()); 
        field.choices = choices; 
        return val; 
      },
      default:()=>{
        return (field.choices||[]).join(';');
      },
      message:'Enter choices, seperate by semi-colon ";" e.g. Choice 1;Choice 2'
    },{
      type:'list',
      when:(answers)=>{
        return (((!isEdit && (answers.type === 'TaxonomyFieldType' ||
          answers.type === 'TaxonomyFieldTypeMulti')) || (answers.action === 'set term store settings')) && 
          (siteDefinition.termGroups && 
          siteDefinition.termGroups.length));
      },
      name:'termGroupName', 
      filter:(val)=>{
        field.termGroupName = val; 
        return val;
      },
      choices:()=>{
        return (siteDefinition.termGroups).map((e)=>e.name);
      },
      message:'Select a Term Group to use to use for your TaxonomyField' 
    },{
        type: 'list',
        when: (answers) => {
          var group = (siteDefinition.termGroups||[]).find((e)=>{
            return answers.termGroupName === e.name; 
          });
          return ((!isEdit && (answers.type === 'TaxonomyFieldType' ||
            answers.type === 'TaxonomyFieldTypeMulti')) || (
              answers.action === 'set term store settings'
            ))  &&(
            siteDefinition.termGroups &&
            siteDefinition.termGroups.length && 
            group && 
            group.termSets &&
            group.termSets.length);
        },
        name:'termSetName', 
        choices:(answers)=>{
          var group = (siteDefinition.termGroups || []).find((e) => {
            return answers.termGroupName === e.name;
          });
          return group.termSets.map((e)=>{
            return e.name; 
          });
        },
        filter:(val)=>{
          field.termSetName = val; 
          return val; 
        },
        message: 'Select a Term Set to use to use for your TaxonomyField'
    },{
      type:'list', 
      name:'format', 
      message:'What is the format of the field?',
      filter:(val)=>{
        if (val !== 'None'){
          field.format = val; 
        }
        return val; 
      },
      choices:(answers)=>{
        if (answers.type === 'DateTime'){
          return ["DateTime","TimeOnly","EventList",
        "DateOnly","ISO8601","MonthDayOnly","MonthYearOnly",
        "ISO8601Basic","ISO8601Gregorian","ISO8601BasicDateOnly",
        "None"];
        }else if (answers.type === 'Choice' || answers.type === 'MultiChoice'){
          return ["DropDown","RadioButtons","None"]; 
        }else if (answers.type === 'URL'){
          return ["HyperLink","Image","None"]; 
        }else {
          return ["None"];
        }
      },
      default:()=>{
        if (field.format){
          return field.format; 
        }
        return "None"; 
      },
      when:(answers)=>{
        return (!isEdit && (answers.type === 'DateTime' ||
          answers.type === 'Choice' ||
          answers.type === 'MultiChoice' ||
          answers.type === 'URL')) || answers.action === 'set format'; 
      }
    },{
      type:'confirm',
      name:'provideDefault', 
      message:'Do you want to provide a default value?', 
      default:()=>{
        if (field.default){
          return true; 
        }
        return false; 
      },
      when:()=>{
        return !isEdit;
      }
    },{
      type:'input',
      name:'default', 
      message:'What is the default value?',
      when:(answers)=>{
        return (!isEdit && answers.provideDefault )||answers.action === 'set default'; 
      },
      filter:(val)=>{
        if (field.type === 'Number' || field.type === 'Integer'){
          field.default = parseFloat(val); 
          return parseFloat(val); 
        }
        field.default = val; 
        return val; 
      },
      default:()=>{
        if (field.default){
          return field.default; 
        }
      },
    },{
      type:'list',
      name:'listTitle',
      when:(answers)=>{
        return (!isEdit && (answers.type === 'Lookup' ||
          answers.type === 'LookupMulti')) || 
          answers.action === 'set lookup list'; 
      },
      message:'What is the lookup field list?', 
      default:()=>{
        if (field.listTitle){
          return field.listTitle; 
        }
      },
      filter:(val)=>{
        field.listTitle = val; 
        return val; 
      },
      choices:()=>{
        return (siteDefinition.lists || []).map((e)=>e.title); 
      }
    },{
      type:'list',
      name:'configs', 
      message:'Which setting do you want to edit?',
      filter:(val)=>{
        settingAction = val; 
        return val;
      },
      choices:()=>{
        var c = configs.map((e)=>{
          return {
            name:e.name,
            value:e.value, 
            checked: typeof field[e.value] !== "undefined" ? field[e.value] : e.checked,
            when:e.when
          }
        }).filter((e)=>{
          return e.when?e.when(field):true; 
        }); 
        return c; 
      },
      when:(answers)=>{
        return answers.action === 'set field settings';
      }
    },{
      type:'list', 
      name:'configValue', 
      message:'settingValue', 
      default:(answers)=>{
        return field[answers.configs] || 'n/a'; 
      },
      choices:()=>{
        return ['yes','no','n/a']; 
      },
      filter:(val)=>{
        field[settingAction] = val === 'yes'?true:val === 'no'?false:undefined;
        return val; 
      },
      when:(answers)=>{
        return answers.configs && answers.action === 'set field settings'; 
      },
      default:(answers)=>{
        return typeof field[answers.configs] === "undefined"?'n/a':field[answers.configs]?'yes':'no';
      }
    },{
      type:'input',
      name:'showField',
      message:'What field to use for the lookup field?',
      default:()=>{
        if (field.showField){
          return field.showField; 
        }
        return 'Title';
      }, 
      filter:(val)=>{
        field.showField = val; 
        return val; 
      },
      when:(answers)=>{
        return (!isEdit && (answers.type === 'Lookup' ||
          answers.type === 'LookupMulti')) || answers.action === 'set show field'; 
      }
    },{
      type:'input', 
      name:'min', 
      message:'What is the minimum value?',
      default:()=>{
        if (typeof field.min !== "undefined"){
          return field.min; 
        }
      },
      when:(answers)=>{
        return answers.action === 'set minimum value'; 
      },
      filter:(val)=>{
        if (val === '-' || val === '' || val == null){
          return undefined; 
        }
        if (/[0-9]+/.test(val)){
          return parseFloat(val); 
        }
      },
      default:'',
    },{
      type:'input', 
      name:'max', 
      message:'What is the maximum value?',
      when:(answers)=>{
        return answers.action === 'set maximum value'; 
      },
      default:()=>{
        if (typeof field.max !== "undefined"){
          return field.max; 
        }
      },
      filter:(val)=>{
        if (val === '-' || val === '' || val == null){
          return undefined; 
        }
        if (/[0-9]+/.test(val)){
          return parseFloat(val); 
        }
      },
      default:'',
    },{
      type:'list', 
      name:'userSelectionMode',
      message:'What is the user selection mode of the user field?', 
      when:(answers)=>{
        return answers.action === 'set user selection mode'; 
      },
      default:(val)=>{
        return field.userSelectionMode || 'PeopleAndGroups'; 
      },
      choices:['PeopleOnly','PeopleAndGroups'].map((e,i)=>{
        return {
          name:e,
          value:i
        };
      }),
      filter:(val)=>{
        field.userSelectionMode = val; 
        return val; 
      },
    },{
      type:'list',
      name:'userSelectionScope', 
      message:'What is the scope of this user field?',
      when:(answers)=>{
        return answers.action === 'set user selection scope'; 
      },
      default:(val)=>{
        return field.userSelectionScope || '0'; 
      },
      validate:(val)=>{
        return val && val.trim()?true:'Please provide a valid selection scope';
      },
      filter:(val)=>{
        field.userSelectionScope = val.trim(); 
        return val; 
      },
    },{
      type:'input', 
      name:'maxLength', 
      message:'What is the maximum length of the field?', 
      when:(answers)=>{
        return (answers.action === 'set maximum length'); 
      },
      validate:(val)=>{
        return /[0-9]+/.test(val)?true:'Please provide a valid value (numbers only)';
      },
      default:()=>{
        return field.maxLength || 255; 
      },
      filter(val){
        field.maxLength = +val; 
        return val;
      }
    }];
  
  return generator.prompt(prompts)
    .then((answers)=>{
        delete answers.provideDefault;
        if (!isEdit) {
          siteDefinition.fields.push(field);
        }
        // return configureSiteDefinition();
        if (answers.action !== 'back'){
          return addField(generator,siteDefinition,field);
        }
    });
};