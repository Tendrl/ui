#
# Kitoon Spec File
#

Name:kitoon
Version: %{version}
Release: %{?revision}%{?dist}
BuildArch: noarch
Summary: GUI for Skyring
License: Apache V2
Group:   System/Filesystems
Source0: %{name}_%{version}.tar.gz

Requires: skyring

%description
Contains the JavaScript GUI content for the skyring frontend components
(dashboard, login screens, administration screens)

%prep
echo "prep"

%install
 echo "install"
mkdir -p %{buildroot}
cd %{buildroot}
tar xfz %{SOURCE0}

%clean
echo "clean"
[ "$RPM_BUILD_ROOT" != "/" ] && rm -rf "$RPM_BUILD_ROOT"

%files -n kitoon
/usr/share/skyring/webapp/*

%changelog
* Thu Dec 04 2015 <tjeyasin@redhat.com>
- Initial build.
