const fs = require('fs');
const axios = require('axios').default;
const cheerio = require('cheerio');

// 각 카드의 페이지 번호 가져오기
const fetchCardList = async (item, page, locale) => {
    const response = await axios.get(`https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&rp=${item}&page=${page}&request_locale=${locale}`);
    const $ = cheerio.load(response.data);
    const ids = [];

    if ($.html().includes('no_data')) {
        return;
    }

    $('.list > .t_row > input.link_value').map((i_, item) => {
        /*  i는 번호, item은 링크 하나
            val()은 값을 가져오는 데에 사용됨
            그래서 링크의 값을 가져옴
            그리고 split으로 =을 기준으로 자르면 카드 페이지의 아이디를 자를 수 있음
            배열의 마지막 요소는 .length -1로 가져올 수 있음
            가져온 아이디를 위 배열에 넣기
        */
        const values = $(item).val().split('=');
        ids.push(values[values.length - 1]);
    });
    return ids;
};

const fetchCardInfo = async (id, locale) => {
    const info = {};
    const response = await axios.get(`https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid=${id}&request_locale=${locale}`);
    const $ = cheerio.load(response.data);

    /*
        .text()로 요소의 내용을 가져옴
        .split()으로 \n(탭)을 기준으로 나눠서 배열로 저장
        .map으로 배열 요소 전부 돌아서 새 배열 만듦
        .trim()은 양 끝의 공백을 제거
        .filter로 배열 안에 공백인 요소를 제거
    */
    const title = $('#cardname h1')
        .text()
        .split('\n')
        .map(t => t.trim())
        .filter(t => t);
    console.log();
    if (locale === 'en' || 'ko') {
        info.title = title[0];
    } else if (locale === 'ja') {
        info.title = title[1];
        info.title2 = title[0];
    }
    console.log(info);
    const limited = $('#CardSet > .forbidden_limited_ber > .title').text();
    limited !== '' ? (info.limited = limited) : false;

    // 카드 상세 데이터
    const cardData = $('#CardTextSet > .CardText > .frame > .item_box > .item_box_value')
        .text()
        .trim()
        .split('\n')
        .map(t => t.trim())
        .filter(t => t);

    if (cardData.length === 1) {
        // 마법 함정 타입
        info.icon = cardData[0];
    } else if (cardData.length >= 4) {
        const species = $('#CardTextSet > .CardText > .frame > .item_box > .species')
            .text()
            .trim()
            .split('\n')
            .map(t => t.trim())
            .filter(t => t);

        info.attribute = cardData[0];

        const lvRankLink = $('#CardTextSet > .CardText > .frame > .item_box > .item_box_title')
            .text()
            .trim()
            .split('\n')
            .map(t => t.trim())
            .filter(t => t)[1];

        if (locale === 'ko') {
            // 랭크 링크 레벨
            lvRankLink === '랭크' ? (info.rank = cardData[1]) : lvRankLink === '링크' ? (info.link = cardData[1]) : (info.level = cardData[1]);
        } else if (locale === 'ja') {
            lvRankLink === 'ランク' ? (info.rank = cardData[1]) : lvRankLink === 'リンク' ? (info.link = cardData[1]) : (info.level = cardData[1]);
        }
        info.atk = cardData[2];
        info.def = cardData[3];
        info.monsterType = species[0];

        info.cardType = species.join(' ');
        // info.cardType1 = species[2];
        // species.length >= 5 ? (info.cardType2 = species[4]) : false;
        // species.length === 7 ? (info.cardType3 = species[6]) : false;

        // 펜듈럼 카드
        if (cardData.length === 5) {
            // 펜듈럼 스케일
            info.pScale = cardData[4];

            // 펜듈럼 효과
            info.pEffect = $('#CardTextSet > .CardText > .frame > .item_box_text').text().trim();
        }
    }
    info.cardText = $('#CardTextSet > .CardText > .item_box_text').children('.text_title').remove().end().text().trim();

    return info;
};

const main = async () => {
    for (let page = 1; true; page++) {
        const item = 100;
        const locale = 'ko';
        const ids = await fetchCardList(item, page, locale);
        if (!ids) {
            return;
        }
        for (const id of ids) {
            const info = await fetchCardInfo(id, locale);
        }
    }
};

main();
