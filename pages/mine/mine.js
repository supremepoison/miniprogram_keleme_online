Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      nickName: 'AI 爱好者',
      userId: '12345678'
    },
    stats: {
      works: 12,
      likes: 86,
      favorites: 5
    },
    galleryList: [
      {
        id: 1,
        prompt: '赛博朋克风格的未来城市',
        time: '2天前',
        likes: 12,
        gradient: 'gradient-1'
      },
      {
        id: 2,
        prompt: '梦幻森林中的精灵',
        time: '3天前',
        likes: 8,
        gradient: 'gradient-2'
      },
      {
        id: 3,
        prompt: '日落时分的海边风景',
        time: '5天前',
        likes: 15,
        gradient: 'gradient-3'
      },
      {
        id: 4,
        prompt: '夜晚的霓虹街道',
        time: '1周前',
        likes: 20,
        gradient: 'gradient-4'
      }
    ]
  },

  onLoad() {
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      });
    }
  },

  onLogin() {
    wx.showLoading({
      title: '登录中...'
    });

    wx.login({
      success: (res) => {
        setTimeout(() => {
          wx.hideLoading();
          const userInfo = {
            nickName: 'AI 爱好者',
            userId: '12345678',
            avatar: ''
          };

          wx.setStorageSync('userInfo', userInfo);
          this.setData({
            isLoggedIn: true,
            userInfo: userInfo
          });

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
        }, 1500);
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '登录失败',
          icon: 'error'
        });
      }
    });
  }
});
