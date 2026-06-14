import roleDataRaw from '../../template/roles.json';
import type { RoleData } from '../types/index';

const roleData = roleDataRaw as RoleData[];

/** ユーザー名・ニックネームから IGN を推測する */
export class WhatYourIgn {
    static getign(username: string, nickname: string | null): string {
        const name = nickname ?? username;
        return WhatYourIgn.#whichRowOrMake(name);
    }

    static #whichRowOrMake(name: string): string {
        if (name[name.length - 1] === ')') {
            const start = name.lastIndexOf('(') + 1;
            return name.substring(start, name.length - 1);
        }
        return name;
    }
}

/** Discord ロール ID / othername から RoleData を解決する */
export class WhatYourRole {
    static resolve(roleList: string[]): RoleData[] {
        return roleList
            .map(role =>
                roleData.find(
                    r => r.discordid === role || r.othername.includes(role)
                )
            )
            .filter((r): r is RoleData => r !== undefined);
    }
}
