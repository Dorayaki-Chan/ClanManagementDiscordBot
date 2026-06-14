/**
 * あらゆる時刻表記を標準化する
 * 対応形式: ISO 8601 / Unix timestamp (10 or 13桁) / British式 (DD.MM.YYYY) / Date型 / 引数なし (現在時刻)
 */
export class shapDatetime {
    year: string = '';
    month: string = '';
    day: string = '';
    hour: string = '';
    min: string = '';
    sec: string = '';

    constructor(dt: number | string | Date = new Date()) {
        switch (typeof dt) {
            case 'string':
                if (dt[2] === '.' && dt[5] === '.' && dt.length === 10) {
                    this.#britishStyle(dt);
                } else if (
                    dt[4] === '-' && dt[7] === '-' && dt[10] === 'T' &&
                    dt[13] === ':' && dt[16] === ':' && dt.length === 32
                ) {
                    this.#iso8061(dt);
                }
                break;

            case 'number': {
                const numstr = '' + dt;
                let n = dt;
                if (numstr.length === 10) n *= 1000;
                else if (numstr.length !== 13) break;
                this.#datetype(new Date(n));
                break;
            }

            case 'object':
                if (dt instanceof Date) this.#datetype(dt);
                break;
        }
    }

    #britishStyle(dt: string): void {
        this.day   = dt.substring(0, 2);
        this.month = dt.substring(3, 5);
        this.year  = dt.substring(6);
        this.hour = this.min = this.sec = '00';
    }

    #iso8061(dt: string): void {
        const parts = dt.split(/[-:T+]/);
        const sec = Math.floor(Number(parts[5]));
        this.year  = parts[0];
        this.month = parts[1];
        this.day   = parts[2];
        this.hour  = parts[3];
        this.min   = parts[4];
        this.sec   = sec < 10 ? '0' + sec : '' + sec;
    }

    #datetype(dt: Date): void {
        const pad = (n: number) => n < 10 ? '0' + n : '' + n;
        this.year  = '' + dt.getFullYear();
        this.month = pad(dt.getMonth() + 1);
        this.day   = pad(dt.getDate());
        this.hour  = pad(dt.getHours());
        this.min   = pad(dt.getMinutes());
        this.sec   = pad(dt.getSeconds());
    }

    get getMonth(): string {
        return this.month;
    }

    get getDate(): string {
        return `${this.year}-${this.month}-${this.day}`;
    }

    get getDateTime(): string {
        return `${this.year}-${this.month}-${this.day} ${this.hour}:${this.min}:${this.sec}`;
    }

    get getDateType(): Date {
        return new Date(
            Number(this.year), Number(this.month) - 1, Number(this.day),
            Number(this.hour), Number(this.min), Number(this.sec)
        );
    }
}
