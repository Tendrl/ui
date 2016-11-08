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

build-all: setup build build-tar

setup:
	sudo npm install -g gulp
	npm install

build:
	gulp release

build-tar: build
	@echo "making dist tarball in $(TARNAME)"
	mkdir -p $(DISTDIR)
	mkdir -p $(TARDIR)/docs
	cp -r ./docs/* $(TARDIR)/docs/.
	cp -r $(APP_DIST)/* $(DISTDIR)
	tar -zcf $(TARDIR).tar.gz $(TARDIR);
	rm -rf $(TARDIR)
	@echo "--------------------------------------------------"
	@echo "TAR file is now available at: $(TARNAME)"
	@echo "--------------------------------------------------"

build-rpm: build-tar
	mkdir -p $(RPMBUILD)/{SPECS,RPMS,SOURCES,BUILDROOT}
	cp tendrl-frontend.spec $(RPMBUILD)/SPECS
	cp $(TARNAME) $(RPMBUILD)/SOURCES
	rpmbuild -ba tendrl-frontend.spec
	@echo "--------------------------------------------------"
	@echo "RPM file is now available at: $(RPMBUILD)/RPMS/noarch"
	@echo "--------------------------------------------------"
