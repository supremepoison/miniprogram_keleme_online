const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId, nickName, avatar } = event

  try {
    const wxContext = cloud.getWXContext()

    const userCollection = db.collection('users')

    const updateData = {
      updateTime: db.serverDate()
    }

    if (nickName) {
      updateData.nickName = nickName
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar
    }

    const result = await userCollection.doc(userId).update({
      data: updateData
    })

    return {
      code: 0,
      message: '更新成功',
      data: {
        nickName: nickName,
        avatar: avatar
      }
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)

    return {
      code: -1,
      message: '更新失败',
      error: error.message
    }
  }
}
