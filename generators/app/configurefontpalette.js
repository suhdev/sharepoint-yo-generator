module.exports = function configureFontPalette(generator,config,siteDefinition){
    const prompts = [
        {
            type: 'input',
            name: 'name',
            validate(val) {
                return val && val.trim() ? true : 'Please provide a valid file';
            },
            message: 'What is the name of the font palette file?'
        }
    ];
    return generator.prompt(prompts).then(answers => {
        generator.fs.copyTpl(
            generator.templatePath(
                path.resolve(
                    __dirname,
                    '../../node_modules/sharepoint-util/templates/default.spfont'
                )
            ),
            generator.destinationPath(
                path.resolve(
                    generator._cfg.resourcesDir,
                    answers.name.endsWith('.spfont') ? answers.name : answers.name + '.spfont'
                )
            ),
            {
                config: generator._cfg
            }
        );
    });
}