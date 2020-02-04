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
} from '../../bin';
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

		this.use((message, args) => "bbbbbbb");
	}

	public action() {
		console.log('aaaaa');
	}
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
			// guildOnly: true,
			argOpts: {
				separator: ''
			}
			// ratelimit: '2/10s'
		});

		this.use((message, args) => [message, args]);

		// this.lock = new CommandLock('help', 'ping');

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
		console.log(_res, _args);
		this.respond(message, 'foo bar baz');
	}
}
