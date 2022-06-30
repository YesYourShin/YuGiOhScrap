const fs = require('fs');
const axios = require('axios').default;
const cheerio = require('cheerio');
const { mainModule } = require('process');

const fetchCardLimited = async locale => {
    const response = await axios.get(`https://www.db.yugioh-card.com/yugiohdb/forbidden_limited.action?request_locale=${locale}`);
    const $ = cheerio.load(response.data);

    const forbidden = [];
    const limited = [];
    const semiLimited = [];
    const release = [];
    $('#list_forbidden > .list > .t_body > .t_row > .inside > .card_name > .name').map((i_, item) => {
        forbidden.push($(item).text());
    });
    $('#list_limited > .list > .t_body > .t_row > .inside > .card_name > span.name').map((i_, item) => {
        limited.push($(item).text());
    });
    $('#list_semi_limited > .list > .t_body > .t_row > .inside > .card_name > span.name').map((i_, item) => {
        semiLimited.push($(item).text());
    });
    $('#list_release_of_restricted > .list > .t_body > .t_row > .inside > .card_name > span.name').map((i_, item) => {
        release.push($(item).text());
    });

    return (limitedList = { forbidden, limited, semiLimited, release });
};

const main = async () => {
    const locale = 'ja';
    const limitedList = await fetchCardLimited(locale);
};

main();
