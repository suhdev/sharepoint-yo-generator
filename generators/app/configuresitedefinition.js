module.exports = function(siteDefinition){
    return [{
      type:'list',
      name:'definitionAction',
      message:'What do you want to do?',
      choices:['add a field',
      'edit a field', 
      'remove a field', 
      'add a content type', 
      'edit a content type',
      'remove a content type', 
      'add a list', 
      'edit a list',
      'remove a list',
      'add a term group',
      'edit a term group',
      'remove a term group',
      'exit']
    },{
      type:'list',
      name:'fieldName', 
      message:'Which field do you want to edit?', 
      choices:()=>{
        if (siteDefinition.fields.length === 0){
          return ['New']; 
        }
        return ['New',...siteDefinition.fields.map((e)=>e.name)]; 
      },
      when:(answers)=>{
        return answers.definitionAction === 'edit a field'; 
      }
    },{
      type:'list',
      name:'contentTypeName',
      message:'Which content type do you want to edit?',
      choices:()=>{
        if (siteDefinition.contentTypes.length === 0){
          return ['New']; 
        }
        return ['New',...siteDefinition.contentTypes.map((e)=>e.name)]; 
      },
      when:(answers)=>{
        return answers.definitionAction === 'edit a content type';
      }
    },{
      type:'list',
      name:'listTitle',
      message:'Which list do you want to edit?',
      choices:()=>{
        if (siteDefinition.lists.length === 0){
          return ['New']; 
        }
        return ['New',...siteDefinition.lists.map((e)=>e.title)]; 
      },
      when:(answers)=>{
        return answers.definitionAction === 'edit a list';
      }
    },{
      type:'list',
      name:'removeField', 
      message:'Which field do you want to remove?', 
      choices:()=>{
        return siteDefinition.fields.map(e=>e.name); 
      },
      filter:(val)=>{
        siteDefinition.fields = siteDefinition.fields.filter((e)=>{
          return e.name === val; 
        });
      },
      when:(answers)=>{
        return answers.definitionAction === 'remove a field'; 
      }
    },{
      type:'list',
      name:'removeContentType', 
      message:'Which content type do you want to remove?', 
      choices:()=>{
        return siteDefinition.contentTypes.map(e=>e.name); 
      },
      filter:(val)=>{
        siteDefinition.contentTypes = siteDefinition.contentTypes.filter((e)=>{
          return e.name === val; 
        });
      },
      when:(answers)=>{
        return answers.definitionAction === 'remove a content type'; 
      }
    }];
}