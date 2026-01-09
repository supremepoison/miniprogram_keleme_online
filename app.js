App({
  onLaunch() {
    console.log('AI 画廊小程序启动');
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloudbase-7gak18djbca53c89',
        traceUser: true
      });
      console.log('云开发环境初始化成功');
    }
  },
  globalData: {
    userInfo: null
  }
})
