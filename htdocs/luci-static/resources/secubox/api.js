'use strict';
'require baseclass';
'require rpc';

var callStatus = rpc.declare({
	object: 'secubox',
	method: 'status',
	expect: { }
});

var callModules = rpc.declare({
	object: 'secubox',
	method: 'modules',
	expect: { modules: [] }
});

var callHealth = rpc.declare({
	object: 'secubox',
	method: 'health',
	expect: { checks: [] }
});

var callRestartModule = rpc.declare({
	object: 'secubox',
	method: 'restart_module',
	params: ['module']
});

var callDiagnostics = rpc.declare({
	object: 'secubox',
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
