import { WhatYourRole } from '../utils/ign';
import type { RoleData } from '../types/index';

export class role {
    id: number;
    name: string;
    discordid: string;
    type: 'main' | 'sub';
    color?: string;

    constructor(roleinfo: RoleData) {
        this.id = roleinfo.id;
        this.name = roleinfo.name;
        this.discordid = roleinfo.discordid;
        this.type = roleinfo.type;
        this.color = roleinfo.color;
    }
}

/** メインロール 1 個とサブロール複数を保持するコンテナ */
export class roles {
    main: role | null = null;
    sub: role[] = [];

    constructor(rolelist: string[]) {
        const resolved = WhatYourRole.resolve(rolelist);
        for (const element of resolved) {
            if (element.type === 'main') {
                this.main = new role(element);
            } else if (element.type === 'sub') {
                this.sub.push(new role(element));
            }
        }
    }
}
