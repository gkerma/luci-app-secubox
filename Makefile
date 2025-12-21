# SPDX-License-Identifier: Apache-2.0
# Copyright (C) 2025 CyberMind.fr
#
# SecuBox Master Package for OpenWrt LuCI
# Provides unified menu and module discovery for all SecuBox components

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-secubox
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=Gandalf <contact@cybermind.fr>

LUCI_TITLE:=SecuBox Master Dashboard
LUCI_DESCRIPTION:=Unified dashboard and menu system for SecuBox security modules
LUCI_DEPENDS:=+luci-base +rpcd +jsonfilter
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

define Package/$(PKG_NAME)
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=$(LUCI_TITLE)
  DEPENDS:=$(LUCI_DEPENDS)
  PKGARCH:=$(LUCI_PKGARCH)
endef

define Package/$(PKG_NAME)/description
$(LUCI_DESCRIPTION)

SecuBox Master provides:
- Unified menu structure for all SecuBox modules
- Central dashboard with module status overview
- Dynamic module discovery and health monitoring
- Centralized notifications and updates
- Quick access to all security features

This package is required by all other SecuBox modules.
Modules will automatically register under the SecuBox menu.
endef

define Package/$(PKG_NAME)/conffiles
/etc/config/secubox
endef

define Package/$(PKG_NAME)/install
	# JavaScript views
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/secubox
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/secubox/*.js \
		$(1)/www/luci-static/resources/view/secubox/
	
	# Shared resources
	$(INSTALL_DIR) $(1)/www/luci-static/resources/secubox
	$(INSTALL_DATA) ./htdocs/luci-static/resources/secubox/*.js \
		$(1)/www/luci-static/resources/secubox/
	$(INSTALL_DATA) ./htdocs/luci-static/resources/secubox/*.css \
		$(1)/www/luci-static/resources/secubox/
	
	# Menu configuration
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/$(PKG_NAME).json \
		$(1)/usr/share/luci/menu.d/
	
	# ACL configuration
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/$(PKG_NAME).json \
		$(1)/usr/share/rpcd/acl.d/
	
	# RPCD backend
	$(INSTALL_DIR) $(1)/usr/libexec/rpcd
	$(INSTALL_BIN) ./root/usr/libexec/rpcd/secubox \
		$(1)/usr/libexec/rpcd/
	
	# UCI config
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./root/etc/config/secubox \
		$(1)/etc/config/
	
	# UCI defaults
	$(INSTALL_DIR) $(1)/etc/uci-defaults
	$(INSTALL_BIN) ./root/etc/uci-defaults/99-secubox \
		$(1)/etc/uci-defaults/
endef

define Package/$(PKG_NAME)/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	/etc/init.d/rpcd reload 2>/dev/null || true
	rm -rf /tmp/luci-modulecache 2>/dev/null || true
	rm -rf /tmp/luci-indexcache* 2>/dev/null || true
	echo "SecuBox Master Dashboard installed"
}
exit 0
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
