Name: tendrl-dashboard
Version: 1.2
Release: 1%{?dist}
BuildArch: noarch
Summary: GUI for Tendrl
License: ASL 2.0
Group:   Applications/System
Source0: %{name}-%{version}.tar.gz
URL: https://github.com/Tendrl/dashboard

Requires: tendrl-api-httpd

%description
Contains the JavaScript GUI content for the Tendrl front-end components
(dashboard, login screens, administration screens)

%prep
%autosetup

%build

%install
install -m 755 -d $RPM_BUILD_ROOT/%{_localstatedir}/www/tendrl
cp -a ./dist/* $RPM_BUILD_ROOT/%{_localstatedir}/www/tendrl/

%files
%{_localstatedir}/www/tendrl/
%doc ./docs/*

%changelog
* Thu Nov 10 2016 <kchidamb@redhat.com> 0.0.1-1
- Initial Commit
