const fs = require('fs');
const path = require('path');
const addPrototype = require('./addprototype');
function readPrototypesRecursively(prototypeTemplatesDir, prototypes) {
  if (fs.existsSync(prototypeTemplatesDir)) {
    var files = fs.readdirSync(prototypeTemplatesDir);
    var directories = [];
    files = files
      .filter(e => {
        var stats = fs.lstatSync(path.resolve(prototypeTemplatesDir, e));
        if (stats.isDirectory()) {
          directories.push(e);
          return false;
        }
        return path.extname(e) === '.njk' || path.extname(e) === '.html';
      })
      .map(file => {
        var p = {
          name: path.basename(file)
        };
        if (
          fs.existsSync(
            path.resolve(
              prototypeTemplatesDir,
              path.basename(file, path.extname(file)) + '.json'
            )
          )
        ) {
          try {
            p = Object.assign(
              {},
              p,
              require(path.resolve(
                prototypeTemplatesDir,
                path.basename(file, path.extname(file)) + '.json'
              ))
            );
            p.definitionFullPath = path.resolve(
              prototypeTemplatesDir,
              path.basename(file, path.extname(file)) + '.json'
            );
          } catch (err) {
            console.log(
              `An error has occured while getting prototype definition file: ${
                err.message
              }`
            );
          }
        }
        p.fileName = path.basename(file);
        p.fullPath = path.resolve(prototypeTemplatesDir, file);
        return p;
      });
    prototypes.push(...files);
    if (directories.length) {
      directories.forEach(dir => {
        readPrototypesRecursively(path.resolve(prototypeTemplatesDir, dir), prototypes);
      });
    }
  }
  return prototypes;
}
module.exports = function configurePrototypes(generator, config) {
  var prototypes = [];
  var sourceFiles = [];
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
  var srcFile = null;
  readPrototypesRecursively(
    path.resolve(generator.destinationPath(config.prototypeTemplatesDir)),
    prototypes
  );
  const prompts = [
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do next?',
      choices: () => {
        var c = ['set prototype server url', 'create prototype'];
        if (prototypes.length) {
          c.push('edit prototype');
          c.push('remove prototype');
        }

        c.push('back');
        return c;
      }
    },
    {
      type: 'input',
      name: 'prototypeServerUrl',
      message: 'What is the prototype server url? e.g. http://mywebsite.com/api',
      filter(val) {
        config.prototypeServerUrl = val.trim();
        return val;
      },
      validate(val) {
        var v = val && val.trim();
        if (v) {
          if (!v.startsWith('http')) {
            return 'Please provide a valid URL including the protocol e.g. http://mywebsite.com/api';
          }
          return true;
        }
        return 'Please provide a valid a URL e.g. http://mywebsite.com/api';
      },
      default: () => {
        return config.prototypeServerUrl;
      },
      when(answers) {
        return answers.action === 'set prototype server url';
      }
    },
    {
      type: 'list',
      name: 'protoName',
      message: answers => {
        return answers.action === 'remove prototype'
          ? 'Which prototype do you want to delete?'
          : 'Which prototype do you want to edit?';
      },
      when(answers) {
        return (
          answers.action === 'remove prototype' || answers.action === 'edit prototype'
        );
      },
      choices: () => {
        return prototypes.map(e => {
          return {
            name: `${e.name}: ${e.fullPath}`,
            value: e.fullPath
          };
        });
      }
    },
    {
      type: 'confirm',
      name: 'deleteDir',
      message: answers => {
        const pp = prototypes.find(e => e.fullPath === answers.protoName);
        const dir = path.dirname(pp.fullPath);
        return `Do you want to delete the prototype directory at ${dir}?`;
      },
      when(answers) {
        return answers.action === 'remove prototype';
      },
      default: answers => {
        return (
          path.basename(answers.protoName) ===
          path
            .dirname(answers.protoName)
            .split(path.sep)
            .pop()
        );
      }
    },
    {
      type: 'confirm',
      name: 'deleteSrc',
      message: answers => {
        return `Do you want to delete the typescript source  ${srcFile}?`;
      },
      when(answers) {
        if (answers.action !== 'remove prototype') {
          return false;
        }
        const srcPath = path.resolve(
          config.srcDir,
          './prototypes',
          path.basename(answers.protoName, '.ts')
        );
        let srcFile = fs.existsSync(srcPath)
          ? srcPath
          : fs.existsSync(srcPath + 'x') ? srcPath + 'x' : false;
        return answers.action === 'remove prototype' && srcFile;
      },
      default: false
    }
  ];
  let action = null;

  return generator
    .prompt(prompts)
    .then(answers => {
      action = answers.action;
      if (action === 'set prototype server url') {
        generator.config.set(config);
        generator.config.save();
      } else if (action === 'create prototype') {
        return addPrototype(generator, config);
      } else if (action === 'edit prototype') {
        const p = prototypes.find(e => e.fullPath === answers.protoName);
        return addPrototype(generator, config, p);
      } else if (action === 'remove prototype') {
        const p = prototypes.find(e => e.fullPath === answers.protoName);
        try {
          if (p.fullPath) {
            fs.unlink(p.fullPath);
          }
          if (p.definitionFullPath) {
            fs.unlink(p.definitionFullPath);
          }
          if (answers.deleteDir) {
            fs.rmdirSync(path.dirname(p.fullPath));
          }
          if (answers.deleteSrc && srcFile) {
            fs.unlink(srcFile);
          }
        } catch (err) {
          console.log(
            `An error has occured while deleting prototype ${p.name}: ${err.message}`
          );
        }
      }
    })
    .then(() => {
      if (action !== 'back') {
        return configurePrototypes(generator, config);
      }
    });
};
