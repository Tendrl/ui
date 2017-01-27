# store the current working directory
NAME      := tendrl-dashboard
VERSION   := 1.2
RELEASE   := 1

all: setup rpm

setup:
	sudo npm install -g gulp
	npm install

build:
	gulp release

dist:   build
	mkdir -p $(NAME)-$(VERSION)
	cp -r docs $(NAME)-$(VERSION)/
	cp -r dist $(NAME)-$(VERSION)/
	tar -zcf $(NAME)-$(VERSION).tar.gz $(NAME)-$(VERSION)
	rm -rf $(NAME)-$(VERSION)

clean:
	rm -f $(NAME)-$(VERSION).tar.gz
	rm -f $(NAME)-$(VERSION)*.rpm
	rm -f *.log

srpm:   dist
	fedpkg --dist epel7 srpm

rpm:    srpm
	mock -r epel-7-x86_64 rebuild $(NAME)-$(VERSION)-$(RELEASE).el7.src.rpm --resultdir=. --define "dist .el7"

.PHONY: dist rpm srpm
