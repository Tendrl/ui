Name: tendrl-frontend
Version: 1.1
Release: 1%{?dist}
BuildArch: noarch
Summary: GUI for Tendrl
License: ASL 2.0
Group:   Applications/System
Source0: %{name}-%{version}.tar.gz
BuildRoot: %{_tmppath}/%{name}-%{version}-%{pkg_release}-buildroot
URL: https://github.com/Tendrl/tendrl_frontend

Requires: tendrl-api

%description
Contains the JavaScript GUI content for the Tendrl front-end components
(dashboard, login screens, administration screens)

%prep
%setup

%install
install -m 755 -d $RPM_BUILD_ROOT/%{_datadir}/tendrl/webapp
cp -r ./dist/* $RPM_BUILD_ROOT/%{_datadir}/tendrl/webapp/

%clean
echo "clean"
[ "$RPM_BUILD_ROOT" != "/" ] && rm -rf "$RPM_BUILD_ROOT"

%files
%{_datadir}/tendrl/webapp/*
%doc ./docs/*

%changelog
* Thu Nov 10 2016 <kchidamb@redhat.com> 0.0.1-1
- Initial Commit
