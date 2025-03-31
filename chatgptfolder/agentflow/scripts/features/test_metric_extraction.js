const { testMetricExtraction } = require('./facebook_marketing.api');

async function main() {
  await testMetricExtraction();
}

main().catch(console.error); 