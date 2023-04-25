/**
 *　あらゆる時刻表記をDateTimeに変換する。
 *  "2018-10-07T05:02:13.243000+00:00"
 *  "タイムスタンプ(10 or 13桁)"
 *  "11.02.2022"
 *  "Date型"
 *  引数なき場合は現在時刻
 */
class shapDatetime{
    
    /**
     * 
     * @param {number | string} dt 
     */
    constructor(dt = new Date()){
        switch (typeof(dt)) {
            case 'string':
                if((dt[2] === '.' && dt[5] === '.') && dt.length === 10){
                    //console.log(`${dt}はイギリス式`);
                    this.#britishStyle(dt);
                }
                else if(((((dt[4] === '-' && dt[7] === '-') && dt[10] === 'T') && dt[13] === ':') && dt[16]=== ':') && (dt.length === 32)){
                    //console.log(`${dt}はISO`);
                    this.#iso8061(dt);
                }
                
                break;
            
            case 'number':
                const numstr = '' + dt;
                if(numstr.length === 10){
                    //console.log(`${dt}は10桁のtimestamp`);
                    dt *= 1000;
                }
                else if (numstr.length === 13){
                    //console.log(`${dt}は13桁のtimestamp`);
                }
                else{
                    break;
                }
                this.#datetype(new Date(dt));
                break;
            case 'object':
                if(dt.constructor.name === 'Date'){
                    //console.log(`${dt}はDate型`);
                    this.#datetype(dt);
                }
                break;
            default:
                console.log(`${dt}は...意味不明な型です`);
                break;
        }        
    }
    #britishStyle(dt){
        let date = {year:'', month:'', day:''};
        for(let i in dt){
            if(i < 2){
                date.day += dt[i];
            }
            else if (i < 3){
                continue;
            }
            else if(i < 5){
                date.month += dt[i];
            }
            else if(i < 6){
                continue;
            }
            else{
                date.year += dt[i];
            }
        }
        this.year = ''+date.year;
        this.month = ''+date.month;
        this.day = ''+date.day;
        this.hour = '00';
        this.min = '00';
        this.sec = '00';
    }
    #iso8061(dt){
        const datepack = dt.split(/-|:|T|\+/);
        const sec = Math.floor(Number(datepack[5]));
        this.year = ''+datepack[0];
        this.month = ''+datepack[1];
        this.day = ''+datepack[2];
        this.hour = ''+datepack[3];
        this.min = ''+datepack[4];
        this.sec = ''+((sec<10)?'0'+sec:''+sec);

    }
    #datetype(dt){
        // 日付を数字として取り出す
        let year  = dt.getFullYear();
        let month = dt.getMonth()+1;
        let day   = dt.getDate();
        let hour  = dt.getHours();
        let min   = dt.getMinutes();
        let sec   = dt.getSeconds();
        // 値が1桁であれば '0'を追加 
        if (month < 10) {
            month = '0' + month;
        }
        if (day   < 10) {
            day   = '0' + day;
        }
        if (hour   < 10) {
            hour  = '0' + hour;
        }
        if (min   < 10) {
            min   = '0' + min;
        }
        if (sec   < 10){
            sec   = '0' + sec;
        }
        this.year = ''+year;
        this.month = ''+month;
        this.day = ''+day;
        this.hour = ''+hour;
        this.min = ''+min;
        this.sec = ''+sec;
    }
    #hutaketa(num){
        return (num>9)?''+num:'0'+num;
    }
    /**
     * @returns {string} 月
     */
    get getMonth(){
        return this.month;
    }
    /**
     * @returns {string} 年-月-日
     */
    get getDate(){
        return this.year + '-' + this.month + '-' +this.day;
    }
    /**
     * @returns {string} 年-月-日 時:分:秒
     */
    get getDateTime(){
        return this.year + '-' + this.month + '-' +this.day + ' ' + this.hour + ':' + this.min + ':' + this.sec;
    }
    get getDateType(){
        return new Date(this.year, this.month - 1, this.day, this.hour, this.min, this.sec);
    }
    get getDateTimeForFileName(){
        return this.year + this.month + this.day + this.hour + this.min + this.sec;
    }
}

module.exports = {
    shapDatetime
}
