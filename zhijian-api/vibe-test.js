const { Storage } = require('@google-cloud/storage');

// 自动吸取你刚才存在本地的隐形 ADC 凭证
const storage = new Storage({ projectId: 'apt-decorator-473807-t1' });

async function checkMyData() {
  const bucketName = 'apt-decorator-473807-t1-knowledge'; // 你的知识库桶
  
  console.log(`[Vibe Check] 正在连接云端存储桶: ${bucketName}...\n`);
  
  try {
    // 试探性拉取前 10 个文件
    const [files] = await storage.bucket(bucketName).getFiles({ maxResults: 10 });
    
    console.log('🎉 突破成功！你在云端的资产如下：');
    files.forEach(file => {
      console.log(`- ${file.name} (大小: ${(file.metadata.size / 1024 / 1024).toFixed(2)} MB)`);
    });
    console.log('\n环境彻底打通，你的 1.7G 数据随时待命。');
    
  } catch (error) {
    console.error('连接失败，错误信息：', error.message);
  }
}

checkMyData();