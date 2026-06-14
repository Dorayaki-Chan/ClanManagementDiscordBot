import { shapDatetime } from '../utils/datetime';
import { roles } from './role';
import { Activestory } from './activity';
import type { WtActiveRow } from '../types/index';

export class User {
    id: number | string | null = null;
    ign: string | null = null;
    role: roles | null = null;
    enter_at: shapDatetime | null = null;
    left_at: shapDatetime | null = null;
    isflag: boolean = false;

    set setrole(roleinfo: string[]) {
        this.role = new roles(roleinfo);
    }

    set setEnter(day: number | string | Date) {
        this.enter_at = new shapDatetime(day);
    }

    set setLeft(day: number | string | Date) {
        this.left_at = new shapDatetime(day);
    }
}

export class WotbUser extends User {}

export class ThunderUser extends User {
    nowactive: number = 0;
    allactive: number = 0;
    activestory: Activestory[] = [];

    setActive(): void {
        this.allactive += this.nowactive;
    }

    set setActivestory(activities: WtActiveRow[]) {
        this.activestory = activities.map(act => {
            this.allactive += act.wt_active;
            return new Activestory(act);
        });
    }
}

export class DiscordUser extends User {
    username: string | null = null;
    wotbClass: WotbUser = new WotbUser();
    thunderClass: ThunderUser = new ThunderUser();
    nick: string | null = null;
    subClass: DiscordUser | null = null;
    subign: string | null = null;
    upignFlag: boolean = false;

    /** createDB 時に wotb/thunder クラスとリンクする */
    setgameid(wotbuserclass: WotbUser[], thunderuserclass: ThunderUser[]): void {
        this.role?.sub.forEach(r => {
            if (r.name === 'WorldOfTanksBlitz') {
                const match = wotbuserclass.find(u => u.ign === this.ign);
                if (match) this.wotbClass = match;
            } else if (r.name === 'WarThunder') {
                const match = thunderuserclass.find(u => u.ign === this.ign);
                if (match) this.thunderClass = match;
            }
        });
    }
}
