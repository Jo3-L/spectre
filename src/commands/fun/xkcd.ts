import SpectreEmbed from '@structures/SpectreEmbed';
import { CATEGORIES } from '@util/constants';
import { oneLineTrim } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import fetch from 'node-fetch';

export default class XkcdCommand extends Command {
	public constructor() {
		super('xkcd', {
			aliases: ['xkcd'],
			args: [
				{
					flag: ['-l', '--latest'],
					id: 'latest',
					match: 'flag',
				},
				{
					id: 'number',
					match: 'rest',
					type: Argument.range('number', 0, Infinity),
				},
			],
			category: CATEGORIES.FUN,
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			description: {
				content: oneLineTrim`Fetches an XKCD comic of your choice. If no arguments are given, a random comic is selected. 
					Use \`-l\` for latest, or choose a specific comic (by it's number).`,
				examples: ['1234', '-l', ''],
				usage: '[comic #] [-l|--latest]',
			},
		});
	}

	public async exec(message: Message, { latest, number }: { latest: boolean; number: number }) {
		const latestComic = await fetch('https://xkcd.com/info.0.json').then(res => res.json());
		let comic: XkcdComic = latestComic;
		const { num: latestComicNumber } = latestComic;
		if (!latest && !number) {
			comic = await fetch(
				`https://xkcd.com/${Math.floor(Math.random() * latestComicNumber)}/info.0.json`,
			).then(res => res.json());
		}
		if (number && number > latestComicNumber) {
			return message.util!.reply(`there's no comic numbered ${number}, the current range is 1-${latestComicNumber}!`);
		}
		if (number && !latest) comic = await fetch(`https://xkcd.com/${number}/info.0.json`).then(res => res.json());

		const { num, title, alt, img } = comic;
		const link = `https://xkcd.com/${num}`;
		return message.util!.send(new SpectreEmbed()
			.setTitle(`#${num}: ${title}`)
			.setDescription(`[${alt}](${link})`)
			.setColor('RANDOM')
			.setImage(img));
	}
}

interface XkcdComic {
	month: string;
	num: number;
	link: string;
	year: string;
	news: string;
	safe_title: string;
	transcript: string;
	alt: string;
	img: string;
	title: string;
	day: string;
}