const JiraClient = require('jira-connector');
const path = require('path'); 
const fs = require('fs'); 
const os = require('os'); 
const request = require('request'); 
const FileCookieStore = require('tough-cookie-filestore'); 

function getJiraClient(host){
   
    
}
module.exports = function configureJira(generator,config){
    let client = null; 
    let jiraProjects = []; 
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
    
    let auth = {}; 
    const prompts = [{
        type:'list',
        name:'action',
        message:'What would you like to do next?',
        choices(){
            var c = ['setup jira account']; 
            c.push('back'); 
            return c;
        }
    },{
        type:'input',
        name:'host',
        message:'Please specify the JIRA host i.e. mycompany.atlassian.net',
        filter(val){
            config.jira = config.jira || {};
            config.jira.host = val;
            return val; 
        },
        default(){
            return config.jira && config.jira.host; 
        },
        when(answers){
            return answers.action === 'setup jira account'; 
        }
    },{
        type:'input',
        name:'username', 
        message:'Please enter your username:',
        filter(val){
            auth.username = val.trim();
            return val;  
        },
        validate(val){
            return val && val.trim()?true:"Please provide a valid username"; 
        },
        when(answers){
            return answers.action === 'setup jira account'; 
        }
        }, {
            type: 'password',
            name: 'password',
            message: 'Please enter your password:',
            filter(val) {
                auth.password = val; 
                return val; 
            },
            when(answers) {
                return answers.action === 'setup jira account';
            }
    },{
        type:'list',
        name:'project',
        message:'Which project do you want to use?', 
        filter(val){
            config.jira = config.jira || {};
            config.jira.project = jiraProjects.find((e)=>{
                return e.name === val;
            });
            return val; 
        },
        when(answers){
            return answers.action === 'setup jira account'; 
        },
        choices(){
            let jiraClient = new JiraClient({
                host: config.jira.host,
                request,
                cookie_jar:jar
            });
            return jiraClient.auth.login(auth)
            .then((result)=>{
                return jiraClient.project.getAllProjects({});
            })
            .then((result) => {
                jiraProjects = result;
                return result.map(e => e.name);
            });
        }
    }];
    return generator.prompt(prompts)
        .then((answers)=>{
            generator.config.set(config);
            generator.config.save(); 
        });
}