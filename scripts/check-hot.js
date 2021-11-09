const { spawn, execSync } = require('child_process');
const COMPILE_TIMEOUT = 50*1000; // 50 s
const EXIT_TIMEOUT = 1*1000; // 1 s
const WEBPACK_PORT = 3001;

let prcOutBuf = Buffer.alloc(0);
let prcErrBuf = Buffer.alloc(0);
let isCompiled;
let timerCompile;

const prc = spawn('npm', ['run', 'examples']);

prc.stdout.on('data', (data) => {
  prcOutBuf = Buffer.concat([prcOutBuf, data]);
  check();
});

prc.stderr.on('data', (data) => {
  prcErrBuf = Buffer.concat([prcErrBuf, data]);
  check();
});

prc.on('exit', (code) => {
  end(`webpack exited with code ${code}`);
});

// Remove ANSI color from webpack output
const cleanStr = (str) => {
  //https://github.com/chalk/ansi-regex/blob/main/index.js
  const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');
  const regex = new RegExp(pattern, 'g');
  
  return str.replace(regex, '');
};

const startTimerCompile = () => {
  timerCompile = setTimeout(() => {
    end(`webpack compile timeout exceeded (${COMPILE_TIMEOUT/1000} s)`);
  }, COMPILE_TIMEOUT);
};

const stopTimerCompile = () => {
  if (timerCompile)
    clearTimeout(timerCompile);
  timerCompile = null;
};

const end = (err) => {
  stopTimerCompile();

  // Kill `npm run examples`
  prc.kill();

  // Kill webpack
  try {
    const webpack_pid = parseInt(execSync(`lsof -t -i tcp:${WEBPACK_PORT}`, {
      encoding: 'utf8'
    }));
    process.kill(webpack_pid);
  } catch(e) {
    console.error('Failed to kill webpack!', e);
  }

  // Print webpack out
  const prcOut = cleanStr(prcOutBuf.toString());
  const prcErr = cleanStr(prcErrBuf.toString());
  console.log('------------------ [ webpack out ]');
  console.log(prcOut);
  console.log('------------------ [ webpack err ]');
  console.log(prcErr);
  console.log('------------------');

  // Return 0 or 1
  if (err) {
    console.log(err);
    process.exit(1);
  } else {
    console.log("Seems like all right with webpack");
    process.exit(0);
  }
};

const check = () => {
  const prcOutClean = cleanStr(prcOutBuf.toString());
  
  if (prcOutClean.indexOf(' compiled with ') != -1) {
    isCompiled = false;
    stopTimerCompile();
    setTimeout(() => {
      end(`webpack failed to compile`);
    }, EXIT_TIMEOUT);
  }

  if (prcOutClean.indexOf(' compiled successfully in ') != -1) {
    isCompiled = true;
    stopTimerCompile();
    setTimeout(() => {
      end();
    }, EXIT_TIMEOUT);
  }
};

startTimerCompile();
