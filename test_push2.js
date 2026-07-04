async function run() {
    try {
        const secid = '1.603618';
        const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f127`;
        const res = await fetch(url);
        const text = await res.text();
        console.log("Raw response:", text);
    } catch(e) {
        console.error(e);
    }
}
run();
