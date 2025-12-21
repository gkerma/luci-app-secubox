'use strict';
'require baseclass';
'require rpc';

var callStatus = rpc.declare({
	object: 'luci.secubox',
	method: 'status',
	expect: { }
});

var callModules = rpc.declare({
	object: 'luci.secubox',
	method: 'modules',
	expect: { modules: [] }
});

var callHealth = rpc.declare({
	object: 'luci.secubox',
	method: 'health',
	expect: { checks: [] }
});

var callRestartModule = rpc.declare({
	object: 'luci.secubox',
	method: 'restart_module',
	params: ['module']
});

var callDiagnostics = rpc.declare({
	object: 'luci.secubox',
	method: 'diagnostics',
	expect: { }
});

return baseclass.extend({
	getStatus: callStatus,
	getModules: callModules,
	getHealth: callHealth,
	restartModule: callRestartModule,
	getDiagnostics: callDiagnostics
});
