import {
	// Client,
	Command,
	CommandLock,
	Message,
	CommandDecorators,
	Logger,
	logger,
	ResourceLoader,
	// Middleware,
	// CompactModeHelper
} from '../../src';
// import * as util from 'util';
const {
	// using,
	// guildOnly,
	group,
	// ownerOnly
} = CommandDecorators;
// const {
// 	resolve,
// 	expect,
// 	// localize
// } = Middleware;

// @ts-ignore
class TestCommandClass extends Command {}

export class TestCommandTwo extends TestCommandClass
{
	public constructor()
	{
		super({
			name: 'test2',
			desc: 'test command 2',
			usage: '<prefix>test2 <test> <foo>',
		});
	}

	public action() {}
}

// @ownerOnly
// @guildOnly
@group('test')
export default class extends TestCommandClass
{
	@logger('Command:test')
	private readonly logger!: Logger;

	public constructor()
	{
		super({
			name: 'test',
			aliases: ['testing', 'testo'],
			desc: 'test command',
			usage: '<prefix>test <test> <foo>',
			guildOnly: true
			// ratelimit: '2/10s'
		});

		this.lock = new CommandLock('help', 'ping');

		// this.use(resolve('foo: BannedUser'));
		// this.use(expect('foo: BannedUser'));
	}

	public async init(): Promise<void>
	{
		await this.logger.debug(await this.client.storage.get('defaultGuildSettings.prefix'));
		await this.logger.debug(await this.client.storage.guilds.first()!.settings.get('prefix'));
		await this.logger.debug('Test command initialized.');
		// throw new Error('foooo');
	}

	// @using((message, args) => [message, args.map(a => a.toUpperCase())])
	// @using(resolve(`test: Member, foo: String`))
	// @using(expect(`test: Member, foo: ['foo', 'bar']`))
	// @using(localize)
	// @using(resolve('foo: CommandGroup'))
	// @using(expect('foo: CommandGroup'))
	public async action(message: Message, [_res, ..._args]: [ResourceLoader, string[]]): Promise<void>
	{
		await new Promise(r => setTimeout(r, 15e3));
		// message.channel.send(res('FOO_BAR_BAZ'));
		// message.channel.send(args.join(' ') || 'MISSING ARGS');
		// this.logger.debug('Command:test', util.inspect(this.group));
		// // throw new Error('foo');
		// message.channel.send('Test command called');
		// await CompactModeHelper.registerButton(message, '❌', () => {
		// 	message.channel.send('X clicked');
		// });
		// await CompactModeHelper.registerButton(message, '✅', () => {
		// 	message.channel.send('Check clicked');
		// });
		// await CompactModeHelper.registerButton(message, '274295184957898752', () => {
		// 	message.channel.send('Lul clicked');
		// });
		// this.respond(message, 'foo bar bazz', { button: 'success' });
		this.respond(message, 'foo bar baz');
	}
}
