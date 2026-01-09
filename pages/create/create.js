Page({
  data: {
    isGenerated: false,
    prompt: '',
    negativePrompt: '',
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
    this.setData({
      prompt: e.detail.value
    });
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
    if (!this.data.prompt.trim()) {
      wx.showToast({
        title: '请输入描述',
        icon: 'error'
      });
      return;
    }

    wx.showLoading({
      title: '生成中...',
      mask: true
    });

    setTimeout(() => {
      wx.hideLoading();
      this.setData({ isGenerated: true });
      wx.showToast({
        title: '生成成功',
        icon: 'success'
      });
    }, 2000);
  },

  onRegenerate() {
    this.setData({ isGenerated: false });
  },

  onPublish() {
    wx.showLoading({
      title: '发布中...',
      mask: true
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/home'
        });
      }, 1500);
    }, 1500);
  },

  onSaveDraft() {
    wx.showToast({
      title: '已保存草稿',
      icon: 'success'
    });
  }
});
