const YahooFinance = require('yahoo-finance2').default;
const yf = new YahooFinance();
async function test() {
    try {
        const news = await yf.search('603618.SS', { lang: 'zh-Hant', region: 'HK', newsCount: 3 });
        console.log("news:", JSON.stringify(news.news, null, 2));
    } catch(e) { console.error(e); }
}
test();
