const https = require('https');

const options = {
  hostname: 'query2.finance.yahoo.com',
  path: '/v10/finance/quoteSummary/603618.SS?modules=calendarEvents,summaryDetail,financialData',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nData:', data.substring(0, 200)));
});

req.on('error', (e) => console.error(e));
req.end();
