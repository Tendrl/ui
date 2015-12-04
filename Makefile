SHELL=bash

SRC := $(shell pwd)

# set these only if not set with ?=
VERSION=1.0
RPM_REVISION=0
RPMBUILD=$(SRC)/../rpmbuild

DISTNAMEVER=kitoon_$(VERSION)
TARGET_DIR=usr/share/skyring/webapp
TARNAME = $(DISTNAMEVER).tar.gz

build-all: build-setup build

build-setup:
	sudo npm install -g gulp
	sudo npm install -g bower
	sudo npm install -g tsd
	npm install
	bower install --allow-root
	tsd install

build:
	gulp compile

rpm:    dist-gen
	mkdir -p $(RPMBUILD)/{SPECS,RPMS,SOURCES,BUILDROOT}
	cp kitoon.spec $(RPMBUILD)/SPECS
	cp $(TARNAME) $(RPMBUILD)/SOURCES
	( \
	cd $(RPMBUILD); \
	rpmbuild -bb --define "_topdir $(RPMBUILD)" --define "version $(VERSION)" --define "revision $(RPM_REVISION)" --define "tarname $(TARNAME)" SPECS/kitoon.spec; \
	)
	@echo "------------------------------------------------------------"
	@echo "Kitoon RPM available at directory:  $(RPMBUILD)/RPMS/noarch"
	@echo "------------------------------------------------------------"

dist-gen:
	@echo "making dist tarball in $(TARNAME)"
	@rm -fr $(TARGET_DIR)
	@mkdir $(TARGET_DIR) -p
	@cp -ai dist/* $(TARGET_DIR)/
	@tar -zcf $(TARNAME) $(TARGET_DIR)
	@rm -rf $(TARGET_DIR)
	@echo "------------------------------------------------"
	@echo "tar file available at: $(TARNAME)"
	@echo "------------------------------------------------"
