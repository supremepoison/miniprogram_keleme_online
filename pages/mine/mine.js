Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      nickName: 'AI 爱好者',
      userId: '12345678'
    },
    stats: {
      works: 0,
      likes: 0,
      favorites: 0
    },
    galleryList: []
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    if (this.data.isLoggedIn) {
      this.loadUserImages();
    }
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      });
      this.loadUserImages();
    }
  },

  loadUserImages() {
    const { userId } = this.data.userInfo;
    if (!userId) return;

    console.log('开始加载用户图片, userId:', userId);
    wx.showLoading({
      title: '加载中...'
    });

    wx.cloud.database()
      .collection('images')
      .where({
        userId: userId
      })
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        console.log('查询到的数据:', res);
        wx.hideLoading();

        const images = res.data.map(item => ({
          id: item._id,
          prompt: item.prompt,
          time: this.formatTime(item.createTime),
          imageUrl: item.imageUrl,
          likes: 0
        }));

        console.log('处理后的图片列表:', images);

        this.setData({
          galleryList: images,
          'stats.works': images.length
        });

        console.log('设置后的 galleryList:', this.data.galleryList);
      })
      .catch(err => {
        wx.hideLoading();
        console.error('加载图片失败:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
      });
  },

  formatTime(date) {
    if (!date) return '';

    const now = new Date();
    const targetDate = new Date(date);
    const diff = now - targetDate;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小时前`;
    } else if (minutes > 0) {
      return `${minutes}分钟前`;
    } else {
      return '刚刚';
    }
  },

  onImageLoad(e) {
    console.log('图片加载成功:', e.currentTarget.dataset.id);
  },

  onImageError(e) {
    console.error('图片加载失败:', e.currentTarget.dataset.id, e.detail);
  },

  onLogin() {
    console.log('开始登录流程');
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功:', res);
        wx.showLoading({
          title: '登录中...'
        });

        wx.cloud.callFunction({
          name: 'login',
          data: {
            userInfo: {
              nickName: res.userInfo.nickName,
              avatar: res.userInfo.avatarUrl
            }
          }
        }).then(result => {
          console.log('云函数调用成功:', result);
          wx.hideLoading();

          if (result.result.code === 0) {
            const userInfo = {
              nickName: result.result.data.nickName,
              userId: result.result.data.userId,
              avatar: result.result.data.avatar
            };

            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('openid', result.result.data.userId);

            this.setData({
              isLoggedIn: true,
              userInfo: userInfo
            });

            wx.showToast({
              title: result.result.data.isNewUser ? '注册并登录成功' : '登录成功',
              icon: 'success'
            });
          } else {
            console.error('云函数返回错误:', result.result);
            wx.showToast({
              title: result.result.message || '登录失败',
              icon: 'error'
            });
          }
        }).catch(err => {
          console.error('云函数调用失败:', err);
          wx.hideLoading();
          wx.showToast({
            title: '登录失败',
            icon: 'error'
          });
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        wx.showToast({
          title: '需要授权才能登录',
          icon: 'none'
        });
      }
    });
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗?',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('openid');

          this.setData({
            isLoggedIn: false,
            userInfo: {
              nickName: 'AI 爱好者',
              userId: '12345678'
            }
          });

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  onEditNickname() {
    const { nickName } = this.data.userInfo;

    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      content: nickName,
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          const newNickName = res.content.trim();
          this.updateProfile({
            nickName: newNickName
          });
        }
      }
    });
  },

  onEditAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  uploadAvatar(filePath) {
    const { userId } = this.data.userInfo;

    wx.showLoading({
      title: '上传中...'
    });

    const cloudPath = `avatars/${userId}.jpg`;

    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (uploadRes) => {
        const fileID = uploadRes.fileID;
        this.updateProfile({
          avatar: fileID
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('上传头像失败:', err);
        wx.showToast({
          title: '上传失败',
          icon: 'error'
        });
      }
    });
  },

  updateProfile(updateData) {
    const { userId } = this.data.userInfo;

    wx.cloud.callFunction({
      name: 'updateProfile',
      data: {
        userId,
        ...updateData
      }
    }).then(result => {
      wx.hideLoading();

      if (result.result.code === 0) {
        const newUserInfo = {
          ...this.data.userInfo,
          ...result.result.data
        };

        this.setData({
          userInfo: newUserInfo
        });

        wx.setStorageSync('userInfo', newUserInfo);

        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: result.result.message || '更新失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('更新用户信息失败:', err);
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      });
    });
  }
});
