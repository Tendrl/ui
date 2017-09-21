# store the current working directory
NAME      := tendrl-ui
VERSION   := 1.5.2
RELEASE   := 1
COMMIT := $(shell git rev-parse HEAD)
SHORTCOMMIT := $(shell echo $(COMMIT) | cut -c1-7)

all: srpm

build-pkgs-dist:
	npm prune
	npm install
	tar -zcf tendrl-ui-build-pkgs.tar.gz node_modules

dist:
	mkdir -p $(NAME)-$(VERSION)
	cp *.js package.json LICENSE README.md $(NAME)-$(VERSION)/
	cp -r docs $(NAME)-$(VERSION)/
	cp -r src $(NAME)-$(VERSION)/
	tar -zcf $(NAME)-$(VERSION).tar.gz $(NAME)-$(VERSION)
	rm -rf $(NAME)-$(VERSION)

clean:
	rm -f $(NAME)-$(VERSION).tar.gz
	rm -f $(NAME)-$(VERSION)*.rpm
	rm -f *.log

srpm:   dist build-pkgs-dist
	fedpkg --dist epel7 srpm

rpm:    srpm
	mock -r epel-7-x86_64 rebuild $(NAME)-$(VERSION)-$(RELEASE).el7.src.rpm --resultdir=. --define "dist .el7"

update-release:
	sed -i $(NAME).spec \
	  -e "/^Release:/cRelease: $(shell date +"%Y%m%dT%H%M%S").$(SHORTCOMMIT)"

snapshot: update-release srpm

.PHONY: dist rpm srpm update-release snapshot
