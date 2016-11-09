# store the current working directory
CWD := $(shell pwd)
PRINT_STATUS = export EC=$$?; cd $(CWD); if [ "$$EC" -eq "0" ]; then printf "SUCCESS!\n"; else exit $$EC; fi

NAME      := tendrl-frontend
VERSION   := 0.0.1
RELEASE   := 1
RPMBUILD  := $(HOME)/rpmbuild
TARDIR    := $(NAME)-$(VERSION)
DISTDIR   := $(TARDIR)/dist
TARNAME   := $(TARDIR).tar.gz
APP_DIST  := ./dist

build-all: build-setup build

build-setup:
	sudo npm install -g gulp
	npm install

build:
	gulp release

dist: build
	@echo "making dist tarball in $(TARNAME)"
	mkdir -p $(DISTDIR)
	cp README.md $(TARDIR)/.
	cp -r $(APP_DIST)/* $(DISTDIR)
	tar -zcf $(TARDIR).tar.gz $(TARDIR);
	rm -rf $(TARDIR)
	@echo "--------------------------------------------------"
	@echo "TAR file is now available at: $(TARNAME)"
	@echo "--------------------------------------------------"

rpm: dist
	mkdir -p $(RPMBUILD)/{SPECS,RPMS,SOURCES,BUILDROOT}
	cp package.spec $(RPMBUILD)/SPECS
	cp $(TARNAME) $(RPMBUILD)/SOURCES
	rpmbuild -ba package.spec
	@echo "--------------------------------------------------"
	@echo "RPM file is now available at: $(RPMBUILD)/RPMS/noarch"
	@echo "--------------------------------------------------"
