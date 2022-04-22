const client = require("cheerio-httpcli");

async function fetch(URL){
    // const baseUrl = process.env.CLAN_SITE;
    let pslist = [];

    const result = await client.fetch(URL)
    const $ = result.$;
    $('span.__cf_email__').each(function(){
        let email = cfDecodeEmail($(this).attr('data-cfemail'));
        if(email.indexOf('@psn') != -1){
            email = email.replace('@psn', '');
        }
        else{
            email = email.replace('@live', '');
        }
        pslist.push(email);
    });
    let allCount = 0;
    let lineCount = -1;
    let psFlagCount = 0;
    let scrapingData = [];
    $('div.squadrons-members__grid-item').each(function(idx){
        lineCount++;
        const lineData = $(this).text().replace(/\s+/g, '');
        switch(lineCount){
            case 0:
                scrapingData[allCount/6] = {};
                scrapingData[Math.floor(allCount/6)].num = lineData;
                break;
            case 1:
                if(lineData.indexOf('[emailprotected]') != -1){
                    const ign = lineData.replace("[emailprotected]", "") + pslist[psFlagCount];
                    scrapingData[Math.floor(allCount/6)].player = ign;
                    psFlagCount++;
                }
                else{
                    scrapingData[Math.floor(allCount/6)].player = lineData;
                }
                break;
            case 2:
                scrapingData[Math.floor(allCount/6)].personalClanRating = Number(lineData);
                break;
            case 3:
                scrapingData[Math.floor(allCount/6)].activity = Number(lineData);
                break;
            case 4:
                scrapingData[Math.floor(allCount/6)].role = lineData;
                    switch(lineData){
                        case 'Private':
                            scrapingData[Math.floor(allCount/6)].roleid = 3;
                            break;
                        case 'Commander':
                            scrapingData[Math.floor(allCount/6)].roleid = 1;
                            break;
                        case 'Deputy':
                            scrapingData[Math.floor(allCount/6)].roleid = 2;
                            break;
                        case 'Officer':
                            scrapingData[Math.floor(allCount/6)].roleid = 7;
                            break;
                        case 'Sergeant':
                            scrapingData[Math.floor(allCount/6)].roleid = 8;
                            break;
                    }
                break;
            case 5:
                scrapingData[Math.floor(allCount/6)].dateOfEntry = date_change(lineData);
                lineCount = -1;
                break;
        }
        allCount++;
    });
    return scrapingData;
};

/*  @蘇生プログラム  */
function cfDecodeEmail(encodedString) {
    var email = "", r = parseInt(encodedString.substr(0, 2), 16), n, i;
    for (n = 2; encodedString.length - n; n += 2){
        i = parseInt(encodedString.substr(n, 2), 16) ^ r;
        email += String.fromCharCode(i);
    }
    return email;
};

/* 入隊日表示をddmmyyyyからyyyymmddにチェンジ */
function date_change(ddmmyyyy){
    temp = ddmmyyyy.split('.')
    return(temp[2]+"-"+temp[1]+"-"+temp[0])
};

module.exports = {
    fetch
};