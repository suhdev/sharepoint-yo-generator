const generateId = require('./generateid'); 
module.exports = function(siteDefinition,field){
    return [{
      type:'input',
      name:'id',
      message:'What is the GUID of the field?',
      default:()=>{
        if (field.id){
          return field.id; 
        }
        return generateId();
      }
    },{
      type:'input',
      name:'name',
      message:'What is the name of the field?',
      validate:(val)=>{
        return (!(/[\s]+/.test(val)) && val && val.trim())?true:false;
      },
      default:()=>{
        return field.name;
      }
    },{
      type:'input',
      name:'description',
      message:'Provide a description for the field.',
      default:(answers)=>{
        return field.description || `Content for field ${answers.name}`;
      }
    },{
      type:'input',
      name:'displayName',
      message:'What is the display name of the field?',
      default:(answers)=>{
        return field.displayName || answers.name;
      }
    },{
      type:'input',
      name:'group',
      message:'What is the group of the field?', 
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
      type:'confirm',
      name:'mult',
      message:'Is it a multi field?',
      when:(answers)=>{
        return answers.type.toLowerCase().indexOf('multi') === -1; 
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
      },
      filter:(val)=>{
        return val === "None"?undefined:val; 
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
          return parseFloat(val); 
        }
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
      when:(answers)=>{
        return answers.type === 'Lookup' ||
          answers.type === 'LookupMulti'; 
      }
    },{
      type:'confirm',
      name:'indexed',
      message:'Is it an indexed field?',
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
};