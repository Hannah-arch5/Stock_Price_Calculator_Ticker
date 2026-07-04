const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

async function test() {
    try {
        const result = await yahooFinance.quoteSummary('603618.SS', { modules: ['summaryProfile', 'financialData', 'price'] });
        console.log("quoteSummary:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
