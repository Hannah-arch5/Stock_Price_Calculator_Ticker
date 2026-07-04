const fs = require('fs');

let script = fs.readFileSync('script.js', 'utf8');

// Insert call to loadKlineMetrics next to loadStockNews
script = script.replace(
    'loadStockNews(group.symbol, groupIndex);',
    'loadStockNews(group.symbol, groupIndex);\n            loadKlineMetrics(group);'
);

// Append function definition at the end
script += `

// ---------------------------------------------------------
// Background K-Line Metrics Fetching
// ---------------------------------------------------------

function getTencentSymbol(c) {
    let codeMatch = c.match(/[A-Za-z0-9]+/);
    if (!codeMatch) return null;
    let code = codeMatch[0].toLowerCase();
    if (/^\\d{6}$/.test(code)) return (code.startsWith('6') || code.startsWith('9')) ? \`sh\${code}\` : \`sz\${code}\`;
    if (/^\\d{5}$/.test(code)) return \`hk\${code}\`; 
    return \`us\${code.toUpperCase()}\`;
}

async function loadKlineMetrics(group) {
    const tsym = getTencentSymbol(group.symbol);
    if (!tsym) return;

    if (!group.klineMetrics) {
        group.klineMetrics = {
            m5: { high: null, low: null },
            m30: { high: null, low: null },
            day: { high: null, low: null },
            week: { high: null, low: null }
        };
    }

    const fetchKline = async (type, intervalParam) => {
        const endpoint = (type === 'm5' || type === 'm30') ? 'mkline' : 'kline';
        const url = \`https://ifzq.gtimg.cn/appstock/app/kline/\${endpoint}?param=\${tsym},\${intervalParam},,,1,\`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data && data.code === 0 && data.data && data.data[tsym] && data.data[tsym][intervalParam]) {
                const arr = data.data[tsym][intervalParam];
                if (arr.length > 0) {
                    const last = arr[arr.length - 1];
                    return { high: parseFloat(last[3]), low: parseFloat(last[4]) };
                }
            }
        } catch (e) {
            console.error(\`Failed to fetch \${intervalParam} for \${tsym}\`, e);
        }
        return { high: null, low: null };
    };

    const [m5, m30, day, week] = await Promise.all([
        fetchKline('m5', 'm5'),
        fetchKline('m30', 'm30'),
        fetchKline('day', 'day'),
        fetchKline('week', 'week')
    ]);

    group.klineMetrics = { m5, m30, day, week };
}
`;

fs.writeFileSync('script.js', script);
console.log('Appended metrics successfully.');
