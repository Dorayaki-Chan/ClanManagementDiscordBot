import fs from 'fs';
import path from 'path';
import type { BotCommand } from '../types/index';

export function loadCommands(): Map<string, BotCommand> {
    const commands = new Map<string, BotCommand>();
    const commandsPath = __dirname;

    // ビルド後は .js として存在する。index.js 自身は除外
    const files = fs.readdirSync(commandsPath)
        .filter(f => f.endsWith('.js') && f !== 'index.js');

    for (const file of files) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(path.join(commandsPath, file));
        const cmd: BotCommand = mod.default ?? mod;
        commands.set(cmd.data.name, cmd);
    }

    return commands;
}
