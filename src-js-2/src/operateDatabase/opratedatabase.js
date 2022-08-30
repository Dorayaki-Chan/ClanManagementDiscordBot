const mysql = require("mysql2/promise");
const {WotbUser, DiscordUser, ThunderUser} = require('../structures/profile');
const {shapDatetime} = require('../change-datetime-type/toDatetime');

// 秘密ファイル
const fs = require('fs');
const ini = require('ini');
const config = ini.parse(fs.readFileSync('./config/config.ini', 'utf-8'));

const db_setting = {
    host: config.Database.host,
    user: config.Database.user,
    password: config.Database.password,
    database: 'clandb',
    supportBigNumbers: true, // BigNumberサポート有効化
    bigNumberStrings: true, // BigNumberを文字列として扱う
};

class OperationDatabase{
    /**
     * 
     * @param {*} newusers APIの結果(ユーザークラス)を渡します 
     */
    static async Daily(wotbNewusers, thunderNewusers, discordNewusers){

        /** Wotb **/
        const wotbDaily = (async(newusers)=>{
            let mycon = null;
            try {
                mycon = await mysql.createConnection(db_setting);
            }catch(e){
                console.log(e);
            }
            //データベースから存在フラグがTrueのだけ受け取ります
            const [oldusers, gomi] = await mycon.query(`SELECT * FROM w_wotb_members NATURAL INNER JOIN r_roles WHERE w_is_flag = true `);
            
            //退室者を考えます
            const lefters = ((olds, news) => {
                let result = [];
                olds.forEach(older => {
                    let isflag = false;
                    news.forEach(newer =>{
                        if(newer.id == older.w_user_id){
                            isflag = true;
                        }
                    });
                    if(!isflag){
                        //ユーザークラス化
                        let user = new WotbUser();
                        user.id = older.w_user_id;
                        user.ign = older.w_ign;
                        user.setrole = [older.r_dis_id];
                        user.setEnter = older.w_enter_at;
                        if(older.w_left_at){
                            user.setLeft = older.w_left_at;
                        }
                        user.isflag = false;
                        result.push(user);
                    }
                });
                return result;
            })(oldusers, newusers);
            //入室者を考えます
            const enters = ((olds, news) => {
                let result = [];
                news.forEach(newer => {
                    let isflag = false;
                    olds.forEach(older =>{
                        if(newer.id == older.w_user_id){
                            isflag = true;
                        }
                    });
                    if(!isflag){
                        result.push(newer);
                    }
                });
                return result;
            })(oldusers, newusers);
            
            //退室者に関するデータベース操作
            if(lefters.length){
                (async(mycon)=> {
                    let text = '';
                    lefters.forEach(lefter => {
                        text += `w_user_id = ${lefter.id} or `;
                    });
                    const q_text = text.slice(0, -3);
                    const day = new shapDatetime();
                    const [result, gomi] = await mycon.query(`UPDATE w_wotb_members SET w_is_flag = false, w_left_at = '${day.getDateTime}' WHERE ${q_text}`);
                })(mycon);
            }
            //入室者に関するデータベース操作
            if(enters.length){
                (async(mycon)=> {
                    let text = '';
                    enters.forEach(enter => {
                        text += `(${enter.id}, '${enter.ign}', ${enter.role.main.id}, '${enter.enter_at.getDateTime}', true),`;
                    });
                    const q_text = text.slice(0, -1);;
                    const [result, gomi] = await mycon.query(`INSERT INTO w_wotb_members(w_user_id, w_ign, r_id, w_enter_at, w_is_flag) VALUES ${q_text} AS new ON DUPLICATE KEY UPDATE w_is_flag = new.w_is_flag`);
                })(mycon);
            }
            //デバグ
            console.log("B退室");
            console.log(lefters);
            console.log("B入室");
            console.log(enters);
            if( mycon ){
                mycon.end();
            }
            return {lefters:lefters, enters:enters};
        })(wotbNewusers);
        
        /** WarThunder **/
        const thunderDaily = (async(newusers)=>{
            let mycon = null;
            try {
                mycon = await mysql.createConnection(db_setting);
            }catch(e){
                console.log(e);
            }
            
            //データベースから存在フラグがTrueのだけ受け取ります
            const [oldusers, gomi] = await mycon.query(`SELECT * FROM t_wt_members NATURAL INNER JOIN r_roles WHERE t_is_flag = true `);
            //退室者を考えます
            const lefters = ((olds, news) => {
                let result = [];
                olds.forEach(older => {
                    let isflag = false;
                    news.forEach(newer =>{
                        if(newer.ign == older.t_ign){
                            isflag = true;
                        }
                    });
                    if(!isflag){
                        //ユーザークラス化
                        let user = new ThunderUser();
                        user.id = older.t_user_id;
                        user.ign = older.t_ign;
                        user.setrole = [older.r_dis_id];
                        user.setEnter = older.t_enter_at;
                        if(older.t_left_at){
                            user.setLeft = older.t_left_at;
                        }
                        user.allactive = older.t_all_active;
                        user.isflag = false;
                        result.push(user);
                    }
                });
                return result;
            })(oldusers, newusers);
            //入室者を考えます
            const enters = ((olds, news) => {
                let result = [];
                news.forEach(newer => {
                    let isflag = false;
                    olds.forEach(older =>{
                        if(newer.ign == older.t_ign){
                            isflag = true;
                        }
                    });
                    if(!isflag){
                        result.push(newer);
                    }
                });
                return result;
            })(oldusers, newusers);
            
            //退室者に関するデータベース操作
            if(lefters.length){
                (async(mycon)=> {
                    let text = '';
                    lefters.forEach(lefter => {
                        text += `t_user_id = ${lefter.id} or `;
                    });
                    const q_text = text.slice(0, -3);
                    const day = new shapDatetime();
                    const [result, gomi] = await mycon.query(`UPDATE t_wt_members SET t_is_flag = false, t_left_at = '${day.getDateTime}' WHERE ${q_text}`);
                })(mycon);
            }
            //入室者に関するデータベース操作
            if(enters.length){
                await Promise.all(enters.map(async(user) => {
                    const [result, gomi] = await mycon.query(`INSERT INTO t_wt_members(t_ign, r_id, t_enter_at, t_is_flag) VALUES ('${user.ign}', ${user.role.main.id}, '${user.enter_at.getDateTime}', true) AS new ON DUPLICATE KEY UPDATE t_is_flag = new.t_is_flag`);
                    user.id = result.insertId;
                    return 0;
                }));       
            }
            
            //デバグ
            /*
            console.log("TH退室", lefters.length);
            lefters.forEach(m => {
                console.log(m.id, m.ign, m.nowactive, m.allactive);
            });
            console.log("\n\n\n");
            console.log("TH入室", enters.length);
            enters.forEach(m => {
                console.log(m.id, m.ign, m.nowactive, m.allactive);
            });
            */
            if( mycon ){
                mycon.end();
            }
            return {lefters:lefters, enters:enters};
        })(thunderNewusers);
        const result_test = await Promise.all([wotbDaily, thunderDaily]);
        /** Discord **/
        /**
         * ※Discord入室者の把握
         *  入室者とWT・WotBの紐づけ
         * ※Discord退室者の把握
         *  在籍をflaseにするだけ
         * ※ゲーム退室者を元老に降格
         * ※ゲーム入室者をクランメンバーに昇格
         */
        const discordDaily = (async(newusers)=>{
            let mycon = null;
            try {
                mycon = await mysql.createConnection(db_setting);
            }catch(e){
                console.log(e);
            }
            //30日ここから
            //データベースから存在フラグがTrueのだけ受け取ります
            const [oldusers, gomi] = await mycon.query(`SELECT * FROM d_discord_members NATURAL INNER JOIN r_roles WHERE d_is_flag = true`);
            //退室者を考えます
            const lefters = ((olds, news) => {
                let result = [];
                olds.forEach(older => {
                    let isflag = false;
                    news.forEach(newer =>{
                        if(newer.id == older.d_user_id){
                            isflag = true;
                        }
                    });
                    if(!isflag){
                        //ユーザークラス化
                        let user = new DiscordUser();
                        user.id = older.d_user_id;
                        user.ign = older.d_ign;
                        user.setrole = [older.r_dis_id];
                        user.setEnter = older.d_enter_at;
                        if(older.d_left_at){
                            user.setLeft = older.d_left_at;
                        }
                        user.username = older.d_name;
                        user.nick = older.d_nick;
                        user.setgameid();
                        user.isflag = false;
                        result.push(user);
                    }
                });
                return result;
            })(oldusers, newusers);
            //入室者を考えます
            const enters = ((olds, news) => {
                let result = [];
                news.forEach(newer => {
                    let isflag = false;
                    olds.forEach(older =>{
                        if(newer.id == older.d_user_id){
                            isflag = true;
                        }
                    });
                    if(!isflag){
                        result.push(newer);
                    }
                });
                return result;
            })(oldusers, newusers);
            const [test1, test2] = await Promise.all([wotbDaily, thunderDaily]);
            
            console.log("\n\n\n");
            oldusers.forEach(element => {
                console.log(element.d_user_id ,element.d_name, element.d_ign);
            });
            if( mycon ){
                mycon.end();
            }
        })(discordNewusers);

    }
    /**
     * 
     * @param {*} dbusers SELECTの一個目のResultをぶち込む 
     */
    static async #dbToUsers(dbusers){
        if(!dbusers.length){
            return [];
        }
        // どのテーブルか判断する
        if(Object.keys(dbusers[0]).includes('d_user_id')){
            const discordClasses = (async(dbusers)=>{
                const classUsers = dbusers.map((dbuser)=>{
                    let user = new DiscordUser();
                    user.id = dbuser.d_user_id;
                    user.ign = dbuser.d_ign;
                    user.setrole = [dbuser.r_dis_id];
                    user.setEnter = dbuser.d_enter_at;
                    if(older.d_left_at){
                        user.setLeft = dbuser.d_left_at;
                    }
                    user.username = dbuser.d_name;
                    user.nick = dbuser.d_nick;
                    //要検討
                    user.setgameid();
                    user.isflag = dbuser.d_is_flag;
                    return user;
                });
                return classUsers;
            })(dbusers);
            return discordClasses;
        }
        else if(Object.keys(dbusers[0]).includes('w_user_id')){
            const wotbClasses = (async(dbusers)=>{
                const classUsers = dbusers.map((dbuser)=>{
                    let user = new WotbUser();
                    user.id = dbuser.w_user_id;
                    user.ign = dbuser.w_ign;
                    user.setrole = [dbuser.r_dis_id];
                    user.setEnter = dbuser.w_enter_at;
                    if(dbuser.w_left_at){
                        user.setLeft = dbuser.w_left_at;
                    }
                    user.isflag = dbuser.w_is_flag;
                    return user;
                });
                return classUsers;
            })(dbusers);
            return wotbClasses;
        }
        else if(Object.keys(dbusers[0]).includes('t_user_id')){
            const thunderClasses = (async(dbusers)=>{
                let mycon = null;
                try {
                    mycon = await mysql.createConnection(db_setting);
                }catch(e){
                    console.log(e);
                }
                const classUsers = dbusers.map((dbuser)=>{
                    const [result, gomi] = mycon.query(`SELECT * FROM wt_actives WHERE t_user_id = ${dbusers.t_user_id}`);
                    let user = new ThunderUser();
                    user.id = dbusers.t_user_id;
                    user.ign = dbusers.t_ign;
                    user.setrole = [dbusers.r_dis_id];
                    user.setEnter = dbusers.t_enter_at;
                    if(dbusers.t_left_at){
                        user.setLeft = dbusers.t_left_at;
                    }
                    user.allactive = dbusers.t_all_active;
                    user.isflag = dbusers.t_is_flag;
                    user.setActivestory = result;
                    return user;
                });
                if( mycon ){
                    mycon.end();
                }
                return classUsers;
            })(dbusers);
            return thunderClasses;
        }
        else{
            console.log("bak-ka");
            return "err";
        }
        
    }
}

module.exports = {
    OperationDatabase
}