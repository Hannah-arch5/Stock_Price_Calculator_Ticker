async function run() {
    try {
        const url = 'https://reportapi.eastmoney.com/report/list?pageSize=5000&pageNo=1&qType=1&beginTime=2023-01-01&endTime=2026-12-31';
        const res = await fetch(url);
        const data = await res.json();
        let mapping = {};
        for (let item of data.data) {
            if (item.industryName && item.industryCode && !mapping[item.industryName]) {
                mapping[item.industryName] = item.industryCode;
            }
        }
        console.log("Found", Object.keys(mapping).length, "industries");
        const fs = require('fs');
        fs.writeFileSync('industry_mapping.json', JSON.stringify(mapping, null, 2));
    } catch(e) {
        console.error(e);
    }
}
run();
