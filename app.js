const _fs = require('fs');
const util = require('util');
const fs =
{
    writeFile: util.promisify(_fs.writeFile)
};
const cheerio = require('cheerio');
const request = require('request-promise-native');
const baseURL = 'https://coinmarketcap.com/';
const headers =
{
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
    Referer: baseURL
}

const main = async () =>
{
    let $;
    let response;
    const assets = [];
    response = await request(
    {
        method: 'GET',
        uri: `${baseURL}/all/views/all/`,
        headers
    });

    $ = cheerio.load(response);
    const rows = $('table#currencies-all tbody tr');
    
    for(let i=0, length=rows.length; i < length; i++)
    {
        const url = `${baseURL}${$('a.currency-name-container', rows.eq(i)).attr('href')}`;
        const symbol = $('td.text-left.col-symbol', rows.eq(i)).html();

        response = await request(
        {
            method: 'GET',
            uri: url,
            headers
        });
        
        $ = cheerio.load(response);
        const img = $('img.currency-logo-32x32').attr('src');
        const h1 = $('div.col-xs-6.col-sm-4.col-md-4 h1.text-large');
        h1.children().each((index, child) => $(child).remove());
        const name = h1.text().trim();

        assets.push(
        {
            name,
            symbol,
            url,
            logos:
            {
                small: img,
                medium: img.replace('32x32', '64x64'),
                large: img.replace('32x32', '128x128')
            }
        });

        console.log(`Added ${name}`);
    }

    await fs.writeFile('assets.json', JSON.stringify(assets));
};

main();