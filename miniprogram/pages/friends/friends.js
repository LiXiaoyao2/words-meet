const api=require('../../utils/api');
Page({data:{friendCode:'',friends:[],requests:[],invites:[],code:''},onShow(){this.refresh();this.timer=setInterval(()=>this.refresh(),3000);},onHide(){clearInterval(this.timer);},onUnload(){clearInterval(this.timer);},onCode(e){this.setData({code:e.detail.value});},
 async refresh(){if(this.loading)return;this.loading=true;try{const token=await api.ensureIdentity(wx.getStorageSync('name'));const result=await api.request('friends',{friendToken:token});this.setData({friendCode:result.code,friends:result.friends,requests:result.requests,invites:result.invites});}catch(e){api.error(e);}finally{this.loading=false;}},
 async add(){try{await api.request('friend-request',{friendToken:getApp().globalData.friendToken,code:this.data.code});this.setData({code:''});this.refresh();wx.showToast({title:'已发送申请',icon:'none'});}catch(e){api.error(e);}},
 async accept(e){try{await api.request('friend-accept',{friendToken:getApp().globalData.friendToken,code:e.currentTarget.dataset.code});this.refresh();}catch(err){api.error(err);}},
 async remove(e){try{await api.request('friend-remove',{friendToken:getApp().globalData.friendToken,code:e.currentTarget.dataset.code});this.refresh();}catch(err){api.error(err);}},
 makeProfile(){const name=wx.getStorageSync('name');if(!name)throw new Error('请先在首页填写昵称并开始一次游戏');return api.profile(name,wx.getStorageSync('gender')||'不公开',wx.getStorageSync('avatar')||'',wx.getStorageSync('mode')||'couple',wx.getStorageSync('capacity')||2);},
 async invite(e){try{const data={...this.makeProfile(),code:e.currentTarget.dataset.code};const s=await api.request('friend-invite',data);api.enterRoom(s);}catch(err){api.error(err);}},
 async acceptInvite(e){try{const s=await api.request('friend-invite-accept',{...this.makeProfile(),code:e.currentTarget.dataset.room});api.enterRoom(s);}catch(err){api.error(err);this.refresh();}}
});
