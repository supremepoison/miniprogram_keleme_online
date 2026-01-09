const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { page = 1, pageSize = 10 } = event

  try {
    const skip = (page - 1) * pageSize

    const countResult = await db.collection('images').count()
    const total = countResult.total

    const imagesResult = await db.collection('images')
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const images = imagesResult.data

    if (images.length === 0) {
      return {
        code: 0,
        message: '成功',
        data: {
          images: [],
          total: 0,
          page,
          pageSize,
          hasMore: false
        }
      }
    }

    const userIds = [...new Set(images.map(img => img.userId))]

    const usersResult = await db.collection('users')
      .where({
        _id: _.in(userIds)
      })
      .field({
        _id: true,
        nickName: true,
        avatar: true
      })
      .get()

    const userMap = {}
    usersResult.data.forEach(user => {
      userMap[user._id] = user
    })

    const imageList = images.map(img => {
      const user = userMap[img.userId] || {}
      return {
        id: img._id,
        prompt: img.prompt,
        imageUrl: img.imageUrl,
        userId: img.userId,
        userNickName: user.nickName || '匿名用户',
        userAvatar: user.avatar || '',
        createTime: img.createTime
      }
    })

    return {
      code: 0,
      message: '成功',
      data: {
        images: imageList,
        total,
        page,
        pageSize,
        hasMore: skip + pageSize < total
      }
    }
  } catch (error) {
    console.error('获取画廊失败:', error)
    return {
      code: -1,
      message: '获取失败',
      error: error.message
    }
  }
}
