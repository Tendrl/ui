# store the current working directory
NAME      := tendrl-dashboard
VERSION   := 1.4.0
RELEASE   := 1

build-pkgs-dist:
	npm prune
	npm install
	tar -zcf tendrl-dashboard-build-pkgs.tar.gz node_modules

dist:
	mkdir -p $(NAME)-$(VERSION)
	cp *.js package.json README.md $(NAME)-$(VERSION)/
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

.PHONY: dist rpm srpm
