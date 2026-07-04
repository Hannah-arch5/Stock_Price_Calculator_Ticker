const https = require('https');

// secid: 1 for SH (6xxxxx), 0 for SZ (0xxxxx, 3xxxxx)
// klt: 30 for 30-minute
const url = "https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=1.603618&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=30&fqt=1&end=20500101&lmt=10";

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log("Success! Data:", parsed.data.klines);
        } catch(e) {
            console.log("Error parsing:", e.message, data);
        }
    });
}).on('error', err => console.log("Fetch error:", err.message));
