const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
async function freePort() { return new Promise((resolve, reject) => {const server = net.createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port));});}); }
test('猜词保密、语义分数、共享排行及 100 次失败', {timeout:30000}, async () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'words-guess-test-'));
  for(const file of ['server.js','semantic.js','sensitive-words.json'])fs.copyFileSync(path.join(root,file),path.join(dir,file));
  fs.writeFileSync(path.join(dir,'guess-words.json'),JSON.stringify(['苹果']));
  for(const file of ['node_modules','models'])fs.symlinkSync(path.join(root,file),path.join(dir,file),'dir');
  const port=await freePort(),child=spawn(process.execPath,['server.js'],{cwd:dir,env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
  try {
    await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',code=>reject(new Error(`服务异常退出 ${code}`)));});
    async function post(endpoint,data){const res=await fetch(`http://127.0.0.1:${port}/api/${endpoint}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});return [res.status,await res.json()];}
    const [,room]=await post('create',{name:'测试一',mode:'guess',capacity:1});
    assert.equal(room.capacity,1);assert.equal(room.guess.answer,undefined);
    const [,fruit]=await post('guess',{code:room.code,token:room.token,word:'香蕉'});
    const [,plane]=await post('guess',{code:room.code,token:room.token,word:'飞机'});
    assert.ok(fruit.guess.latest.score>plane.guess.latest.score);
    assert.notEqual(fruit.guess.latest.score,Math.round(fruit.guess.latest.score*100)/100);
    assert.equal((await post('guess',{code:room.code,token:room.token,word:'香蕉'}))[0],400);
    const [,hintRoom]=await post('create',{name:'提示测试',mode:'guess',capacity:1});let hintState;for(let i=0;i<10;i++)[,hintState]=await post('guess',{code:hintRoom.code,token:hintRoom.token,word:'提示'+i});assert.equal(hintState.guess.hints.length,1);assert.match(hintState.guess.hints[0].text,/长度/);
    const [,win]=await post('guess',{code:room.code,token:room.token,word:'苹果'});
    assert.equal(win.won,true);assert.equal(win.guess.latest.score,100);assert.equal(win.guess.answer,'苹果');
    const [,account]=await post('friend-register',{name:'积分测试'});const [,pointsRoom]=await post('create',{name:'积分测试',friendToken:account.token,mode:'guess',capacity:1});await post('guess',{code:pointsRoom.code,token:pointsRoom.token,word:'苹果'});const [,profile]=await post('player-profile',{friendToken:account.token,code:account.code});assert.equal(profile.points,25);
    const [,second]=await post('create',{name:'测试二',mode:'guess',capacity:1});let result;
    for(let i=0;i<100;i++)[,result]=await post('guess',{code:second.code,token:second.token,word:'编号'+i});
    assert.equal(result.failed,true);assert.equal(result.guess.count,100);assert.equal(result.guess.top.length,20);
    assert.equal((await post('guess',{code:second.code,token:second.token,word:'多一次'}))[0],400);
    const tickets=[];for(let i=0;i<4;i++)tickets.push((await post('match',{name:'队员'+i,mode:'guess',capacity:4}))[1]);
    const states=[];for(const ticket of tickets)states.push((await post('match-status',ticket))[1]);
    assert.equal(new Set(states.map(s=>s.code)).size,1);assert.equal(states[0].players.length,4);assert.equal(states[0].ranked,false);
    const [,guess]=await post('guess',{code:states[0].code,token:states[0].token,word:'草莓'});
    const observed=await (await fetch(`http://127.0.0.1:${port}/api/state?code=${states[1].code}&token=${states[1].token}`)).json();
    assert.equal(guess.guess.top[0].word,observed.guess.top[0].word);
  } finally {child.kill();fs.rmSync(dir,{recursive:true,force:true});}
});
