const fs = require('fs');
const axios = require('axios').default;
const cheerio = require('cheerio');
const { data } = require('cheerio/lib/api/attributes');

const delay = ms => new Promise(resolve => setTimeout(() => resolve(), ms));
// `Battlin'%20Boxer%20Lead%20Yoke::%2B`
// `Japanese%20kana%20name::%2B`
const conditions = `Battlin'%20Boxer%20Lead%20Yoke`;
const printouts = 'Page%20name|Japanese%20name|Japanese%20kana%20name';
const parameters = 'limit%3D10';

//'Japanese%20name|Page%20name|Japanese%20name|Japanese%20kana%20name|Card%20image|Card%20category|Card%20type|Card%20type%20(short)|Property|Property%20(short)|S/T%20Class|Attribute|Type|Type3|Type4|Level%20string|Rank%20string|Pendulum%20Scale%20String|Link%20Arrows|Link%20Rating|Japanese%20Pendulum%20Effect|Japanese%20lore|Materials|ATK%20string|DEF%20string|Passcode|OCG%20Status|Japanese%20database%20ID|Card%20Gallery%20page%20for|Card%20Tips%20page%20for|Cover%20card|Fusion%20Material|Support|Archetype%20support|Archseries|Primary%20type|Set%20information|Set%20information%20(JSON)|Limitation%20Text';

const main = async () => {
    const response = await axios.get(`http://yugioh.wikia.com/api.php?action=askargs&conditions=${conditions}&printouts=${printouts}&parameters=${parameters}&format=json&api_version=3`);
    console.log(response.data.query.results[0][`Battlin' Boxer Lead Yoke`].printouts);
    // console.log(JSON.stringify(response.data.query.results[0]));
};

main();
