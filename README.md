# SecuBox Master Dashboard

[![OpenWrt](https://img.shields.io/badge/OpenWrt-23.05+-blue.svg)](https://openwrt.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)
[![SecuBox](https://img.shields.io/badge/SecuBox-Master-blue.svg)](https://cybermind.fr/secubox)

**Centre de contrôle unifié pour la suite de sécurité SecuBox sur OpenWrt.**

![SecuBox Dashboard](docs/dashboard.png)

## 🎯 Présentation

`luci-app-secubox` est le package master qui fournit :

- **Menu unifié** pour tous les modules SecuBox
- **Dashboard central** avec vue d'ensemble des modules
- **Découverte automatique** des modules installés
- **Health monitoring** centralisé
- **Gestion unifiée** start/stop/restart des services

## 📦 Modules SecuBox

| Module | Catégorie | Description |
|--------|-----------|-------------|
| 🛡️ CrowdSec | Security | Threat intelligence collaborative |
| 🔍 Netifyd | Security | Deep packet inspection |
| 👁️ Client Guardian | Security | NAC & Portail captif |
| 🔒 WireGuard | Network | VPN moderne avec QR codes |
| 🔀 Network Modes | Network | Configuration topologie réseau |
| 📦 CDN Cache | Network | Proxy cache local |
| 📊 Netdata | Monitoring | Monitoring temps réel |
| 🎛️ System Hub | System | Centre de contrôle |

## 🏗️ Architecture Menu

```
LuCI Admin
└── SecuBox                      # Ce package
    ├── Dashboard                # Vue d'ensemble
    ├── Security/               
    │   ├── CrowdSec            
    │   ├── Netifyd             
    │   └── Client Guardian     
    ├── Network/                
    │   ├── WireGuard           
    │   ├── Network Modes       
    │   └── CDN Cache           
    ├── Monitoring/             
    │   └── Netdata             
    ├── System/                 
    │   └── System Hub          
    ├── Modules                  # Gestion modules
    └── Settings                 # Configuration
```

## 📥 Installation

```bash
opkg update
opkg install luci-app-secubox
```

Les autres modules SecuBox dépendent de ce package et s'enregistrent automatiquement dans le menu.

## 🔧 Configuration

### Via LuCI

Accédez à **SecuBox → Settings** pour configurer :

- Activation/désactivation globale
- Découverte automatique des modules
- Notifications
- Thème du dashboard

### Via UCI

```bash
# Voir la configuration
uci show secubox

# Activer les notifications
uci set secubox.main.notifications=1
uci commit secubox
```

## 🔌 API RPCD

```bash
# Status global
ubus call luci.secubox status

# Liste des modules
ubus call luci.secubox modules

# Info d'un module
ubus call luci.secubox module_info '{"module":"crowdsec"}'

# Health check
ubus call luci.secubox health

# Contrôle des services
ubus call luci.secubox restart_module '{"module":"crowdsec"}'
```

## 🧩 Développement de Modules

Pour créer un module compatible SecuBox :

### 1. Dépendance Makefile

```makefile
LUCI_DEPENDS:=+luci-base +luci-app-secubox
```

### 2. Menu sous SecuBox

```json
{
    "admin/secubox/category/mymodule": {
        "title": "My Module",
        "action": {"type": "firstchild"},
        "depends": {"acl": ["luci-app-mymodule"]}
    }
}
```

### 3. Enregistrement UCI

```bash
# Dans postinst
uci set secubox.mymodule=module
uci set secubox.mymodule.installed=1
uci commit secubox
```

## 📁 Structure

```
luci-app-secubox/
├── Makefile
├── htdocs/luci-static/resources/
│   ├── view/secubox/
│   │   ├── dashboard.js      # Dashboard principal
│   │   ├── modules.js        # Gestion modules
│   │   └── settings.js       # Configuration
│   └── secubox/
│       ├── api.js            # API wrapper
│       └── secubox.css       # Styles
└── root/
    ├── etc/config/secubox    # Configuration UCI
    └── usr/
        ├── libexec/rpcd/secubox  # Backend RPCD
        └── share/
            ├── luci/menu.d/      # Menu structure
            └── rpcd/acl.d/       # Permissions
```

## 🔗 Liens

- [Documentation](https://cybermind.fr/secubox)
- [GitHub Organization](https://github.com/gkerma)
- [CyberMind.fr](https://cybermind.fr)

## 📄 Licence

Apache-2.0 © 2025 CyberMind.fr
