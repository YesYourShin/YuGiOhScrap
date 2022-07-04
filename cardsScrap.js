const fs = require('fs');
const axios = require('axios').default;
const cheerio = require('cheerio');

/*
    한 일 영 카드 전부 언어가 달라서
    예를 들어 레벨 level レベル가 될 수 있으니 
    한 번에 검사해서 레벨이라는 게 있는지 확인
*/
const check = (cardData, langArr) => {
    let result = false;
    cardData.find(d =>
        langArr.forEach(w => {
            if (d.includes(w)) result = true;
        })
    );
    return result;
};

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

// 카드의 상세 정보
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
    if (locale === 'en') {
        info.title = title[0];
    } else if (locale == 'ko') {
        info.title = title[0];
    } else if (locale === 'ja') {
        info.title = title[1];
        info.title2 = title[0];
    }

    // 카드 상세 데이터
    const cardData = $('#CardTextSet > .CardText > .frame > .item_box > .item_box_value')
        .text()
        .trim()
        .split('\n')
        .map(t => t.trim())
        .filter(t => t);

    console.log(cardData);

    const icon = ['효과', '効果', 'Icon'];
    const level = ['레벨', 'レベル', 'Level'];
    const rank = ['랭크', 'ランク', 'Rank'];
    const link = ['링크', 'リンク', 'Link'];

    if (check(cardData, icon)) {
        // 마법 함정
        info.icon = cardData[0];
    } else if (cardData.length >= 4) {
        // 항목이 4개 이상이면 무조건 몬스터임
        info.attribute = cardData[0];
        if (check(cardData, level)) {
            // 레벨
            info.level = cardData[1].split(' ')[1];
        } else if (check(cardData, rank)) {
            // 랭크
            info.rank = cardData[1].split(' ')[1];
        } else if (check(cardData, link)) {
            // 링크
            info.link = cardData[1].split(' ')[1];
            const linkArrowsData = $('.icon_img_set').attr('class').split('link')[1].split('');
            const linkArrows = [];
            for (linkArrow of linkArrowsData) {
                switch (linkArrow) {
                    case '1':
                        linkArrows.push('↙');
                        break;
                    case '2':
                        linkArrows.push('↓');
                        break;
                    case '3':
                        linkArrows.push('↘');
                        break;
                    case '4':
                        linkArrows.push('←');
                        break;
                    case '6':
                        linkArrows.push('→');
                        break;
                    case '7':
                        linkArrows.push('↖');
                        break;
                    case '8':
                        linkArrows.push('↑');
                        break;
                    case '9':
                        linkArrows.push('↗');
                        break;
                }
            }

            info.linkArrow = linkArrows;
            console.log(info.linkArrow);
        }
        info.atk = cardData[2];
        info.def = cardData[3];

        const species = $('#CardTextSet > .CardText > .frame > .item_box > .species')
            .text()
            .trim()
            .split('\n')
            .map(t => t.trim())
            .filter(t => t)
            .join(' ');
        info.species = species;

        if (cardData.length === 5) {
            // 펜듈럼 스케일
            info.pScale = cardData[4];

            // 펜듈럼 효과
            info.pEffect = $('#CardTextSet > .CardText > .frame > .item_box_text').text().trim();
        }
    }

    // info.cardText = $('#CardTextSet > .CardText > .item_box_text').children('.text_title').remove().end().text().trim();
    /*
        children 해당 요소 출력
        remove 해당 요소 삭제
    */
    info.cardText = $('#CardTextSet > .CardText > .item_box_text').children('.text_title').remove().text();
    // console.log(info.cardText);
    //     // 펜듈럼 카드
    //     if (cardData.length === 5) {
    //         // 펜듈럼 스케일
    //         info.pScale = cardData[4];

    //         // 펜듈럼 효과
    //         info.pEffect = $('#CardTextSet > .CardText > .frame > .item_box_text').text().trim();
    //     }
    // }
    // info.cardText = $('#CardTextSet > .CardText > .item_box_text').children('.text_title').remove().end().text().trim();

    // console.log(info);

    return info;
};

// const fetchCardNumber = async(title);

const main = async () => {
    const item = 100;
    const locale = 'ko';
    const data = [];
    for (let page = 1; true; page++) {
        const ids = await fetchCardList(item, page, locale);
        if (!ids) {
            return;
        }
        for (const id of ids) {
            // const info = await fetchCardInfo(id, locale);
            // 마법
            // const info = await fetchCardInfo(7315, 'locale');
            // 효과 몬스터
            // const info = await fetchCardInfo(12824, 'locale');
            // 엑시즈
            // const info = await fetchCardInfo(10531, 'locale');
            // 팬듈럼
            // const info = await fetchCardInfo(11696, locale);
            // 링크
            const info = await fetchCardInfo(16537, 'locale');
            data.push(info);
        }
    }
};

main();
