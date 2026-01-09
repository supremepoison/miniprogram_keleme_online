const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const https = require('https')

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
const BASE_URL = 'dashscope.aliyuncs.com'

function httpsRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (error) {
          resolve(body)
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    req.end()
  })
}

async function createTask(prompt, negativePrompt = '') {
  const options = {
    hostname: BASE_URL,
    port: 443,
    path: '/api/v1/services/aigc/text2image/image-synthesis',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      'X-DashScope-Async': 'enable'
    }
  }

  const data = {
    model: 'qwen3-vl-plus',
    input: {
      prompt: prompt,
      negative_prompt: negativePrompt
    },
    parameters: {
      size: '1024*1024',
      n: 1
    }
  }

  const result = await httpsRequest(options, data)
  return result
}

async function queryTask(taskId) {
  const options = {
    hostname: BASE_URL,
    port: 443,
    path: `/api/v1/tasks/${taskId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
    }
  }

  const result = await httpsRequest(options)
  return result
}

exports.main = async (event, context) => {
  const { name, prompt, negativePrompt, taskId } = event

  try {
    if (!DASHSCOPE_API_KEY) {
      return {
        code: -1,
        message: 'API Key 未配置',
        error: 'DASHSCOPE_API_KEY environment variable is not set'
      }
    }

    let result

    if (name === 'createTask') {
      result = await createTask(prompt, negativePrompt)

      if (result.output && result.output.task_id) {
        return {
          code: 0,
          message: '任务创建成功',
          data: {
            taskId: result.output.task_id,
            taskStatus: result.output.task_status
          }
        }
      } else if (result.code) {
        return {
          code: -1,
          message: result.message || '任务创建失败',
          error: result
        }
      } else {
        return {
          code: -1,
          message: '任务创建失败',
          error: result
        }
      }
    } else if (name === 'queryTask') {
      result = await queryTask(taskId)

      if (result.output && result.output.task_status) {
        return {
          code: 0,
          message: '查询成功',
          data: {
            taskId: result.output.task_id,
            taskStatus: result.output.task_status,
            results: result.output.results || [],
            taskMetrics: result.output.task_metrics
          }
        }
      } else if (result.code) {
        return {
          code: -1,
          message: result.message || '查询任务失败',
          error: result
        }
      } else {
        return {
          code: -1,
          message: '查询任务失败',
          error: result
        }
      }
    } else {
      return {
        code: -1,
        message: '不支持的请求类型',
        error: 'name must be createTask or queryTask'
      }
    }
  } catch (error) {
    console.error('云函数执行失败:', error)
    return {
      code: -1,
      message: '云函数执行失败',
      error: error.message
    }
  }
}
