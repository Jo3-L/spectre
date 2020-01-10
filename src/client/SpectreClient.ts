import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, AkairoModule } from 'discord-akairo';
import { join } from 'path';
import { token, prefix, activities, owner, version, color, db, emojis, categoryImages } from '../../config';
import ActivityHandler, { Activity } from '../structures/ActivityHandler';
import SpectreLogger from '../structures/Logger';
import Database from '../structures/Database';
import TypeORMProvider from '../structures/SettingsProvider';
import { Logger } from 'winston';
import { GuildEmojiStore } from 'discord.js';
import { Connection } from 'typeorm';
import { Guild } from '../models/Guild';
import AssetHandler from '../structures/AssetHandler';

Object.defineProperty(AkairoModule.prototype, 'logger', { value: SpectreLogger });
Object.defineProperties(GuildEmojiStore.prototype, {
	loading: { value: emojis.loading },
	success: { value: emojis.success },
	error: { value: emojis.error },
	neutral: { value: emojis.neutral },
});

declare module 'discord-akairo' {
	interface AkairoClient {
		version: string;
		logger: Logger;
		db: Connection;
		settings: TypeORMProvider;
		config: SpectreConfig;
		commandHandler: CommandHandler;
		inhibitorHandler: InhibitorHandler;
		listenerHandler: ListenerHandler;
		activityHandler: ActivityHandler;
		assetHandler: AssetHandler;
	}

	interface AkairoModule {
		logger: Logger;
	}
}

declare module 'discord.js' {
	interface GuildEmojiStore {
		loading: string;
		success: string;
		error: string;
		neutral: string;
	}
}

export interface SpectreConfig {
	prefix: string | string[];
	token: string;
	color: number;
	version: string;
	emojis: { success: string; loading: string; error: string; neutral: string };
	db: string;
	owner: string;
	activities?: Activity[];
	categoryImages: Record<string, string>;
}

export default class SpectreClient extends AkairoClient {
	public version = version;
	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		aliasReplacement: /-/g,
		allowMention: true,
		prefix: prefix,
		handleEdits: true,
		storeMessages: true,
		commandUtil: true,
		commandUtilLifetime: 300000,
		ignoreCooldown: owner,
		defaultCooldown: 3000,
		argumentDefaults: {
			prompt: {
				modifyStart: (message, str) => `${message.author}, ${str}\n\n*Type \`cancel\` to cancel the command.*`,
				modifyRetry: (message, str) => `${message.author}, ${str}\n\n*Type \`cancel\` to cancel the command.*`,
				timeout: 'The command timed out.',
				ended: 'Three tries and you still didn\'t get it. Try again.',
				cancel: 'The command has been cancelled.',
				retries: 3,
				time: 30000,
			},
		},
	});

	public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
		directory: join(__dirname, '..', 'inhibitors'),
	});

	public listenerHandler: ListenerHandler = new ListenerHandler(this, {
		directory: join(__dirname, '..', 'listeners'),
	});

	public logger = SpectreLogger;
	public db!: Connection;
	public settings!: TypeORMProvider;
	public config = { token, prefix, color, owner, db, activities, version, categoryImages, emojis };
	public activityHandler: ActivityHandler = new ActivityHandler(this, this.config.activities);
	public assetHandler: AssetHandler = new AssetHandler(join(__dirname, '..', 'assets'));

	public constructor() {
		super({
			ownerID: owner, disableEveryone: true, disabledEvents: ['TYPING_START', 'PRESENCE_UPDATE'],
		});
	}

	private async _init() {
		this.logger.info('Spectre is starting up...');
		// Load handlers
		this.commandHandler
			.useInhibitorHandler(this.inhibitorHandler)
			.useListenerHandler(this.listenerHandler);
		// Load commands
		this.commandHandler.loadAll();
		this.logger.info(`Loaded ${this.commandHandler.modules.size} commands.`);
		// Set emitters
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			inhibitorHandler: this.inhibitorHandler,
			process,
		});
		// Load inhibitors
		this.inhibitorHandler.loadAll();
		this.logger.info(`Loaded ${this.inhibitorHandler.modules.size} inhibitors.`);
		// Load listeners
		this.listenerHandler.loadAll();
		this.logger.info(`Loaded ${this.listenerHandler.modules.size} listeners.`);
		// Connect to database
		this.db = Database.get('spectre');
		await this.db.connect();
		this.logger.info('Connected to database.');
		// Initialize the Settings Provider
		this.settings = new TypeORMProvider(this.db.getRepository(Guild));
		await this.settings.init();
		this.logger.info('Initialized the Settings Provider.');
		// Load assets
		await this.assetHandler.init();
		this.logger.info(`Loaded ${this.assetHandler.size} assets.`);
	}

	public async start() {
		await this._init();
		this.login(token);
	}
}