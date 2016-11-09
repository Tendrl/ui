%define pkg_name tendrl_frontend
%define pkg_version 0.0.1
%define pkg_release 1

Name: %{pkg_name}
Version: %{pkg_version}
Release: %{pkg_release}%{?dist}
BuildArch: noarch
Summary: GUI for Tendrl
License: ASL 2.0
Group:   Applications/System
Source0: %{pkg_name}-%{pkg_version}.tar.gz
BuildRoot: %{_tmppath}/%{pkg_name}-%{pkg_version}-%{pkg_release}-buildroot
Url: https://github.com/Tendrl/tendrl_frontend

Requires: tendrl

%description
Contains the JavaScript GUI content for the Tendrl front-end components
(dashboard, login screens, administration screens)

%prep
%setup -n %{pkg_name}-%{pkg_version}

%install
rm -rf $RPM_BUILD_ROOT
install -m 755 -d $RPM_BUILD_ROOT/%{_datadir}/Tendrl/webapp
cp -r ./dist/* $RPM_BUILD_ROOT/%{_datadir}/Tendrl/webapp/

%clean
echo "clean"
[ "$RPM_BUILD_ROOT" != "/" ] && rm -rf "$RPM_BUILD_ROOT"

%files
%{_datadir}/Tendrl/webapp/*
%doc docs/*

%changelog
* Ddd Mmm DD YYYY <email@domain.tld> x.y.z-c
- Fix 1
- Fix 2
