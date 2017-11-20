const validateGuid = require('./validateguid');
const generateGuid = require('./generateid');
function addTerm(generator, siteDefinition, termGroup, termSet, t) {
    var isEdit = t ? true : false;
    var term = t || { terms: [] };
    const prompts = [{
        type: 'input',
        name: 'id',
        validate: validateGuid,
        default: () => {
            return term.id || generateGuid();
        },
        filter: (val) => {
            term.id = val;
            return val;
        },
        when: () => {
            return !isEdit;
        },
        message: 'What is the Guid of the term?'
    }, {
        type: 'input',
        name: 'name',
        message: 'What is the name of the term?',
        default: () => {
            return term.name;
        },
        validate: (val) => {
            return val && val.trim() ? true : 'Please provide a valid term name';
        },
        filter: (val) => {
            term.name = val;
            return val;
        },
        when: () => {
            return !isEdit;
        }
    }, {
        type: 'list',
        name: 'action',
        message: 'What would you like to do next',
        choices: () => {
            var c = ['edit id', 'edit name', 'add custom property'];
            if (term.customProperties && Object.keys(term.customProperties).length > 0) {
                c.push('edit custom property', 'remove custom property');
            }
            c.push('add local custom property');
            if (term.localCustomProperties && Object.keys(term.localCustomProperties).length > 0) {
                c.push('edit local custom property', 'remove local custom property');
            }
            c.push('add child term');
            if ((term.terms && term.terms.length > 0)) {
                c.push(['edit child term', 'remove child term']);
            }
            if (termSet.isNavigation || termSet.targetUrl) {
                c.push('set link');
                c.push('set link title');
                c.push('set target URL');
            }
            c.push('back');
            return c;
        }
    }, {
        type: 'input',
        name: 'id',
        validate: validateGuid,
        default: () => {
            return term.id || generateGuid();
        },
        filter: (val) => {
            term.id = val;
            return val;
        },
        when: (answers) => {
            return answers.action === 'edit id';
        },
        message: 'What is the Guid of the term?'
    }, {
        type: 'input',
        name: 'name',
        message: 'What is the name of the term?',
        default: () => {
            return term.name;
        },
        validate: (val) => {
            return val && val.trim() ? true : 'Please provide a valid term name';
        },
        filter: (val) => {
            term.name = val;
            return val;
        },
        when: (answers) => {
            return answers.action === 'edit name';
        }
    }, {
        type: 'input',
        message: 'What is the link title?',
        default: () => {
            return term.linkTitle || term.name;
        },
        name: 'linkTitle',
        filter: (val) => {
            term.linkTitle = val;
            return val;
        },
        validate: (val) => {
            return val && val.trim() ? true : 'Please provide a valid link title';
        },
        when: (answers) => {
            return answers.action === 'set link title' ||
                answers.action === 'set link';
        }
    }, {
        type: 'link',
        message: 'What is the target URL?',
        default: () => {
            return term.targetUrl;
        },
        validate: (val) => {
            return val && val.trim() ? true : 'Please provide a valid target URL';
        },
        name: 'targetUrl',
        filter: (val) => {
            term.targetUrl = val;
            return val;
        },
        when: (answers) => {
            return answers.action === 'set target URL' ||
                answers.action === 'set link';
        }
    }, {
        type: 'list',
        name: 'property',
        message: (answers) => {
            return answers.action === 'edit custom property' || answers.action === 'edit local custom property' ?
                'Which custom property do you want to edit?' : 'Which custom property do you want to remove?';
        },
        choices: (answers) => {
            if (answers.action === 'edit custom property' ||
                answers.action === 'remove custom property') {
                return Object.keys(term.customProperties);
            } else {
                return Object.keys(term.localCustomProperties);
            }
        },
        when: (answers) => {
            return answers.action === 'edit custom property' ||
                answers.action === 'remove custom property' ||
                answers.action === 'edit local custom property' ||
                answers.action === 'remove local custom property';
        }
    }, {
        type: 'list',
        name: 'term',
        message: (answers) => {
            return answers.action === 'edit child term' ? 'Which child term do you want to edit?' : 'Which child term do you want to remove?';
        },
        when: (answers) => {
            return answers.action === 'edit child term' ||
                answers.action === 'remove child term';
        },
        choices: (answers) => {
            return term.terms.map(e => e.name);
        }
    }];
    var action = null;
    return generator.prompt(prompts)
        .then((answers) => {
            if (!isEdit) {
                termSet.terms = termSet.terms || [];
                termSet.terms.push(term);
            }
            action = answers.action;
            if (action === 'add custom property') {
                return addCustomProperty(generator, siteDefinition, term);
            } else if (action === 'edit custom property') {
                return addCustomProperty(generator, siteDefinition, term, answers.property);
            } else if (action === 'remove custom property') {
                delete term.customProperties[answers.property];
            } else if (action === 'add local custom property') {
                return addLocalCustomProperty(generator, siteDefinition, term);
            } else if (action === 'edit local custom property') {
                return addLocalCustomProperty(generator, siteDefinition, term, answers.property);
            } else if (action === 'remove local custom property') {
                delete term.localCustomProperties[answers.property];
            } else if (action === 'add child term') {
                term.terms = term.terms || [];
                return addTerm(generator, siteDefinition, termGroup, term);
            } else if (action === 'edit child term') {
                const tt = term.terms.find((e) => e.name === answers.term);
                return addTerm(generator, siteDefinition, termGroup, term, tt);
            } else if (action === 'remove child term') {
                term.terms = term.terms.filter(e => e.name !== answers.term);
            }
        })
        .then(() => {
            if (action !== 'back') {
                return addTerm(generator, siteDefinition, termGroup, termSet, term, true);
            }
        });
}

