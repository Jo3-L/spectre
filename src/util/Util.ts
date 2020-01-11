import fetch from 'node-fetch';
import { PermissionString } from 'discord.js';
import { TemplateTag, replaceResultTransformer } from 'common-tags';

export function ordinal(cardinal: number) {
	const cent = cardinal % 100;
	const dec = cardinal % 10;

	if (cent >= 10 && cent <= 20) return `${cardinal}th`;
	switch (dec) {
		case 1: return `${cardinal}st`;
		case 2: return `${cardinal}nd`;
		case 3: return `${cardinal}rd`;
		default: return `${cardinal}th`;
	}
}

export const escapeAllMentions = (str: string) => str.replace(/@/g, `@${String.fromCharCode(8203)}`);

export async function hastebin(content: string, {
	url = 'https://hasteb.in', extension = 'js',
}: HastebinOptions = { url: 'https://hasteb.in', extension: 'js' }) {
	const res = await fetch(`${url}/documents`, {
		method: 'POST',
		body: content,
		headers: { 'Content-Type': 'text/plain' },
	});

	if (!res.ok) throw new Error(res.statusText);
	const { key } = await res.json() as HastebinResponsePartial;
	return `${url}/${key}.${extension}`;
}

export const calculateLevel = (xp: number) => Math.floor(0.1 * Math.sqrt(xp));
export const calculateXp = (level: number) => Math.floor(100 * (level ** 2));
export const codeblock = (content: string, lang = '') =>
	`\`\`\`${lang}\n${content}\`\`\``;

export const escapedCodeblock = (content: string, lang = '') =>
	codeblock(content.replace(/`/g, `\`${String.fromCharCode(8203)}`), lang);

export function humanizePermissionName(permission: PermissionString) {
	return permission
		.replace(/_/g, ' ')
		.split(' ')
		.map(word => ['VAD', 'TTS'].includes(word) ? word : `${word[0]}${word.substr(1).toLowerCase()}`)
		.join(' ');
}

export const capitalize = (word: string) => `${word[0].toUpperCase()}${word.substr(1).toLowerCase()}`;
export const trim = (str: string, length: number | EmbedLimits, cutoff = '...') => str.length > length
	? `${str.slice(0, length - 3)}${cutoff}`
	: str;

export enum EmbedLimits {
	Title = 256,
	Author = 256,
	Description = 2048,
	FieldTitle = 256,
	FieldValue = 1024,
	EmbedFooter = 2048,
}

export const removeBlankLines = new TemplateTag(replaceResultTransformer(/^\s*[\r\n]/gm, ''));

/* eslint-disable */
export const emojis = {
	a: '🇦', b: '🇧', c: '🇨', d: '🇩',
	e: '🇪', f: '🇫', g: '🇬', h: '🇭',
	i: '🇮', j: '🇯', k: '🇰', l: '🇱',
	m: '🇲', n: '🇳', o: '🇴', p: '🇵',
	q: '🇶', r: '🇷', s: '🇸', t: '🇹',
	u: '🇺', v: '🇻', w: '🇼', x: '🇽',
	y: '🇾', z: '🇿', '0': '0⃣', '1': '1⃣',
	'2': '2⃣', '3': '3⃣', '4': '4⃣', '5': '5⃣',
	'6': '6⃣', '7': '7⃣', '8': '8⃣', '9': '9⃣',
	'10': '🔟', '#': '#⃣', '*': '*⃣',
	'!': '❗', '?': '❓',
};
/* eslint-enable */
export function emojify(str: string) {
	return [...str].map(v => v in emojis ? emojis[v as keyof typeof emojis] : ' ').join('');
}

interface HastebinOptions {
	url?: string;
	extension?: string;
}
interface HastebinResponsePartial { key: string }