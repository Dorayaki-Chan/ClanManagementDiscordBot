import { shapDatetime } from '../utils/datetime';
import type { WtActiveRow } from '../types/index';

export class Activestory {
    activity: number;
    addDay: shapDatetime;

    constructor(db: WtActiveRow) {
        this.activity = db.wt_active;
        this.addDay = new shapDatetime(db.wt_created_at);
    }
}
