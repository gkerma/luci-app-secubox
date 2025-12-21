'use strict';
'require view';
'require poll';
'require rpc';
'require ui';

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

function formatUptime(seconds) {
	var days = Math.floor(seconds / 86400);
	var hours = Math.floor((seconds % 86400) / 3600);
	var mins = Math.floor((seconds % 3600) / 60);
	if (days > 0) return days + 'd ' + hours + 'h';
	if (hours > 0) return hours + 'h ' + mins + 'm';
	return mins + 'm';
}

function getModuleIcon(icon) {
	var icons = {
		'shield': '🛡️',
		'chart': '📊',
		'search': '🔍',
		'lock': '🔒',
		'git-branch': '🔀',
		'eye': '👁️',
		'sliders': '🎛️',
		'package': '📦',
		'box': '📦'
	};
	return icons[icon] || '📦';
}

function getCategoryLabel(cat) {
	var labels = {
		'security': 'Sécurité',
		'network': 'Réseau',
		'monitoring': 'Monitoring',
		'system': 'Système'
	};
	return labels[cat] || cat;
}

return view.extend({
	load: function() {
		return Promise.all([
			callStatus(),
			callModules(),
			callHealth()
		]);
	},

	render: function(data) {
		var status = data[0] || {};
		var modules = data[1].modules || [];
		var health = data[2];
		var self = this;

		// Group modules by category
		var byCategory = {};
		modules.forEach(function(m) {
			if (!byCategory[m.category]) byCategory[m.category] = [];
			byCategory[m.category].push(m);
		});

		var installedModules = modules.filter(function(m) { return m.installed; });
		var runningModules = modules.filter(function(m) { return m.running; });

		var view = E('div', { 'class': 'cbi-map secubox-dashboard' }, [
			E('style', {}, `
				.secubox-dashboard { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
				.sb-header { background: linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
				.sb-header-left h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 800; }
				.sb-header-left p { margin: 0; opacity: 0.9; font-size: 14px; }
				.sb-header-right { text-align: right; }
				.sb-hostname { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
				.sb-uptime { font-size: 13px; opacity: 0.9; }
				.sb-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
				.sb-stat { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
				.sb-stat-value { font-size: 32px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
				.sb-stat-value.green { color: #22c55e; }
				.sb-stat-value.blue { color: #3b82f6; }
				.sb-stat-value.cyan { color: #06b6d4; }
				.sb-stat-label { font-size: 13px; color: #94a3b8; margin-top: 4px; }
				.sb-section { background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; margin-bottom: 24px; }
				.sb-section-title { font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
				.sb-modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
				.sb-module { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; transition: all 0.2s; position: relative; overflow: hidden; }
				.sb-module:hover { border-color: #3b82f6; transform: translateY(-2px); }
				.sb-module.not-installed { opacity: 0.5; }
				.sb-module-color { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
				.sb-module-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding-top: 8px; }
				.sb-module-icon { font-size: 28px; }
				.sb-module-status { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; }
				.sb-status-dot { width: 8px; height: 8px; border-radius: 50%; }
				.sb-status-dot.running { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
				.sb-status-dot.stopped { background: #64748b; }
				.sb-status-dot.not-installed { background: #334155; }
				.sb-module-name { font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 4px; }
				.sb-module-desc { font-size: 13px; color: #94a3b8; margin-bottom: 12px; }
				.sb-module-actions { display: flex; gap: 8px; }
				.sb-btn { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
				.sb-btn-primary { background: #3b82f6; color: white; }
				.sb-btn-primary:hover { background: #2563eb; }
				.sb-btn-secondary { background: #334155; color: #f1f5f9; }
				.sb-btn-secondary:hover { background: #475569; }
				.sb-health { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
				.sb-health-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #0f172a; border-radius: 8px; }
				.sb-health-icon { font-size: 20px; }
				.sb-health-info { flex: 1; }
				.sb-health-name { font-size: 13px; font-weight: 500; color: #f1f5f9; }
				.sb-health-status { font-size: 11px; color: #94a3b8; }
				.sb-health-badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
				.sb-health-badge.ok { background: rgba(34,197,94,0.15); color: #22c55e; }
				.sb-health-badge.warning { background: rgba(245,158,11,0.15); color: #f59e0b; }
				.sb-health-badge.error { background: rgba(239,68,68,0.15); color: #ef4444; }
				.sb-category { margin-bottom: 24px; }
				.sb-category-title { font-size: 14px; font-weight: 600; color: #94a3b8; margin-bottom: 12px; padding-left: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
			`),

			// Header
			E('div', { 'class': 'sb-header' }, [
				E('div', { 'class': 'sb-header-left' }, [
					E('h1', {}, '🛡️ SecuBox Dashboard'),
					E('p', {}, 'Centre de contrôle unifié pour tous vos modules de sécurité')
				]),
				E('div', { 'class': 'sb-header-right' }, [
					E('div', { 'class': 'sb-hostname' }, status.hostname || 'SecuBox'),
					E('div', { 'class': 'sb-uptime' }, 'Uptime: ' + formatUptime(status.uptime || 0))
				])
			]),

			// Stats
			E('div', { 'class': 'sb-stats' }, [
				E('div', { 'class': 'sb-stat' }, [
					E('div', { 'class': 'sb-stat-value blue' }, status.modules_total || 8),
					E('div', { 'class': 'sb-stat-label' }, 'Modules disponibles')
				]),
				E('div', { 'class': 'sb-stat' }, [
					E('div', { 'class': 'sb-stat-value cyan' }, status.modules_installed || 0),
					E('div', { 'class': 'sb-stat-label' }, 'Modules installés')
				]),
				E('div', { 'class': 'sb-stat' }, [
					E('div', { 'class': 'sb-stat-value green' }, status.modules_running || 0),
					E('div', { 'class': 'sb-stat-label' }, 'Services actifs')
				]),
				E('div', { 'class': 'sb-stat' }, [
					E('div', { 'class': 'sb-stat-value' }, status.memory_percent + '%'),
					E('div', { 'class': 'sb-stat-label' }, 'Mémoire utilisée')
				])
			]),

			// Health checks
			E('div', { 'class': 'sb-section' }, [
				E('div', { 'class': 'sb-section-title' }, ['💓 ', 'État des Services']),
				E('div', { 'class': 'sb-health' },
					(health.checks || []).length > 0 ?
					health.checks.map(function(c) {
						return E('div', { 'class': 'sb-health-item' }, [
							E('span', { 'class': 'sb-health-icon' }, c.status === 'ok' ? '✅' : '⚠️'),
							E('div', { 'class': 'sb-health-info' }, [
								E('div', { 'class': 'sb-health-name' }, c.name),
								E('div', { 'class': 'sb-health-status' }, c.message)
							]),
							E('span', { 'class': 'sb-health-badge ' + c.status }, c.status === 'ok' ? 'OK' : 'WARN')
						]);
					}) :
					[E('div', { 'style': 'color: #64748b; text-align: center; padding: 20px;' }, 'Aucun module installé')]
				)
			]),

			// Modules by category
			E('div', { 'class': 'sb-section' }, [
				E('div', { 'class': 'sb-section-title' }, ['📦 ', 'Modules SecuBox']),
				
				// Security
				E('div', { 'class': 'sb-category' }, [
					E('div', { 'class': 'sb-category-title' }, '🔒 Sécurité'),
					E('div', { 'class': 'sb-modules-grid' },
						(byCategory['security'] || []).map(function(m) {
							return self.renderModuleCard(m);
						})
					)
				]),
				
				// Network
				E('div', { 'class': 'sb-category' }, [
					E('div', { 'class': 'sb-category-title' }, '🌐 Réseau'),
					E('div', { 'class': 'sb-modules-grid' },
						(byCategory['network'] || []).map(function(m) {
							return self.renderModuleCard(m);
						})
					)
				]),
				
				// Monitoring
				E('div', { 'class': 'sb-category' }, [
					E('div', { 'class': 'sb-category-title' }, '📊 Monitoring'),
					E('div', { 'class': 'sb-modules-grid' },
						(byCategory['monitoring'] || []).map(function(m) {
							return self.renderModuleCard(m);
						})
					)
				]),
				
				// System
				E('div', { 'class': 'sb-category' }, [
					E('div', { 'class': 'sb-category-title' }, '⚙️ Système'),
					E('div', { 'class': 'sb-modules-grid' },
						(byCategory['system'] || []).map(function(m) {
							return self.renderModuleCard(m);
						})
					)
				])
			])
		]);

		poll.add(L.bind(function() {
			return Promise.all([callStatus(), callHealth()]).then(function() {
				// Update stats
			});
		}, this), 15);

		return view;
	},

	renderModuleCard: function(m) {
		var self = this;
		var statusText = m.running ? 'Actif' : (m.installed ? 'Arrêté' : 'Non installé');
		var statusClass = m.running ? 'running' : (m.installed ? 'stopped' : 'not-installed');
		
		return E('div', { 'class': 'sb-module' + (m.installed ? '' : ' not-installed') }, [
			E('div', { 'class': 'sb-module-color', 'style': 'background: ' + m.color + ';' }),
			E('div', { 'class': 'sb-module-header' }, [
				E('span', { 'class': 'sb-module-icon' }, getModuleIcon(m.icon)),
				E('div', { 'class': 'sb-module-status' }, [
					E('span', { 'class': 'sb-status-dot ' + statusClass }),
					E('span', {}, statusText)
				])
			]),
			E('div', { 'class': 'sb-module-name' }, m.name),
			E('div', { 'class': 'sb-module-desc' }, m.description),
			E('div', { 'class': 'sb-module-actions' },
				m.installed ? [
					E('button', {
						'class': 'sb-btn sb-btn-primary',
						'click': function() {
							window.location.href = '/cgi-bin/luci/admin/secubox/' + m.category + '/' + m.id;
						}
					}, 'Ouvrir'),
					E('button', {
						'class': 'sb-btn sb-btn-secondary',
						'click': function() {
							callRestartModule(m.id).then(function() {
								ui.addNotification(null, E('p', {}, m.name + ' redémarré'), 'success');
							});
						}
					}, '↻')
				] : [
					E('button', {
						'class': 'sb-btn sb-btn-secondary',
						'click': function() {
							ui.showModal('Installer ' + m.name, [
								E('p', {}, 'Package: ' + m.package),
								E('pre', { 'style': 'background: #0f172a; padding: 12px; border-radius: 8px; margin: 12px 0;' }, 
									'opkg update\nopkg install ' + m.package),
								E('div', { 'class': 'right' }, [
									E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Fermer')
								])
							]);
						}
					}, 'Installer')
				]
			)
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
