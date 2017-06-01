Name: tendrl-dashboard
Version: 1.4.0
Release: 1%{?dist}
BuildArch: noarch
Summary: GUI for Tendrl
License: ASL 2.0
Group:   Applications/System
Source0: %{name}-%{version}.tar.gz
Source1: tendrl-dashboard-build-pkgs.tar.gz
URL: https://github.com/Tendrl/dashboard

Requires: tendrl-api-httpd
BuildRequires: npm
BuildRequires: nodejs-packaging
BuildRequires: fontconfig

%description
Contains the JavaScript GUI content for the Tendrl front-end components
(dashboard, login screens, administration screens)

%prep
%autosetup
%setup -q -n %{name}-%{version}
%setup -T -D -a 1

%build
./node_modules/.bin/gulp release
%{__rm} -r node_modules

%install
install -m 755 -d $RPM_BUILD_ROOT/%{_localstatedir}/www/tendrl
cp -a ./dist/* $RPM_BUILD_ROOT/%{_localstatedir}/www/tendrl/

%files
%{_localstatedir}/www/tendrl/
%doc ./docs/*

%changelog
* Fri Jun 02 2017 Rohan Kanade <rkanade@redhat.com> - 1.4.0-1
- Release tendrl-dashboard v1.4.0

* Thu May 18 2017 <rkanade@redhat.com> 1.3.0-1
- Release tendrl-dashboard v1.3.0

* Thu Nov 10 2016 <kchidamb@redhat.com> 0.0.1-1
- Initial Commit
