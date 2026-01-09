Page({
  data: {
    imageUrl: '',
    prompt: '',
    isDownloading: false
  },

  onLoad(options) {
    const { imageUrl, prompt } = options;
    this.setData({
      imageUrl: decodeURIComponent(imageUrl || ''),
      prompt: decodeURIComponent(prompt || '')
    });
  },

  onClose() {
    wx.navigateBack();
  },

  onImageLoad() {
    console.log('预览图片加载成功');
  },

  onImageError(e) {
    console.error('预览图片加载失败:', e);
    wx.showToast({
      title: '图片加载失败',
      icon: 'error'
    });
  },

  onDownload() {
    if (this.data.isDownloading) return;

    const { imageUrl } = this.data;

    if (!imageUrl) {
      wx.showToast({
        title: '图片地址无效',
        icon: 'error'
      });
      return;
    }

    this.setData({ isDownloading: true });

    wx.showLoading({
      title: '下载中...',
      mask: true
    });

    if (imageUrl.startsWith('cloud://')) {
      this.downloadCloudImage(imageUrl);
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      this.downloadHttpImage(imageUrl);
    } else {
      wx.hideLoading();
      this.setData({ isDownloading: false });
      wx.showToast({
        title: '不支持此图片格式',
        icon: 'error'
      });
    }
  },

  downloadCloudImage(cloudPath) {
    wx.cloud.getTempFileURL({
      fileList: [cloudPath]
    }).then(res => {
      const tempUrl = res.fileList[0].tempFileURL;
      if (tempUrl) {
        this.saveImageToPhotosAlbum(tempUrl);
      } else {
        wx.hideLoading();
        this.setData({ isDownloading: false });
        wx.showToast({
          title: '获取图片链接失败',
          icon: 'error'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      this.setData({ isDownloading: false });
      console.error('获取临时链接失败:', err);
      wx.showToast({
        title: '获取图片链接失败',
        icon: 'error'
      });
    });
  },

  downloadHttpImage(url) {
    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          const tempFilePath = res.tempFilePath;
          this.saveImageToPhotosAlbum(tempFilePath);
        } else {
          wx.hideLoading();
          this.setData({ isDownloading: false });
          wx.showToast({
            title: '下载失败',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ isDownloading: false });
        console.error('下载文件失败:', err);
        wx.showToast({
          title: '下载失败',
          icon: 'error'
        });
      }
    });
  },

  saveImageToPhotosAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        wx.hideLoading();
        this.setData({ isDownloading: false });
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({ isDownloading: false });

        if (err.errMsg.includes('auth')) {
          wx.showModal({
            title: '需要授权',
            content: '需要您授权保存图片到相册',
            confirmText: '去授权',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          console.error('保存到相册失败:', err);
          wx.showToast({
            title: '保存失败',
            icon: 'error'
          });
        }
      }
    });
  }
});
