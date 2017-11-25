module.exports = function configureColorPalette(generator,config,siteDefinition){
    const prompts = [
        {
            type: 'input',
            name: 'name',
            validate(val) {
                return val && val.trim() ? true : 'Please provide a valid file';
            },
            message: 'What is the name of the color palette file?'
        }
    ];
    return generator.prompt(prompts).then(answers => {
        generator.fs.copyTpl(
            generator.templatePath(
                path.resolve(
                    __dirname,
                    '../../node_modules/sharepoint-util/templates/palette.spcolor.ejs'
                )
            ),
            generator.destinationPath(
                path.resolve(
                    generator._cfg.resourcesDir,
                    answers.name.endsWith('.spcolor') ? answers.name : answers.name + '.spcolor'
                )
            ),
            {
                config: generator._cfg
            }
        );
    });
}