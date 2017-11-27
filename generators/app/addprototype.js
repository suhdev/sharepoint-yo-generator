const path = require('path');
const fs = require('fs');
function fileNameWithoutExtension(filename) {
  return path.basename(filename, path.extname(filename));
}
module.exports = function addPrototype(generator, config, p, isNew) {
  var isEdit = Boolean(p);
  let sourceFiles = [];
  try {
    var fsExists = fs.existsSync(
      path.resolve(generator.destinationPath(config.srcDir), './prototypes')
    );
    if (!fsExists) {
      generator.fs.write(
        path.resolve(generator.destinationPath(config.srcDir), './prototypes/.gitkeep'),
        ''
      );
    }
    if (fsExists) {
      var files = fs.readdirSync(
        path.resolve(generator.destinationPath(config.srcDir), './prototypes')
      );
      sourceFiles = files.filter(e => {
        return path.extname(e) === 'ts' || path.extname(e) === 'tsx';
      });
    }
  } catch (err) {
    console.log(`Could not read prototypes directory content: ${err.message}`);
  }
  var pr = p || {};
  const prompts = [
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do next?',
      choices() {
        return [
          'set name',
          'set description',
          'set subtitle',
          'set typescript source file',
          'set status'
        ];
      },
      when() {
        return isEdit && !isNew;
      }
    },
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the prototype?',
      validate(val) {
        return val && val.trim() ? true : 'Please provide a valid prototype name';
      },
      filter(val) {
        pr.name = val.trim();
        return val;
      },
      default: () => {
        return pr.name || 'Prototype 1';
      },
      when(answers) {
        return answers.action === 'set name' || !isEdit || isNew;
      }
    },
    {
      type: 'input',
      name: 'fileName',
      message: 'What is the file name of the prototype?',
      filter(val) {
        pr.fileName = val;
        pr.baseName = path.basename(pr.fileName, path.extname(pr.fileName));
        return val;
      },
      validate(val) {
        if (!val || !val.trim()) {
          return 'Please enter a valid file name';
        }
        var n = val.endsWith('.njk') || val.endsWith('.html') ? val : val + '.njk';
        if (
          fs.existsSync(
            path.resolve(generator.destinationPath(config.prototypeTemplatesDir), n)
          )
        ) {
          return 'Another prototype with the same file name exists, please choose a different name';
        }
        return val && val.trim() ? true : 'Please provide a valid name?';
      },
      default: () => {
        return (
          pr.fileName ||
          (pr.name &&
            pr.name
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .toLowerCase()
              .replace(/[\s]+/g, '-') + '.njk')
        );
      },
      when(answers) {
        return answers.action === 'set file name' || !isEdit || isNew;
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'What is the description of the prototype?',
      filter(val) {
        pr.description = val.trim();
        return val;
      },
      validate(val) {
        return val && val.trim() ? true : 'Please provide a valid description';
      },
      default() {
        return pr.description || `Description for ${pr.name}`;
      },
      when(answers) {
        return answers.action === 'set description' || !isEdit || isNew;
      }
    },
    {
      type: 'input',
      name: 'subtitle',
      message: 'What is the subtitle of the prototype?',
      filter(val) {
        pr.subtitle = val.trim();
        return val;
      },
      validate(val) {
        return val && val.trim() ? true : 'Please provide a valid subtitle';
      },
      default() {
        return pr.subtitle || `Subtitle for ${pr.name}`;
      },
      when(answers) {
        return answers.action === 'set subtitle' || !isEdit || isNew;
      }
    },
    {
      type: 'list',
      name: 'srcFile',
      message: 'What is the TypeScript source file name?',
      choices: () => {
        return sourceFiles;
      },
      filter(val) {
        pr.srcFile = path.resolve(
          generator.destinationPath(config.srcDir),
          './prototypes/' + val
        );
        pr.baseName = path.basename(pr.srcFile, path.extname(pr.srcFile));
        return val;
      },
      when(answers) {
        return answers.action === 'set typescript source file' && isEdit;
      }
    },
    {
      type: 'list',
      name: 'status',
      filter(val) {
        pr.status = val;
        return val;
      },
      choices() {
        return ['Pending', 'In Progress', 'Done'];
      },
      message: 'What is the status of the prototype?',
      when(answers) {
        return !isEdit || answers.action === 'set status' || isNew;
      }
    }
  ];
  return generator.prompt(prompts).then(() => {
    pr.srcFile = fileNameWithoutExtension(pr.fileName) + '.tsx';
    pr.baseName = path.basename(pr.fileName, path.extname(pr.fileName));
    delete pr.isNew;
    if (
      !isEdit ||
      !fs.existsSync(
        generator.destinationPath(
          config.prototypeTemplatesDir,
          fileNameWithoutExtension(pr.fileName),
          pr.fileName
        )
      )
    ) {
      generator.fs.copyTpl(
        path.resolve(
          __dirname,
          '../../node_modules/sharepoint-util/templates/prototype.ejs'
        ),
        path.resolve(
          generator.destinationPath(config.prototypeTemplatesDir),
          fileNameWithoutExtension(pr.fileName),
          pr.fileName
        ),
        pr
      );
    }
    if (
      !isEdit ||
      (!fs.existsSync(
        path.resolve(
          generator.destinationPath(config.srcDir),
          './prototypes',
          fileNameWithoutExtension(pr.fileName) + '.tsx'
        )
      ) &&
        !fs.existsSync(
          path.resolve(
            generator.destinationPath(config.srcDir),
            './prototypes',
            fileNameWithoutExtension(pr.fileName) + '.ts'
          )
        ))
    ) {
      if (pr.type === 'controller') {
        generator.fs.copyTpl(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/templates/controllerprototype.njk.ejs'
          ),
          path.resolve(
            generator.destinationPath(config.srcDir),
            './prototypes',
            fileNameWithoutExtension(pr.fileName) + '.tsx'
          ),
          {
            component: pr
          }
        );
      } else if (pr.type === 'mobx-controller') {
        generator.fs.copyTpl(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/templates/mobxcontrollerprototype.njk.ejs'
          ),
          path.resolve(
            generator.destinationPath(config.srcDir),
            './prototypes',
            fileNameWithoutExtension(pr.fileName) + '.tsx'
          ),
          {
            component: pr
          }
        );
      } else if (pr.type === 'component' || pr.type === 'mobx-component') {
        generator.fs.copyTpl(
          path.resolve(
            __dirname,
            '../../node_modules/sharepoint-util/templates/componentprototype.njk.ejs'
          ),
          path.resolve(
            generator.destinationPath(config.srcDir),
            './prototypes',
            fileNameWithoutExtension(pr.fileName) + '.tsx'
          ),
          {
            component: pr
          }
        );
      } else {
        generator.fs.write(
          path.resolve(
            generator.destinationPath(config.srcDir),
            './prototypes',
            fileNameWithoutExtension(pr.fileName) + '.tsx'
          ),
          ''
        );
      }
    }
    if (
      !isEdit ||
      !fs.existsSync(
        path.resolve(
          generator.destinationPath(config.sassDir),
          './prototypes',
          fileNameWithoutExtension(pr.fileName) + '.scss'
        )
      )
    ) {
      generator.fs.write(
        path.resolve(
          generator.destinationPath(config.sassDir),
          './prototypes',
          fileNameWithoutExtension(pr.fileName) + '.scss'
        ),
        ''
      );
    }
    generator.fs.writeJSON(
      generator.destinationPath(
        config.prototypeTemplatesDir,
        fileNameWithoutExtension(pr.fileName),
        fileNameWithoutExtension(pr.fileName) + '.json'
      ),
      pr
    );
  });
};
