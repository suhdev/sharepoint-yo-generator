const generateId = require('./generateid'); 
const skip = require('./skip');
const validateGuid = require('./validateguid');
module.exports = function addField(generator,siteDefinition,f){
  var isEdit = f ? true : false;
  var field = f || {};
  siteDefinition.fields = siteDefinition.fields || [];
    const prompts = [{
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
      validate: validateGuid
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
      }
    },{
      type:'input',
      name:'displayName',
      message:'What is the display name of the field?',
      validate:(val)=>{
        return val && val.trim()?true:'Please provide a valid display name';
      },
      filter:(val)=>{
        field.displayName = val; 
        return val; 
      },
      default:(answers)=>{
        return field.displayName || answers.name;
      }
    },{
      type:'input',
      name:'group',
      message:'What is the group of the field?', 
      filter:(val)=>{
        field.group = val; 
        return val; 
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
      type:'confirm',
      name:'required',
      message:'Is this a required field?',
      field:(val)=>{
        field.required = val; 
        return val; 
      },
      default:()=>{
        if (typeof field.required !== "undefined"){
          return field.required;
        }
        return false;
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
      }
    },{
      type:'input',
      name:'choices', 
      when:(answers)=>{
        return answers.type === 'Choice' ||
          answers.type === 'MultiChoice'; 
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
      message:'Enter choices, seperate by semi-colon ";" e.g. Choice 1;Choice 2'
    },{
      type:'list',
      when:(answers)=>{
        return (answers.type === 'TaxonomyFieldType' ||
          answers.type === 'TaxonomyFieldTypeMulti') && 
          siteDefinition.termGroups && 
          siteDefinition.termGroups.length; 
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
          return (answers.type === 'TaxonomyFieldType' ||
            answers.type === 'TaxonomyFieldTypeMulti') &&
            siteDefinition.termGroups &&
            siteDefinition.termGroups.length && 
            group && 
            group.termSets &&
            group.termSets.length;
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
      type:'confirm',
      name:'mult',
      message:'Is it a multi field?',
      when:(answers)=>{
        return answers.type.toLowerCase().indexOf('multi') === -1; 
      },
      filter:(val)=>{
        field.mult = val; 
        return val; 
      },
      default:()=>{
        if (typeof field.mult !== "undefined"){
          return field.mult; 
        }else if (typeof field.multi !== "undefined"){
          return field.multi; 
        }else {
          return false; 
        }
      }, 
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
        return answers.type === 'DateTime' ||
          answers.type === 'Choice' ||
          answers.type === 'MultiChoice' ||
          answers.type === 'URL'; 
      }
    },{
      type:'confirm',
      name:'richText', 
      message:'Is it a rich text field?',
      when:(answers)=>{
        return answers.type === 'Note' ||
          answers.type === 'HTML'; 
      },
      default:()=>{
        if (typeof field.richText !== "undefined"){
          return field.richText; 
        }
        return true; 
      }, 
      filter:(val)=>{
        field.richText = val; 
        return val;
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
    },{
      type:'input',
      name:'default', 
      message:'What is the default value?',
      when:(answers)=>{
        return answers.provideDefault; 
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
        return answers.type === 'Lookup' ||
          answers.type === 'LookupMulti'; 
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
        return answers.type === 'Lookup' ||
          answers.type === 'LookupMulti'; 
      }
    },{
      type:'confirm',
      name:'indexed',
      message:'Is it an indexed field?',
      filter:(val)=>{
        field.indexed = val; 
        return val; 
      },
      default:()=>{
        if (typeof field.indexed !== "undefined"){
          return field.indexed; 
        }
      }, 

    },{
      type:'confirm', 
      name:'showInDisplayForm', 
      message:'Do you want to show the field in display form?',
      default:()=>{
        if (typeof field.showInDisplayForm !== "undefined"){
          return field.showInDisplayForm; 
        }
        return true; 
      }, 
    },{
      type:'confirm',
      name:'hidden',
      message:'Is it a hidden field?', 
      default:()=>{
        if (typeof field.hidden !== "undefined"){
          return field.hidden; 
        }
        return false; 
      }, 
    },{
      type:'confirm',
      name:'showInFileDlg', 
      message:'Do you want to show the field in file dialog?',
      default:()=>{
        if (typeof field.showInFileDlg !== "undefined"){
          return field.showInFileDlg; 
        }
        return true; 
      }, 
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
        return answers.type === 'Number' || 
          answers.type === 'Integer'; 
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
        return answers.type === 'Number' || 
          answers.type === 'Integer'; 
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
    }];
  
  return generator.prompt(prompts)
    .then((answers)=>{
        delete answers.provideDefault;
        if (!isEdit) {
          siteDefinition.fields.push(field);
        }
        // return configureSiteDefinition();
    });
};