async function run() {
    try {
        let mapping = {};
        for (let i = 1; i <= 20; i++) {
            const url = `https://reportapi.eastmoney.com/report/list?pageSize=100&pageNo=${i}&qType=1&beginTime=2024-01-01&endTime=2026-12-31`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data || !data.data) break;
            for (let item of data.data) {
                if (item.industryName && item.industryCode && !mapping[item.industryName]) {
                    mapping[item.industryName] = item.industryCode;
                }
            }
        }
        console.log("Total industries:", Object.keys(mapping).length);
        const fs = require('fs');
        fs.writeFileSync('all_industries.json', JSON.stringify(mapping, null, 2));
    } catch(e) {
        console.error(e);
    }
}
run();
