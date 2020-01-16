import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { CATEGORIES } from '@util/Constants';

export default class SetWatchingCommand extends Command {
	public constructor() {
		super('set-watching', {
			category: CATEGORIES.OWNER,
			args: [{ id: 'status', match: 'content' }],
		});
	}

	public exec(message: Message, { status }: { status: string }) {
		if (!status) {
			this.client.activityHandler.start();
			return message.util!.send(`${this.client.emojis.success} Set status to default.`);
		}
		this.client.activityHandler.set(status, { type: 'WATCHING' });
		message.util!.send(`${this.client.emojis.success} Set status to \`${status}\`.`);
	}
}