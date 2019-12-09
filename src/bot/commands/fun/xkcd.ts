import { Command, Argument } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';

export default class XkcdCommand extends Command {
	public constructor() {
		super('xkcd', {
			aliases: ['xkcd'],
			description: {
				content: 'Fetches an XKCD comic of your choice. Random if no arguments are given, `-l` for latest, or choose a specific comic.',
				usage: '[comic #] [-l|--latest]',
				examples: ['1234', '-l', ''],
			},
			category: 'Fun',
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			args: [
				{
					match: 'flag',
					flag: ['-l', '--latest'],
					id: 'latest',
				},
				{
					match: 'rest',
					type: Argument.range('number', 0, Infinity),
					id: 'number',
				},
			],
		});
	}

	public async exec(message: Message, { latest, number }: { latest: boolean; number: number }) {
		const latestComic = await fetch('https://xkcd.com/info.0.json').then(res => res.json());
		let comic: IXkcdComic = latestComic;
		const { num: latestComicNumber } = latestComic;
		if (!latest && !number) {
			comic = await fetch(
				`https://xkcd.com/${Math.floor(Math.random() * latestComicNumber)}/info.0.json`,
			).then(res => res.json());
		}
		if (number && number > latestComicNumber) return message.util!.reply(`there's no comic numbered ${number}, the current range is 1-${latestComicNumber}!`);
		if (number && !latest) comic = await fetch(`https://xkcd.com/${number}/info.0.json`).then(res => res.json());

		const { num, title, alt, img } = comic;
		const link = `https://xkcd.com/${num}`;
		return message.util!.send(new MessageEmbed()
			.setTitle(`#${num}: ${title}`)
			.setDescription(`[${alt}](${link})`)
			.setColor('RANDOM')
			.setImage(img));
	}
}

interface IXkcdComic {
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