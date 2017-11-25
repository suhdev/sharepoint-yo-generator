function configureSites(generator, siteDefinition) {
  const prompts = [
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'action',
      choices: () => {
        var c = ['add sub site'];
        if (siteDefinition.subsites && siteDefinition.subsites.length > 0) {
          c.push('edit sub site', 'remove sub site');
        }
        c.push('back');
        return c;
      }
    },
    {
      type: 'list',
      name: 'subsite',
      message: answers => {
        if (answers.action === 'edit sub site') {
          return 'Which site do you want to change?';
        }
        return 'Which site do you want to remove?';
      },
      choices: () => {
        return siteDefinition.subsites.map(e => {
          return {
            name: e.title,
            value: e.url
          };
        });
      }
    }
  ];
  return generator.prompt(prompts);
}

module.exports = configureSites;
