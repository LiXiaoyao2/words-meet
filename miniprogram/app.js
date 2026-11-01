App({
  globalData: {
    // 开发者工具可连接局域网 HTTP；真机体验版/正式版须改成已备案的 HTTPS 合法域名。
    apiBase: 'http://192.168.1.109:43871',
    friendToken: wx.getStorageSync('friendToken') || '',
    friendCode: wx.getStorageSync('friendCode') || '',
    session: wx.getStorageSync('session') || null
  },
  onShow(){this.heartbeat();this.heartbeatTimer=setInterval(()=>this.heartbeat(),10000);},
  onHide(){clearInterval(this.heartbeatTimer);},
  heartbeat(){if(!this.globalData.friendToken)return;wx.request({url:this.globalData.apiBase.replace(/\/$/,'')+'/api/friends',method:'POST',data:{friendToken:this.globalData.friendToken},fail(){}});}
});
