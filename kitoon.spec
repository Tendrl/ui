%define pkg_name kitoon
%define pkg_version 0.0.2
%define pkg_release 1

Name: %{pkg_name}
Version: %{pkg_version}
Release: %{pkg_release}%{?dist}
BuildArch: noarch
Summary: GUI for Skyring
License: Apache V2
Group:   System/Filesystems
Source0: %{pkg_name}-%{pkg_version}.tar.gz
BuildRoot: %{_tmppath}/%{pkg_name}-%{pkg_version}-%{pkg_release}-buildroot
Url: https://github.com/skyrings/kitoon

Requires: skyring

%description
Contains the JavaScript GUI content for the skyring frontend components
(dashboard, login screens, administration screens)

%prep
%setup -n %{pkg_name}-%{pkg_version}

%install
rm -rf $RPM_BUILD_ROOT
install -m 755 -d $RPM_BUILD_ROOT/%{_datadir}/skyring/webapp
cp -r ./* $RPM_BUILD_ROOT/%{_datadir}/skyring/webapp/

%clean
echo "clean"
[ "$RPM_BUILD_ROOT" != "/" ] && rm -rf "$RPM_BUILD_ROOT"

%files
%{_datadir}/skyring/webapp/*

%changelog
* Fri Dec 04 2015 <tjeyasin@redhat.com>
- Initial build.
