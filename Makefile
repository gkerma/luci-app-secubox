include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-secubox
PKG_VERSION:=2.0.0
PKG_RELEASE:=1
PKG_MAINTAINER:=Gandalf <gandalf@yoursite.com>
PKG_LICENSE:=MIT

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-secubox
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=SecuBox Security Suite Dashboard
  DEPENDS:=+luci-base +rpcd +rpcd-mod-luci
  PKGARCH:=all
endef

define Package/luci-app-secubox/description
  SecuBox unified security dashboard for OpenWrt.
  Central hub for CrowdSec, Netdata, Netifyd, WireGuard,
  Network Modes, Client Guardian, System Hub, CDN Cache,
  and Traffic Shaper modules.
endef

define Build/Compile
endef

define Package/luci-app-secubox/install
	$(INSTALL_DIR) $(1)/usr/libexec/rpcd
	$(INSTALL_BIN) ./root/usr/libexec/rpcd/luci.secubox $(1)/usr/libexec/rpcd/
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/*.json $(1)/usr/share/luci/menu.d/
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/*.json $(1)/usr/share/rpcd/acl.d/
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/secubox
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/secubox/*.js $(1)/www/luci-static/resources/view/secubox/
endef

define Package/luci-app-secubox/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	/etc/init.d/rpcd reload
	rm -rf /tmp/luci-indexcache /tmp/luci-modulecache
}
endef

$(eval $(call BuildPackage,luci-app-secubox))
