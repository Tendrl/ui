# store the current working directory
CWD := $(shell pwd)
PRINT_STATUS = export EC=$$?; cd $(CWD); if [ "$$EC" -eq "0" ]; then printf "SUCCESS!\n"; else exit $$EC; fi

NAME      := kitoon
VERSION   := 0.0.52
RELEASE   := 1
RPMBUILD  := $(HOME)/rpmbuild
TARDIR    := $(NAME)-$(VERSION)
DISTDIR   := $(TARDIR)/dist
TARNAME   := $(TARDIR).tar.gz
KITOON_DIST := ./dist

build-all: build-setup build

build-setup:
	sudo npm install -g gulp
	sudo npm install -g tsd
	npm install
	tsd install

build:
	gulp compile --prod

dist: build
	@echo "making dist tarball in $(TARNAME)"
	mkdir -p $(DISTDIR)
	cp README.md $(TARDIR)/.
	cp -r $(KITOON_DIST)/* $(DISTDIR)
	tar -zcf $(TARDIR).tar.gz $(TARDIR);
	rm -rf $(TARDIR)
	@echo "------------------------------------------------"
	@echo "tar file available at: $(TARNAME)"
	@echo "------------------------------------------------"

rpm: dist
	mkdir -p $(RPMBUILD)/{SPECS,RPMS,SOURCES,BUILDROOT}
	cp kitoon.spec $(RPMBUILD)/SPECS
	cp $(TARNAME) $(RPMBUILD)/SOURCES
	rpmbuild -ba kitoon.spec
	@echo "------------------------------------------------------------"
	@echo "Kitoon RPM available at directory:  $(RPMBUILD)/RPMS/noarch"
	@echo "------------------------------------------------------------"
