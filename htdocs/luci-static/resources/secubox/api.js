'use strict';
'require baseclass';
'require rpc';

return baseclass.extend({
	status: rpc.declare({
		object: 'luci.secubox',
		method: 'status',
		expect: { }
	}),

	modules: rpc.declare({
		object: 'luci.secubox',
		method: 'modules',
		expect: { modules: [] }
	}),

	modulesByCategory: rpc.declare({
		object: 'luci.secubox',
		method: 'modules_by_category',
		params: ['category'],
		expect: { modules: [] }
	}),

	moduleInfo: rpc.declare({
		object: 'luci.secubox',
		method: 'module_info',
		params: ['module'],
		expect: { }
	}),

	startModule: rpc.declare({
		object: 'luci.secubox',
		method: 'start_module',
		params: ['module']
	}),

	stopModule: rpc.declare({
		object: 'luci.secubox',
		method: 'stop_module',
		params: ['module']
	}),

	restartModule: rpc.declare({
		object: 'luci.secubox',
		method: 'restart_module',
		params: ['module']
	}),

	health: rpc.declare({
		object: 'luci.secubox',
		method: 'health',
		expect: { checks: [] }
	}),

	diagnostics: rpc.declare({
		object: 'luci.secubox',
		method: 'diagnostics',
		expect: { }
	})
});
