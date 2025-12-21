'use strict';
'require view';
'require rpc';
'require ui';

var callModules = rpc.declare({
	object: 'luci.secubox',
	method: 'modules',
	expect: { modules: [] }
});

return view.extend({
	load: function() {
		return callModules();
	},

	render: function(data) {
		var modules = data.modules || [];
		
		var installed = modules.filter(function(m) { return m.installed; });
		var available = modules.filter(function(m) { return !m.installed; });

		return E('div', { 'class': 'cbi-map' }, [
			E('style', {}, `
				.sb-modules { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
				.sb-page-header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
				.sb-page-title { font-size: 24px; font-weight: 700; margin: 0 0 8px 0; }
				.sb-page-desc { margin: 0; opacity: 0.9; }
				.sb-section { background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; margin-bottom: 24px; }
				.sb-section-title { font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 16px; }
				.sb-table { width: 100%; border-collapse: collapse; }
				.sb-table th { text-align: left; padding: 12px; color: #94a3b8; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #334155; }
				.sb-table td { padding: 16px 12px; border-bottom: 1px solid #334155; }
				.sb-table tr:hover { background: rgba(59,130,246,0.05); }
				.sb-module-info { display: flex; align-items: center; gap: 12px; }
				.sb-module-icon { font-size: 24px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
				.sb-module-name { font-weight: 600; color: #f1f5f9; }
				.sb-module-desc { font-size: 13px; color: #94a3b8; }
				.sb-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
				.sb-badge-installed { background: rgba(34,197,94,0.15); color: #22c55e; }
				.sb-badge-available { background: rgba(100,116,139,0.15); color: #64748b; }
				.sb-btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
				.sb-btn-primary { background: #3b82f6; color: white; }
				.sb-btn-danger { background: #ef4444; color: white; }
				.sb-btn-secondary { background: #334155; color: #f1f5f9; }
			`),

			E('div', { 'class': 'sb-modules' }, [
				E('div', { 'class': 'sb-page-header' }, [
					E('h2', { 'class': 'sb-page-title' }, '📦 Modules SecuBox'),
					E('p', { 'class': 'sb-page-desc' }, 'Gérez les modules de sécurité installés sur votre appliance')
				]),

				// Installed modules
				E('div', { 'class': 'sb-section' }, [
					E('h3', { 'class': 'sb-section-title' }, '✅ Modules Installés (' + installed.length + ')'),
					installed.length > 0 ? 
					E('table', { 'class': 'sb-table' }, [
						E('thead', {}, [
							E('tr', {}, [
								E('th', {}, 'Module'),
								E('th', {}, 'Catégorie'),
								E('th', {}, 'Status'),
								E('th', {}, 'Actions')
							])
						]),
						E('tbody', {}, installed.map(function(m) {
							return E('tr', {}, [
								E('td', {}, [
									E('div', { 'class': 'sb-module-info' }, [
										E('div', { 'class': 'sb-module-icon', 'style': 'background: ' + m.color + '20;' }, 
											m.icon === 'shield' ? '🛡️' :
											m.icon === 'chart' ? '📊' :
											m.icon === 'search' ? '🔍' :
											m.icon === 'lock' ? '🔒' :
											m.icon === 'git-branch' ? '🔀' :
											m.icon === 'eye' ? '👁️' :
											m.icon === 'sliders' ? '🎛️' :
											m.icon === 'package' ? '📦' : '📦'
										),
										E('div', {}, [
											E('div', { 'class': 'sb-module-name' }, m.name),
											E('div', { 'class': 'sb-module-desc' }, m.description)
										])
									])
								]),
								E('td', {}, m.category),
								E('td', {}, [
									E('span', { 'class': 'sb-badge ' + (m.running ? 'sb-badge-installed' : 'sb-badge-available') },
										m.running ? 'Running' : 'Stopped')
								]),
								E('td', {}, [
									E('button', { 
										'class': 'sb-btn sb-btn-primary',
										'click': function() {
											window.location.href = '/cgi-bin/luci/admin/secubox/' + m.category + '/' + m.id;
										}
									}, 'Ouvrir')
								])
							]);
						}))
					]) :
					E('p', { 'style': 'color: #64748b; text-align: center; padding: 40px;' }, 'Aucun module installé')
				]),

				// Available modules
				E('div', { 'class': 'sb-section' }, [
					E('h3', { 'class': 'sb-section-title' }, '📥 Modules Disponibles (' + available.length + ')'),
					available.length > 0 ?
					E('table', { 'class': 'sb-table' }, [
						E('thead', {}, [
							E('tr', {}, [
								E('th', {}, 'Module'),
								E('th', {}, 'Catégorie'),
								E('th', {}, 'Package'),
								E('th', {}, 'Actions')
							])
						]),
						E('tbody', {}, available.map(function(m) {
							return E('tr', {}, [
								E('td', {}, [
									E('div', { 'class': 'sb-module-info' }, [
										E('div', { 'class': 'sb-module-icon', 'style': 'background: #33415520;' }, '📦'),
										E('div', {}, [
											E('div', { 'class': 'sb-module-name', 'style': 'opacity: 0.7;' }, m.name),
											E('div', { 'class': 'sb-module-desc' }, m.description)
										])
									])
								]),
								E('td', {}, m.category),
								E('td', { 'style': 'font-family: monospace; font-size: 12px;' }, m.package),
								E('td', {}, [
									E('button', {
										'class': 'sb-btn sb-btn-secondary',
										'click': function() {
											ui.showModal('Installer ' + m.name, [
												E('p', {}, 'Exécutez les commandes suivantes pour installer ce module :'),
												E('pre', { 'style': 'background: #0f172a; padding: 16px; border-radius: 8px; overflow-x: auto;' },
													'opkg update\nopkg install ' + m.package),
												E('div', { 'class': 'right', 'style': 'margin-top: 16px;' }, [
													E('button', { 'class': 'btn', 'click': ui.hideModal }, 'Fermer')
												])
											]);
										}
									}, 'Instructions')
								])
							]);
						}))
					]) :
					E('p', { 'style': 'color: #64748b; text-align: center; padding: 40px;' }, 'Tous les modules sont installés ! 🎉')
				])
			])
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
