import SpectreEmbed from '@structures/SpectreEmbed';
import { CATEGORIES } from '@util/constants';
import Timer from '@util/timer';
import { escapedCodeblock, hastebin } from '@util/util';
import { exec } from 'child_process';
import { Argument, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { inspect, promisify } from 'util';

const execAsync = promisify(exec);

export default class ExecCommand extends Command {
	public constructor() {
		super('exec', {
			aliases: ['exec'],
			args: [
				{
					'default': 5000,
					'flag': ['-t', '--timeout'],
					'id': 'timeout',
					'match': 'option',
					'type': Argument.compose(
						Argument.range('number', 0, 60, true),
						(_, num: unknown) => num as number * 10,
					),
					'unordered': true,
				},
				{
					id: 'expr',
					match: 'rest',
					prompt: {
						start: 'what would you like to execute?',
					},
					unordered: true,
				},
			],
			category: CATEGORIES.OWNER,
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			description: {
				content: 'Executes an expression in the terminal. Set a timeout with `--timeout` (in seconds, max 60).',
				examples: ['git push', 'git add . --timeout 5'],
				usage: '<expression> [flags]',
			},
			ownerOnly: true,
		});
	}

	public async exec(message: Message, { expr, timeout }: { expr: string; timeout: number }) {
		await message.util!.send(`${this.client.emojis.loading} Waiting for response...`);
		const timer = new Timer();
		const result = await execAsync(expr, { timeout })
			.catch(error => ({
				stderr: error.stderr,
				stdout: null,
			}));
		const { stdout, stderr } = result;
		const ms = timer.stop();
		if (!stdout && !stderr) return message.util!.send(`⏱ ${ms}ms\n\nThere was no output.`);
		const embed = new SpectreEmbed()
			.setAuthor('Exec', 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/terminal-512.png')
			.setDescription('')
			.setColor(stderr ? this.client.config.color : 6398041)
			.setFooter(`⏱ ${ms}ms`);
		if (stdout) embed.addField('❯ Output', await this._clean(stdout, 'Output'));
		if (stderr) embed.addField('❯ Error', await this._clean(stderr, 'Error'));
		message.util!.send(embed);
	}

	private async _clean(text: any, name?: string) {
		if (typeof text !== 'string') text = inspect(text, { depth: 1 });
		const raw = text;
		text = escapedCodeblock(text, 'prolog');
		if ((8 + (text as string).length) > 1024) {
			try {
				text = `[${name}](${(await hastebin(raw, { extension: 'prolog' }))})`;
			} catch {
				text = '*An error occured while generating Hastebin link.*';
			}
		}
		return text;
	}
}