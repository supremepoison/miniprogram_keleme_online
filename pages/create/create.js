Page({
  data: {
    isGenerated: false,
    isGenerating: false,
    prompt: '',
    negativePrompt: '',
    generatedImage: '',
    taskId: '',
    pollCount: 0,
    styleTags: [
      { name: '写实', selected: true },
      { name: '动漫', selected: false },
      { name: '电影感', selected: false },
      { name: '梦幻', selected: false },
      { name: '水彩', selected: false },
      { name: '油画', selected: false }
    ]
  },

  onLoad(options) {
    if (options.generated === 'true') {
      this.setData({
        isGenerated: true,
        prompt: '一位美丽的女孩在樱花树下，手捧书卷，日系插画风格，柔和的光线，粉色的樱花飘落'
      });
    }
  },

  onPromptInput(e) {
    console.log('输入框值变化:', e.detail.value);
    this.setData({
      prompt: e.detail.value
    });
    console.log('设置后的 prompt:', this.data.prompt);
  },

  onNegativePromptInput(e) {
    this.setData({
      negativePrompt: e.detail.value
    });
  },

  onStyleTagClick(e) {
    const index = e.currentTarget.dataset.index;
    const styleTags = this.data.styleTags.map((tag, i) => ({
      ...tag,
      selected: i === index
    }));

    this.setData({ styleTags });
  },

  onGetInspiration() {
    const inspirations = [
      '一位可爱的猫咪在阳光下打盹，温暖的午后，日系治愈风格',
      '远山如黛，云雾缭绕，中国水墨画风格',
      '未来的飞行汽车穿梭在霓虹闪烁的摩天大楼之间，赛博朋克风格',
      '一位宇航员在火星表面插旗，红色沙地，电影质感'
    ];

    const randomIndex = Math.floor(Math.random() * inspirations.length);
    this.setData({
      prompt: inspirations[randomIndex]
    });

    wx.showToast({
      title: '已获取灵感',
      icon: 'success'
    });
  },

  onGenerate() {
    console.log('====================');
    console.log('点击了生成按钮');
    console.log('当前 prompt 值:', this.data.prompt);
    console.log('prompt 类型:', typeof this.data.prompt);
    console.log('prompt 长度:', this.data.prompt.length);
    console.log('prompt 是否为空:', !this.data.prompt);
    console.log('prompt trim 后是否为空:', !this.data.prompt.trim());
    console.log('====================');

    if (!this.data.prompt || !this.data.prompt.trim()) {
      console.error('验证失败：prompt 为空');
      wx.showToast({
        title: '请输入描述',
        icon: 'error'
      });
      return;
    }

    console.log('开始创建任务...');
    this.setData({
      isGenerating: true,
      pollCount: 0
    });

    wx.showLoading({
      title: '创建任务中...',
      mask: true
    });

    console.log('调用云函数 imageGeneration');
    wx.cloud.callFunction({
      name: 'imageGeneration',
      data: {
        name: 'createTask',
        prompt: this.data.prompt,
        negativePrompt: this.data.negativePrompt
      }
    }).then(result => {
      console.log('云函数返回结果:', result);
      wx.hideLoading();

      if (result.result && result.result.code === 0) {
        console.log('任务创建成功, taskId:', result.result.data.taskId);
        this.setData({
          taskId: result.result.data.taskId
        });

        wx.showLoading({
          title: '生成中...',
          mask: true
        });

        this.pollTask();
      } else {
        console.error('任务创建失败:', result.result);
        this.setData({ isGenerating: false });
        wx.showToast({
          title: result.result?.message || '创建任务失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      console.error('创建任务异常:', err);
      wx.hideLoading();
      this.setData({ isGenerating: false });
      wx.showToast({
        title: '创建任务失败',
        icon: 'error'
      });
    });
  },

  pollTask() {
    const { taskId, pollCount } = this.data;

    if (pollCount >= 30) {
      this.setData({ isGenerating: false });
      wx.hideLoading();
      wx.showToast({
        title: '生成超时，请稍后重试',
        icon: 'error'
      });
      return;
    }

    wx.cloud.callFunction({
      name: 'imageGeneration',
      data: {
        name: 'queryTask',
        taskId: taskId
      }
    }).then(result => {
      if (result.result.code === 0) {
        const { taskStatus, results } = result.result.data;

        if (taskStatus === 'SUCCEEDED' && results && results.length > 0) {
          wx.hideLoading();
          this.setData({
            isGenerated: true,
            isGenerating: false,
            generatedImage: results[0].url
          });
          wx.showToast({
            title: '生成成功',
            icon: 'success'
          });
        } else if (taskStatus === 'FAILED') {
          this.setData({ isGenerating: false });
          wx.hideLoading();
          wx.showToast({
            title: '生成失败，请重试',
            icon: 'error'
          });
        } else {
          this.setData({ pollCount: pollCount + 1 });
          setTimeout(() => {
            this.pollTask();
          }, 3000);
        }
      } else {
        this.setData({ isGenerating: false });
        wx.hideLoading();
        wx.showToast({
          title: result.result.message || '查询任务失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      this.setData({ isGenerating: false });
      wx.hideLoading();
      console.error('查询任务失败:', err);
      wx.showToast({
        title: '查询任务失败',
        icon: 'error'
      });
    });
  },

  onRegenerate() {
    this.setData({
      isGenerated: false,
      generatedImage: '',
      taskId: ''
    });
  },

  onPublish() {
    if (!this.data.generatedImage) {
      wx.showToast({
        title: '请先生成图片',
        icon: 'error'
      });
      return;
    }

    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.userId) {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      });
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/mine/mine'
        });
      }, 1500);
      return;
    }

    wx.showLoading({
      title: '发布中...',
      mask: true
    });

    wx.cloud.callFunction({
      name: 'publishImage',
      data: {
        imageUrl: this.data.generatedImage,
        prompt: this.data.prompt,
        userId: userInfo.userId
      }
    }).then(result => {
      wx.hideLoading();

      if (result.result.code === 0) {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: result.result.message || '发布失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('发布失败:', err);
      wx.showToast({
        title: '发布失败',
        icon: 'error'
      });
    });
  },

  onSaveDraft() {
    wx.showToast({
      title: '已保存草稿',
      icon: 'success'
    });
  }
});
