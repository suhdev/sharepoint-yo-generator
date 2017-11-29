var JiraClient = require('jira-connector');
const path = require('path'); 
const os = require('os'); 
const FileCookieStore = require('tough-cookie-file-store'); 
const fs = require('fs'); 
const request = require('request'); 
module.exports = function addTodo(generator,config,todos,todoGroups,td){
    let isEdit = td?true:false; 
    let todo = td || {
        id:+new Date(),
        status:'Pending', 
        priority:'Medium', 
        created:+new Date(),
        updated:+new Date(), 
        started:0, 
        completed:0, 
    };
    let jiraProjects = []; 
    let jiraComponents = []; 
    let auth = {}; 
    const filePath = path.resolve(os.homedir(), '.gsacookie');
    let cookieExists = true;
    if (!fs.existsSync(filePath)) {
        cookieExists = false;
        fs.writeFileSync(filePath, '');
    }
    let jar = request.jar(new FileCookieStore(filePath));
    request.defaults({
        jar
    });
    let jiraClient = config.jira ?new JiraClient({
        host: config.jira.host,
        cookie_jar:jar,
        request
    }):null;

    const prompts = [
        {
            type:'list',
            name:'action',
            message:'What would you like to do next?', 
            choices(){
                let c = [
                    'set content',
                    'set status',
                    'set priority',
                    'set jira ticket', 
                    'mark as pending',
                    'mark as in progress',
                    'mark as completed'
                ]; 
                if (todoGroups && todoGroups.length){
                    c.splice(2,0,'set group'); 
                }
                c.push('back'); 
                return c; 
            },
            when(){
                return isEdit; 
            }
        },
        {
            type:'input',
            name:'content', 
            message:'What is the todo content?',
            when(answers){
                return !isEdit || answers.action === 'set content'; 
            },
            filter(val){
                todo.content = val.trim(); 
                todo.updated = +new Date(); 
                return val; 
            },
            default(){
                return todo.content; 
            },
            validate(val){
                return val && val.trim()?true:'Please provide a valid todo'; 
            }
        },
        {
            type:'list', 
            name:'status',
            message:'What is the status of the todo?',
            choices(){
                return [
                    'Pending',
                    'In Progress',
                    'Completed'
                ];
            },
            filter(val){
                if (val === 'In Progress'){
                    todo.started = +new Date(); 
                }else if (val === 'Completed'){
                    todo.completed = +new Date(); 
                }
                todo.updated = +new Date();
                todo.status = val; 
                return val; 
            },
            default(){
                return todo.status; 
            },
            when(answers){
                return answers.action === 'set status'; 
            }
        },{
            type: 'list',
            name: 'priority',
            message: 'What is the priority level of the todo?',
            choices() {
                return [
                    'Low',
                    'Medium',
                    'High'
                ];
            },
            filter(val) {
                todo.priority = val;
                todo.updated = +new Date();
                return val;
            },
            default() {
                return todo.priority;
            },
            when(answers) {
                return answers.action === 'set priority';
            }
        },
        {
            type:'list',
            name:'group',
            message:'What is the group of the todo?', 
            choices(){
                return todoGroups.map(e=>e.name); 
            },
            when(answers){
                return todoGroups && todoGroups.length?!isEdit || answers.action === 'set group':false; 
            },
            default(val){
                return todo.group; 
            },
            filter(val){
                todo.updated = +new Date();
                todo.group = todoGroups.find((e)=>{
                    return e.name === val; 
                }).name;
            }
        },
        {
            type:'confirm',
            name:'setupJira',
            message:'Do you want to add a JIRA issue?',
            default:false, 
            when(answers){
                return !isEdit;
            }
        },{
            type:'input',
            name:'host',
            message:'Please enter your Jira hostname i.e. mycompany.atlassian.net',
            filter(val){
                config.jira = config.jira || {};
                config.jira.host = val.trim(); 
                return val;
            },
            when(answers){
                return ((!isEdit && answers.setupJira && !cookieExists) || (answers.action === 'set jira ticket' && !cookieExists)) && (!config.jira || !config.jira.host) ; 
            },
        },{
            type:'input', 
            name:'username',
            message:'Please enter your JIRA username',
            filter(val){
                auth.username = val.trim(); 
                return val; 
            },
            when(answers){
                return (!isEdit && answers.setupJira && !cookieExists) || (answers.action === 'set jira ticket' && !cookieExists); 
            }
        },
        {
            type:'password',
            name:'password', 
            message:'Please specify your JIRA password?',
            filter(val){
                auth.password = val; 
                return val; 
            },
            when(answers){
                return (!isEdit && answers.setupJira && !cookieExists) || (answers.action === 'set jira ticket' && !cookieExists); 
            }
        },{
            type:'list',
            name:'jiraProject', 
            message:'Which project do you want to use?',
            filter(val){
                config.jira = config.jira || {};
                config.jira.project = jiraProjects.find((e)=>{
                    return e.name === val; 
                });
            },
            choices(){
                if (!jiraClient){
                    jiraClient = new JiraClient({
                        host:config.jira.host, 
                        cookie_jar:jar,
                        request,
                    });
                }
                return jiraClient.auth.login(auth)
                    .then((e)=>{
                        return project.getAllProjects({});
                    })
                    .then((result)=>{
                        jiraProjects = result; 
                        return result.map((e)=>e.name); 
                    });
            },
            when(answers){
                return ((!isEdit && answers.setupJira) || answers.action === 'set jira ticket') && (!config.jira || !config.jira.project); 
            }
        },{
            type:'list',
            name:'jiraComponent', 
            message:'Which component do you want to use?',
            filter(val){
                todo.updated = +new Date();
                todo.jiraComponent = val;
                return val; 
            },
            when(answers){
                return ((!isEdit && answers.setupJira) || answers.action === 'set jira ticket'); 
            },
            choices(){
                if (!jiraClient){
                    jiraClient = new JiraClient({
                        host: config.jira && config.jira.host,
                        basic_auth:auth
                    });
                }
                return jiraClient.project.getComponents({
                        projectIdOrKey:config.jira.project.key,
                    }).then((result)=>{
                        jiraComponents = result; 
                        return result.map(e=>e.name);
                    });
            
            },
            default(){
                return todo.jiraComponent; 
            }
        },{
            type:'list', 
            name:'jiraIssue', 
            message:'Which issue do you want to use?',
            filter(val){
                todo.updated = +new Date();
                todo.jiraIssue = jiraIssues.find((e)=>{
                    return e.key === val;
                }); 
                return val; 
            },
            choices(answers){
                if (!jiraClient){
                    jiraClient = new JiraClient({
                        host: config.jira && config.jira.host,
                        basic_auth: auth
                    });
                }
                return jiraClient.search.search({
                    jql:`project = ${config.jira.project.key} AND component = "${answers.jiraComponent}"`
                })
                .then((result)=>{
                    jiraIssues = result.issues || []; 
                    jiraIssues = jiraIssues.filter((e)=>{
                        return e.fields.project.key === config.jira.project.key; 
                    })
                    return jiraIssues.map(e=>{return {name:`${e.key}: ${e.fields.summary}`,value:e.key}});
                });
            },
            when(answers){
                return (!isEdit && answers.setupJira) || answers.action === 'set jira ticket';
            },
            default(){
                return todo.jiraIssue; 
            }
        }
    ]; 

    let action = null; 
    return generator.prompt(prompts)
        .then((answers)=>{
            if (!isEdit){
                todos.push(todo); 
            }
            action = answers.action; 
        })
        .then(()=>{
            if (action !== 'back'){
                return addTodo(generator,config,todos,todoGroups,todo); 
            }
        });
}