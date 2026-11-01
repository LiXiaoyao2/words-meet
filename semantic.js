const path = require('path');
let embeddingPromise;
function model() {
  if (!embeddingPromise) embeddingPromise = import('@xenova/transformers').then(async ({pipeline,env}) => {
    env.allowRemoteModels = false;
    env.localModelPath = path.join(__dirname, 'models') + path.sep;
    return pipeline('feature-extraction', 'paraphrase-multilingual-MiniLM-L12-v2', {quantized:true});
  }).catch(() => {embeddingPromise=null; throw new Error('语义模型未就绪，请先安装依赖并下载模型');});
  return embeddingPromise;
}
async function embed(text) {
  const extractor = await model();
  const result = await extractor(text, {pooling:'mean', normalize:true});
  return result.tolist()[0];
}
function similarity(x, y) {
  const cosine = x.reduce((sum,n,i)=>sum+n*y[i],0);
  return Math.round(Math.max(0,Math.min(0.99999999,cosine))*100000000)/1000000;
}
module.exports={model,embed,similarity};
