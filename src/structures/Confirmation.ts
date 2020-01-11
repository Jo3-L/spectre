import { Message } from 'discord.js';
import SpectreEmbed from '@structures/SpectreEmbed';

const RESPONSES = {
	YES: ['yes', 'y', 'yup'],
	NO: ['no', 'n', 'nah', 'nope'],
	CANCEL: ['cancel'],
};

export enum Responses {
	Yes = 0, No, Canceled, Timeout,
}

export default class Confirmation {
	public constructor(public readonly message: Message, public readonly embed: SpectreEmbed, public readonly timeout = 15000) { }
	public async run() {
		const filter = (m: Message) => m.author.id === this.message.author.id &&
			Object.values(RESPONSES).flat().includes(m.content);
		const message = await this.message.channel.send(this.embed);
		let response: Message;
		try {
			response = (await message.channel.awaitMessages(filter, {
				max: 1,
				time: this.timeout,
				errors: ['time'],
			})).first()!;
		} catch { return Responses.Timeout; }

		const content = response.content.toLowerCase();
		if (RESPONSES.YES.includes(content)) return Responses.Yes;
		if (RESPONSES.CANCEL.includes(content)) return Responses.Canceled;
		return Responses.No;
	}
}