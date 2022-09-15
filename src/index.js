const fs = require('fs');
const path = require('path');
const symbols = require('log-symbols');
const root = process.cwd();


const NPM_TOKEN = 'NPM_TOKEN';
let ENV_FILE = '.env.local';
const NPM_RC_TPL = `registry=https://registry.npmjs.org/
//registry.npmjs.org/:always-auth=true
//registry.npmjs.org/:_authToken={{TOKEN}}`;
const TOKEN_KEY = '{{TOKEN}}';

function getKeyValue(key, sourceLine) {
  let result;
  let ma;
  const re = new RegExp(`${key}\\s*=\\s*(.*?)(\\s|$)`);
  for (const line of sourceLine) {
    if (line.startsWith('#')) {
      // 忽略注释行
      continue;
    }
    ma = line.match(re);
    if (ma) {
      result = ma[1] || '';
      break;
    }
  }
  return result;
}

// 获取模块名称
function readEnv(key, filepath) {
  if (!fs.lstatSync(filepath)) {
    console.log('文件不存在:', filepath, '，请先创建文件');
    process.exit(1);
  }
  try {
    const sourceStr = fs.readFileSync(filepath, 'utf-8');
    const sourceLine = sourceStr.split('\n');
    return getKeyValue(key, sourceLine);
  } catch (e) {
    console.log('打开文件失败:', filepath);
    process.exit(1);
  }
}


function getNpmToken() {
  const envFile = path.resolve(root, ENV_FILE);
  const token = readEnv(NPM_TOKEN, envFile);
  if (!token) {
    console.log(`${NPM_TOKEN} 不存在`);
    process.exit(1);
  }
  return token;
}

function writeNpmRC(envFile) {
  if (envFile) {
    ENV_FILE = envFile;
  }
  const token = getNpmToken();
  const content = NPM_RC_TPL.replace(TOKEN_KEY, token);
  const npmRCFile = path.resolve(root, '.npmrc');
  fs.writeFileSync(npmRCFile, content, {
    encoding: 'utf-8',
  });
  console.log(symbols.success, `拷贝 ${NPM_TOKEN} 成功`);
}


module.exports = writeNpmRC;
