async function run() {
    const code = '603618';
    const emCode = 'SH603618';
    const noticesUrl = `https://np-anotice-stock.eastmoney.com/api/security/ann?sr=-1&page_size=5&page_index=1&ann_type=A&client_source=WEB&stock_list=${code}&f_node=1`;
    const f10Url = `http://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/ZYZBAjaxNew?type=0&code=${emCode}`;
    const forecastUrl = `https://datacenter-web.eastmoney.com/api/data/v1/get?sortColumns=NOTICE_DATE&sortTypes=-1&pageSize=1&pageNumber=1&reportName=RPT_PUBLIC_OP_NEWPREDICT&columns=NOTICE_DATE,PREDICT_CONTENT,PREDICT_TYPE&filter=(SECURITY_CODE%3D%22${code}%22)`;
    const researchUrl = `https://reportapi.eastmoney.com/report/list?pageSize=1&pageNo=1&qType=0&code=${code}&beginTime=2023-01-01&endTime=2027-12-31`;

    let [noticesJsonStr, f10JsonStr, forecastJsonStr, researchJsonStr] = await Promise.all([
        fetch(noticesUrl).then(r => r.text()),
        fetch(f10Url).then(r => r.text()),
        fetch(forecastUrl).then(r => r.text()),
        fetch(researchUrl).then(r => r.text())
    ]);

    let eventsList = [];
    
    try {
        const forecastData = JSON.parse(forecastJsonStr);
        if (forecastData && forecastData.result && forecastData.result.data && forecastData.result.data.length > 0) {
            const forecast = forecastData.result.data[0];
            let tag = forecast.PREDICT_TYPE || '预告';
            if (tag.length > 2) tag = tag.substring(0, 2);
            const text = forecast.PREDICT_CONTENT;
            const date = forecast.NOTICE_DATE ? forecast.NOTICE_DATE.substring(0, 10) : '';
            eventsList.push({ tag, text, date });
        }
    } catch(e) { console.error("Forecast error:", e); }
    
    try { 
        const f10Data = JSON.parse(f10JsonStr); 
        if (f10Data && f10Data.data && f10Data.data.length > 0) {
            const report = f10Data.data[0];
            const reportName = report.REPORT_DATE_NAME || '财报';
            const noticeDate = report.NOTICE_DATE ? report.NOTICE_DATE.substring(0, 10) : '';
            let summary = `${report.SECURITY_NAME_ABBR}发布${reportName}。`;
            if (report.PARENTNETPROFITTZ !== null && report.PARENTNETPROFITTZ !== undefined) {
                summary += `净利润同比${report.PARENTNETPROFITTZ >= 0 ? '增长' : '下降'}${Math.abs(report.PARENTNETPROFITTZ).toFixed(2)}%。`;
            }
            if (report.TOTALOPERATEREVETZ !== null && report.TOTALOPERATEREVETZ !== undefined) {
                summary += `营收同比${report.TOTALOPERATEREVETZ >= 0 ? '增长' : '下降'}${Math.abs(report.TOTALOPERATEREVETZ).toFixed(2)}%。`;
            }
            eventsList.push({ tag: '财报', text: summary, date: noticeDate });
        }
    } catch(e) { console.error("F10 error:", e); }
    
    try {
        const researchData = JSON.parse(researchJsonStr);
        if (researchData && researchData.data && researchData.data.length > 0) {
            const report = researchData.data[0];
            const date = report.publishDate ? report.publishDate.substring(0, 10) : '';
            const text = `${report.orgSName}: ${report.title}`;
            eventsList.push({ tag: '研报', text, date });
        }
    } catch(e) { console.error("Research error:", e); }
    
    eventsList.sort((a, b) => {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return dateB - dateA;
    });
    
    console.log(JSON.stringify(eventsList, null, 2));
}
run();
