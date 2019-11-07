const program = require('commander');
const lineReader = require('line-reader');
const fs = require('fs');

const ERROR_MESSAGE = 'error';
const COMMAND_CONSTANTS = { ADD: 'add', SUB: 'sub', MUL: 'mul', DIV: 'div', SET: 'set', RUN: 'run' };

// cache value by result from a previous command or set command
let $ = 0;
let prevArguments = {};

// handling action read file
program
  .arguments('<file>')
  .action(file => {
    readFile(file);
  });

// parsing arguments from command
program.parse(process.argv);

// reading file line by line
function readFile(file) {
  // in case command run file have to print line by line synchornous => return promise;
  return new Promise(resolve => {
    lineReader.eachLine(file, async function (line, last, done) {
      // waiting line done execute
      await parsingAndExecCommand(line);
      // stopping read line
      done();
      // if reading file completed => resolve promise;
      if (last) {
        console.log(`res: ${$}`);
        resolve();
      }
    });
  });
}

// parsing line content and execute command
async function parsingAndExecCommand(line) {
  if (line) {
    //parsing line content to command and arguments
    const lineContents = line.split(' ');
    if (lineContents) {
      const cmd = lineContents[0];
      // execute command
      switch (cmd) {
        case COMMAND_CONSTANTS.ADD:
          calAdd(lineContents[1], lineContents[2]);
          break;

        case COMMAND_CONSTANTS.SUB:
          calSub(lineContents[1], lineContents[2]);
          break;

        case COMMAND_CONSTANTS.MUL:
          calMul(lineContents[1], lineContents[2]);
          break;

        case COMMAND_CONSTANTS.DIV:
          calDiv(lineContents[1], lineContents[2]);
          break;

        case COMMAND_CONSTANTS.SET:
          calSet(lineContents[1], lineContents[2]);
          break;

        case COMMAND_CONSTANTS.RUN:
          const filePath = lineContents[1];
          try {
            //check file exist
            await fs.promises.access(filePath);
            // await print line by line sync
            await readFile(filePath);
          } catch (error) {
            console.log(ERROR_MESSAGE);
          }
          break;

        default:
          console.log(ERROR_MESSAGE);
          break;
      }
    } else {
      console.log(ERROR_MESSAGE);
    }
  } else {
    console.log(ERROR_MESSAGE);
  }
}

// get value of argument
function getValueFromArgument(arg) {
  if (!isNaN(arg)) {
    return Number(arg);
  }

  if (arg === '$') {
    return Number($);
  }

  // if argument is variable and existed in cache -> return cache value
  // else return 0
  return prevArguments[arg] ? Number(prevArguments[arg]) : 0;
}

// caculate add command, arg1 + arg2
function calAdd(arg1, arg2) {
  $ = getValueFromArgument(arg1) + getValueFromArgument(arg2);
  console.log(`res: ${$}`);
}

// caculate sub command, // arg1 - arg2
function calSub(arg1, arg2) {
  $ = getValueFromArgument(arg1) - getValueFromArgument(arg2);
  console.log(`res: ${$}`);
}

// caculate mul command, // arg1 x arg2
function calMul(arg1, arg2) {
  $ = getValueFromArgument(arg1) * getValueFromArgument(arg2);
  console.log(`res: ${$}`);
}

// caculate div command, // floor(arg1 / arg2)
function calDiv(arg1, arg2) {
  if (getValueFromArgument(arg2)) {
    $ = Math.floor(getValueFromArgument(arg1) / getValueFromArgument(arg2));
    console.log(`res: ${$}`);
  } else {
    console.log(ERROR_MESSAGE);
  }
}

// set command, $ = arg1 = value of agr2
function calSet(arg1, arg2) {
  $ = prevArguments[arg1] = getValueFromArgument(arg2);
  console.log(`res: ${$}`);
}