function addLocalCustomProperty(generator, siteDefinition, owner, k) {
    var isEdit = k ? true : false;
    var key = k;
    const prompts = [{
        type: 'input',
        name: 'key',
        message: 'What is the key of the local custom property?',
        when: () => {
            return !key ? true : false;
        },
        filter: (val) => {
            key = val;
            return val;
        },
        default: () => {
            return key;
        }
    }, {
        type: 'input',
        name: 'value',
        message: 'What is the value of the local custom property?',
        default: () => {
            return owner.localCustomProperties && owner.localCustomProperties[key];
        }
    }];
    return generator.prompt(prompts)
        .then((answers) => {
            owner.localCustomProperties = owner.localCustomProperties || {};
            owner.localCustomProperties[key] = answers.value;
        });
}

function addCustomProperty(generator, siteDefinition, owner, k) {
    var isEdit = k ? true : false;
    var key = k;
    const prompts = [{
        type: 'input',
        name: 'key',
        message: 'What is the key of the custom property?',
        when: () => {
            return !key ? true : false;
        },
        filter: (val) => {
            key = val;
            return val;
        },
        default: () => {
            return key;
        }
    }, {
        type: 'input',
        name: 'value',
        message: 'What is the value of the property?',
        default: () => {
            return owner.customProperties && owner.customProperties[key];
        }
    }];
    return generator.prompt(prompts)
        .then((answers) => {
            owner.customProperties = owner.customProperties || {};
            owner.customProperties[key] = answers.value;
        });
}
function addTermSet(generator, siteDefinition, termGroup, t) {
    var isEdit = t ? true : false;
    var termSet = t || { terms: [] };

    const prompts = [{
        type: 'input',
        name: 'name',
        validate: (val) => {
            return val && val.trim() ? true : 'Please provide a valid term set name'
        },
        message: 'What is the name of the term set?',
        filter: (val) => {
            termSet.name = val;
            return val;
        },
        default: () => {
            return termSet.name;
        },
        when: () => {
            return !isEdit;
        }
    }, {
        type: 'input',
        name: 'id',
        validate: validateGuid,
        filter: (val) => {
            termSet.id = val;
            return val;
        },
        message: 'What is the Guid of the term set?',
        default: () => {
            if (termSet.id) {
                return termSet.id;
            }
            return generateGuid();
        },
        when: () => {
            return !isEdit;
        }
    },{
        type:'confirm',
        name:'isNavigation', 
        message:'Is this is a navigation term set?',
        default:()=>{
            return termSet.isNavigation?true:false; 
        },
        when:(answers)=>{
            return !isEdit; 
        },
        filter:(val)=>{
            termSet.isNavigation = val;
            return val; 
        }
    }, {
        type: 'list',
        name: 'action',
        message: 'What would you like to do next?',
        choices: () => {
            var c = ['set termset for navigation','edit id', 'edit name', 'add custom property'];
            if (termSet.customProperties) {
                c.push('edit custom property', 'remove custom property');
            }
            c.push('add term');
            if (termSet.terms && termSet.terms.length) {
                c.push('edit term', 'remove term');
            }
            c.push('back');
            return c;
        },
        default: 'add term',
        }, {
            type: 'confirm',
            name: 'isNavigation',
            message: 'Is this is a navigation term set?',
            default: () => {
                return termSet.isNavigation ? true : false;
            },
            when: (answers) => {
                return answers.action === 'set navigation';
            },
            filter: (val) => {
                termSet.isNavigation = val;
                return val;
            }
        },{
        type: 'input',
        name: 'name',
        validate: (val) => {
            return val && val.trim() ? true : 'Please provide a valid term set name'
        },
        message: 'What is the name of the term set?',
        filter: (val) => {
            termSet.name = val;
            return val;
        },
        default: () => {
            return termSet.name;
        },
        when: (answers) => {
            return answers.action === 'edit name';
        }
    }, {
        type: 'input',
        name: 'id',
        validate: validateGuid,
        filter: (val) => {
            termSet.id = val;
            return val;
        },
        message: 'What is the Guid of the term set?',
        default: () => {
            if (termSet.id) {
                return termSet.id;
            }
            return generateGuid();
        },
        when: (answers) => {
            return answers.action === 'edit id';
        }
    }, {
        type: 'list',
        name: 'term',
        message: (answers) => { return (answers.action === 'edit term') ? `Which term do you want to edit?` : 'Which term do you want to remove?' },
        when: (answers) => {
            return (answers.action == 'edit term' ||
                answers.action === 'remove term');
        },
        choices: () => {
            return termSet.terms.map((e) => e.name);
        }
    }, {
        type: 'list',
        name: 'property',
        message: (answers) => { return (answers.action === 'edit custom property') ? 'Which property do you want to edit?' : 'Which property do you want to remove?' },
        when: (answers) => {
            return (answers.action === 'edit custom property' ||
                answers.action === 'remove custom property');
        },
        choices: () => {
            return Object.keys(termSet.customProperties);
        }
    }];
    var action = null;
    return generator.prompt(prompts)
        .then((answers) => {
            action = answers.action;
            if (!isEdit) {
                termGroup.termSets = termGroup.termSets || [];
                termGroup.termSets.push(termSet);
            }
            if (answers.action === 'add custom property') {
                return addCustomProperty(generator, siteDefinition, termSet);
            } else if (answers.action === 'edit custom property') {
                return addCustomProperty(generator, siteDefinition, termSet, answers.property);
            } else if (answers.action === 'remove custom property') {
                delete termSet.customProperties[answers.property];
            } else if (action === 'add term') {
                return addTerm(generator, siteDefinition, termGroup, termSet);
            } else if (action == 'edit term') {
                const term = termSet.terms.find((e) => { return e.name === answers.term });
                return addTerm(generator, siteDefinition, termGroup, termSet, term);
            } else if (action === 'remove term') {
                termSet.terms = termSet.terms.filter((e) => e.name !== answers.term);
            }
        })
        .then(() => {
            if (action !== 'back') {
                return addTermSet(generator, siteDefinition, termGroup, termSet);
            }
        });
}
function addTermGroup(generator, siteDefinition, g) {
    var isEdit = g ? true : false;
    var termGroup = g || {
        termSets: []
    };
    const prompts = [
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the term group?',
            validate: (val) => {
                return val && val.trim() ? true : 'Please provide a valid term group';
            },
            filter: (val) => {
                termGroup.name = val;
                return val;
            },
            default: () => {
                return termGroup.name;
            },
            when: () => {
                return !isEdit;
            }
        },
        {
            type: 'list',
            name: 'action',
            message: 'What do you want to do next?',
            choices: () => {
                var c = ['edit name', 'add term set'];
                if (termGroup.termSets && termGroup.termSets.length) {
                    c.push('edit term set', 'remove term set');
                }
                c.push('back');
                return c;
            }
        },
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the term group?',
            validate: (val) => {
                return val && val.trim() ? true : 'Please provide a valid term group';
            },
            filter: (val) => {
                termGroup.name = val;
                return val;
            },
            default: () => {
                return termGroup.name;
            },
            when: (answers) => {
                return answers.action === 'edit name';
            }
        },
        {
            type: 'list',
            name: 'termSet',
            message: 'Which term set do you want to edit?',
            choices: () => {
                return termGroup.termSets.map((e) => e.name);
            },
            when: (answers) => {
                return answers.action === 'edit term set' ||
                    answers.action === 'remove term set';
            }
        }
    ];
    var action = null;
    return generator.prompt(prompts)
        .then((answers) => {
            if (!isEdit) {
                siteDefinition.termGroups.push(termGroup);
            }
            action = answers.action;
            if (answers.action === 'add term set') {
                return addTermSet(generator, siteDefinition, termGroup);
            } else if (answers.action === 'edit term set') {
                let tset = termGroup.termSets.find((e) => {
                    return e.name === answers.termSet;
                });
                return addTermSet(generator, siteDefinition, termGroup, tset);
            } else if (answers.action === 'remove term set') {
                termGroup.termSets = termGroup.termSets.filter(e => e.name !== answers.termSet);
            }
        })
        .then(() => {
            if (action !== 'back') {
                return addTermGroup(generator, siteDefinition, termGroup);
            }
        });
}
module.exports = function configureTermStore(generator, siteDefinition) {
    const prompts = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: () => {
                var c = ['add term group'];
                if (siteDefinition.termGroups && siteDefinition.termGroups.length) {
                    c.push('edit term group', 'remove term group');
                }
                c.push('back');
                return c;
            }
        },
        {
            type: 'list',
            name: 'group',
            message: (answers) => { return answers.action === 'edit term group' ? 'Which term group do you want to edit?' : 'Which term group do you want to remove?' },
            choices: () => {
                return siteDefinition.termGroups.map(e => e.name);
            },
            when: (answers) => {
                return answers.action === 'edit term group' ||
                    answers.action === 'remove term group';
            }
        }
    ];

    var action = null;

    return generator.prompt(prompts)
        .then((answers) => {
            action = answers.action;
            if (action === 'add term group') {
                return addTermGroup(generator, siteDefinition);
            } else if (action === 'edit term group') {
                const group = siteDefinition.termGroups.find((e) => e.name === answers.group);
                return addTermGroup(generator, siteDefinition, group);
            } else if (action === 'remove term group') {
                siteDefinition.termGroups = siteDefinition.termGroups.filter(e => e.name !== answers.group);
            }
        })
        .then(() => {
            if (action !== 'back') {
                return configureTermStore(generator, siteDefinition);
            }
        });
}