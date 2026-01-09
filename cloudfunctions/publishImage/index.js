const cloud = require('wx-server-sdk')
const https = require('https')
const http = require('http')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http

    const req = protocol.get(url, (res) => {
      const chunks = []
      res.on('data', (chunk) => {
        chunks.push(chunk)
      })
      res.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.setTimeout(30000, () => {
      req.destroy()
      reject(new Error('Download timeout'))
    })
  })
}

exports.main = async (event, context) => {
  const { imageUrl, prompt, userId } = event

  try {
    const wxContext = cloud.getWXContext()

    if (!imageUrl || !prompt || !userId) {
      return {
        code: -1,
        message: '参数不完整',
        error: 'imageUrl, prompt, and userId are required'
      }
    }

    console.log('开始下载图片:', imageUrl)

    const imageBuffer = await downloadImage(imageUrl)
    console.log('图片下载完成，大小:', imageBuffer.length, 'bytes')

    const timestamp = Date.now()
    const fileName = `images/${userId}_${timestamp}.jpg`

    console.log('开始上传到云存储:', fileName)

    const uploadResult = await cloud.uploadFile({
      cloudPath: fileName,
      fileContent: imageBuffer
    })

    console.log('云存储上传完成，fileID:', uploadResult.fileID)

    const addResult = await db.collection('images').add({
      data: {
        imageUrl: uploadResult.fileID,
        prompt: prompt,
        userId: userId,
        openId: wxContext.OPENID,
        createTime: db.serverDate()
      }
    })

    console.log('数据库保存完成，_id:', addResult._id)

    return {
      code: 0,
      message: '发布成功',
      data: {
        imageId: addResult._id,
        imageUrl: uploadResult.fileID,
        prompt: prompt,
        createTime: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('发布失败:', error)
    return {
      code: -1,
      message: '发布失败',
      error: error.message
    }
  }
}
