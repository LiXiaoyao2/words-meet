function request(path, data) {
  const app = getApp();
  return new Promise((resolve, reject) => wx.request({
    url: app.globalData.apiBase.replace(/\/$/, '') + '/api/' + path,
    method: 'POST', data: data || {}, timeout: 10000,
    success(res) { if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data); else reject(new Error((res.data && res.data.error) || '请求失败')); },
    fail() { reject(new Error('无法连接服务器，请检查地址和网络')); }
  }));
}
function state(session) {
  const base = getApp().globalData.apiBase.replace(/\/$/, '');
  return new Promise((resolve, reject) => wx.request({url: base + '/api/state', method: 'GET', data: session, timeout: 10000,
    success(res) {if(res.statusCode===200)resolve(res.data);else reject(new Error((res.data&&res.data.error)||'房间已失效'));},
    fail() {reject(new Error('网络连接失败'));}
  }));
}
async function ensureIdentity(name) {
  const app = getApp();
  if (!app.globalData.friendToken) {
    const result = await request('friend-register', {name:name || '新朋友'});
    app.globalData.friendToken = result.token; app.globalData.friendCode = result.code;
    wx.setStorageSync('friendToken', result.token); wx.setStorageSync('friendCode', result.code);
  }
  return app.globalData.friendToken;
}
function profile(name, gender, avatar, mode, capacity) { return {name, gender, avatar:avatar||'', mode, capacity, friendToken:getApp().globalData.friendToken}; }
function error(err) { wx.showToast({title:err.message || '操作失败',icon:'none',duration:2500}); }
function enterRoom(result) {const session={code:result.code,token:result.token};getApp().globalData.session=session;wx.setStorageSync('session',session);wx.navigateTo({url:'/pages/game/game'});}
module.exports={request,state,ensureIdentity,profile,error,enterRoom};
