const { spawn } = require('child_process');
const COMPILE_TIMEOUT = 30*1000; // 30 s
const EXIT_TIMEOUT = 1*1000; // 1 s

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

const cleanStr = (str) => {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, 
    ''
  );
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

  prc.kill();

  const prcOut = prcOutBuf.toString();
  const prcErr = prcErrBuf.toString();
  console.log('------------------ [ webpack out ]');
  console.log(prcOut);
  console.log('------------------ [ webpack err ]');
  console.log(prcErr);
  console.log('------------------');

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
  
  if (prcOutClean.indexOf('｢wdm｣: Failed to compile.') != -1) {
    isCompiled = false;
    stopTimerCompile();
    setTimeout(() => {
      end(`webpack failed to compile`);
    }, EXIT_TIMEOUT);
  }
  if (prcOutClean.indexOf('｢wdm｣: Compiled successfully.') != -1) {
    isCompiled = true;
    stopTimerCompile();
    setTimeout(() => {
      end();
    }, EXIT_TIMEOUT);
  }
};

startTimerCompile();
