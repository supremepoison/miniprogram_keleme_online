Page({
  data: {
    imageList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadMoreImages();
  },

  onShow() {
    if (this.data.page === 1) {
      this.loadMoreImages();
    }
  },

  onReachBottom() {
    this.loadMoreImages();
  },

  onPullDownRefresh() {
    this.setData({
      imageList: [],
      page: 1,
      hasMore: true
    });
    this.loadMoreImages().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onCreateClick() {
    wx.navigateTo({
      url: '/pages/create/create'
    });
  },

  loadMoreImages() {
    return new Promise((resolve, reject) => {
      if (this.data.loading || !this.data.hasMore) {
        resolve();
        return;
      }

      this.setData({ loading: true });

      const { page, pageSize } = this.data;

      wx.cloud.callFunction({
        name: 'getGallery',
        data: {
          page,
          pageSize
        }
      }).then(result => {
        if (result.result.code === 0) {
          const { images, hasMore } = result.result.data;
          const newImageList = images.map(img => ({
            ...img,
            time: this.formatTime(img.createTime)
          }));

          this.setData({
            imageList: this.data.page === 1 ? newImageList : [...this.data.imageList, ...newImageList],
            hasMore: hasMore,
            page: page + 1,
            loading: false
          });
          resolve();
        } else {
          this.setData({ loading: false });
          wx.showToast({
            title: result.result.message || '加载失败',
            icon: 'error'
          });
          reject();
        }
      }).catch(err => {
        this.setData({ loading: false });
        console.error('加载图片失败:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'error'
        });
        reject();
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

  onImageError(e) {
    console.error('图片加载失败:', e.currentTarget.dataset.id, e.detail);
  },

  onImageLoad(e) {
    console.log('图片加载成功:', e.currentTarget.dataset.id);
  },

  onImageTap(e) {
    const { url } = e.currentTarget.dataset;
    if (!url) return;

    wx.navigateTo({
      url: `/pages/image-preview/image-preview?imageUrl=${encodeURIComponent(url)}&prompt=${encodeURIComponent(this.data.imageList.find(img => img.imageUrl === url)?.prompt || '')}`
    });
  }
});
