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
    $('#list_forbidden > .list > .t_body > .t_row > .inside > .card_name > input[type="hidden"]').map((i_, item) => {
        const value = $(item).val().split('=');
        forbidden.push(value[value.length - 1]);
    });
    $('#list_limited > .list > .t_body > .t_row > .inside > .card_name > input[type="hidden"]').map((i_, item) => {
        const value = $(item).val().split('=');
        limited.push(value[value.length - 1]);
    });
    $('#list_semi_limited > .list > .t_body > .t_row > .inside > .card_name > input[type="hidden"]').map((i_, item) => {
        const value = $(item).val().split('=');
        semiLimited.push(value[value.length - 1]);
    });
    $('#list_release_of_restricted > .list > .t_body > .t_row > .inside > .card_name > input[type="hidden"]').map((i_, item) => {
        const value = $(item).val().split('=');
        release.push(value[value.length - 1]);
    });
    return (limitedList = { forbidden, limited, semiLimited, release });
};

const main = async () => {
    const locale = 'ko';
    // const jsonData = require(`./output_${locale}/output_${locale}-1.json`);

    const limitedList = await fetchCardLimited(locale);
    console.log(limitedList);
    // for (const limited in limitedList) {
    //     for (const cardId of limitedList[limited]) {

    //         for (const data of jsonData) {
    //             console.log(data);
    //         }
    //     }
    // }
};

main();
