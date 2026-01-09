Page({
  data: {
    imageList: [
      {
        id: 1,
        prompt: '赛博朋克风格的未来城市',
        author: '小明',
        avatarColor: 'avatar-color-1',
        gradient: 'gradient-1'
      },
      {
        id: 2,
        prompt: '梦幻森林中的精灵',
        author: '小红',
        avatarColor: 'avatar-color-2',
        gradient: 'gradient-2'
      },
      {
        id: 3,
        prompt: '日落时分的海边风景',
        author: '小李',
        avatarColor: 'avatar-color-3',
        gradient: 'gradient-3'
      },
      {
        id: 4,
        prompt: '夜晚的霓虹街道',
        author: '小王',
        avatarColor: 'avatar-color-4',
        gradient: 'gradient-4'
      },
      {
        id: 5,
        prompt: '宁静的湖面倒影',
        author: '小张',
        avatarColor: 'avatar-color-5',
        gradient: 'gradient-5'
      },
      {
        id: 6,
        prompt: '盛开的花海',
        author: '小陈',
        avatarColor: 'avatar-color-6',
        gradient: 'gradient-6'
      }
    ],
    loading: false
  },

  onLoad() {
    this.loadMoreImages();
  },

  onReachBottom() {
    this.loadMoreImages();
  },

  onPullDownRefresh() {
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  onCreateClick() {
    wx.navigateTo({
      url: '/pages/create/create'
    });
  },

  loadMoreImages() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    setTimeout(() => {
      const newImages = [
        {
          id: this.data.imageList.length + 1,
          prompt: '星空下的城堡',
          author: '用户' + (this.data.imageList.length + 1),
          avatarColor: `avatar-color-${(this.data.imageList.length % 6) + 1}`,
          gradient: `gradient-${(this.data.imageList.length % 6) + 1}`
        },
        {
          id: this.data.imageList.length + 2,
          prompt: '春日的樱花大道',
          author: '用户' + (this.data.imageList.length + 2),
          avatarColor: `avatar-color-${(this.data.imageList.length + 1 % 6) + 1}`,
          gradient: `gradient-${(this.data.imageList.length + 1 % 6) + 1}`
        }
      ];

      this.setData({
        imageList: [...this.data.imageList, ...newImages],
        loading: false
      });
    }, 1000);
  }
});
