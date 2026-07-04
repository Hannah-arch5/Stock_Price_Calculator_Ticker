async function run() {
    try {
        const url = 'https://reportapi.eastmoney.com/report/list?pageSize=1&pageNo=1&qType=0&code=603618&beginTime=2020-01-01&endTime=2026-12-31';
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.data && data.data.length > 0) {
            console.log(data.data[0].industryCode, data.data[0].industryName);
        } else {
            console.log("No reports found");
        }
    } catch(e) {
        console.error(e);
    }
}
run();
