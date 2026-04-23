/*const functions = require('@google-cloud/functions-framework');
const { VertexAI } = require('@google-cloud/vertexai');

const vertex_ai = new VertexAI({project: 'apt-decorator-473807-t1', location: 'us-central1'});
const model = vertex_ai.preview.getGenerativeModel({
    model: 'gemini-1.5-pro-preview-0409',
});

// 这个函数名必须叫 processPdf，对应部署命令里的 --entry-point
functions.http('processPdf', async (req, res) => {
    // 允许跨域（小程序开发必备）
    res.set('Access-Control-Allow-Origin', '*');
    
    const fileUri = req.query.uri || 'gs://apt-decorator-473807-t1-knowledge/knowledge_base/library/kindergarten_standard/others/爱立方一日活动课程/中班上学期一日活动/中班上第一二周计划.pdf';

    try {
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { fileData: { mimeType: 'application/pdf', fileUri: fileUri } },
                    { text: "你是一个幼教专家。请快速总结这份PDF教案的核心教学目标，并给出两个互动的建议。请用中文回答。" }
                ]
            }]
        });

        const text = result.response.candidates[0].content.parts[0].text;
        res.status(200).send(text);
    } catch (ex) {
        res.status(500).send(`云端计算出错: ${ex.message}`);
    }
});
*/
// 测试逻辑：只烧一点点“燃料”，看看引擎响不响
/**
 * 幼教专家 AI 引擎 - 云端部署版
 */
const functions = require('@google-cloud/functions-framework');
const { VertexAI } = require('@google-cloud/vertexai');

// 1. 初始化 Vertex AI (确保项目 ID 绝对准确)
const project = 'apt-decorator-473807-t1';
const location = 'us-central1';
const vertex_ai = new VertexAI({ project: project, location: location });

// 2. 获取 Gemini 1.5 Pro 模型 (烧资料最强的型号)
const model = vertex_ai.preview.getGenerativeModel({
    model: 'gemini-1.5-pro-preview-0409',
});

// 3. 定义处理函数
functions.http('processPdf', async (req, res) => {
    // 允许跨域请求
    res.set('Access-Control-Allow-Origin', '*');

    try {
        console.log("正在尝试唤醒 Gemini 大脑...");

        // 这里就是“烧资料”的动作：
        // 燃料地址：gs:// 存储桶路径
        const fileUri = 'gs://apt-decorator-473807-t1-knowledge/knowledge_base/library/kindergarten_standard/others/爱立方一日活动课程/中班上学期一日活动/中班上第一二周计划.pdf';

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    { fileData: { mimeType: 'application/pdf', fileUri: fileUri } },
                    { text: "你是一个资深的幼儿园教育专家。请分析这份教学计划，并提炼出 3 个能够直接应用到小程序端的互动教学建议。请用中文回答。" }
                ]
            }]
        });

        const text = result.response.candidates[0].content.parts[0].text;
        
        console.log("提炼成功！内容长度:", text.length);
        res.status(200).send(text);

    } catch (ex) {
        console.error("提炼过程出错:", ex);
        res.status(500).send(`引擎计算出错: ${ex.message}`);
    }
});