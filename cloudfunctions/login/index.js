const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { userInfo } = event

  try {
    const wxContext = cloud.getWXContext()

    const userCollection = db.collection('users')

    const existingUser = await userCollection.where({
      _openid: wxContext.OPENID
    }).get()

    let userData = {
      _openid: wxContext.OPENID,
      nickName: userInfo.nickName,
      avatar: userInfo.avatar || '',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }

    if (existingUser.data.length > 0) {
      const userId = existingUser.data[0]._id

      await userCollection.doc(userId).update({
        data: {
          nickName: userInfo.nickName,
          avatar: userInfo.avatar || '',
          updateTime: db.serverDate()
        }
      })

      return {
        code: 0,
        message: '登录成功',
        data: {
          userId: userId,
          nickName: userInfo.nickName,
          avatar: userInfo.avatar || '',
          isNewUser: false
        }
      }
    } else {
      const addResult = await userCollection.add({
        data: userData
      })

      return {
        code: 0,
        message: '注册并登录成功',
        data: {
          userId: addResult._id,
          nickName: userInfo.nickName,
          avatar: userInfo.avatar || '',
          isNewUser: true
        }
      }
    }
  } catch (error) {
    console.error('登录失败:', error)

    return {
      code: -1,
      message: '登录失败',
      error: error.message
    }
  }
}
