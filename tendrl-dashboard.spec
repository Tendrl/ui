Name: tendrl-dashboard
Version: 1.2
Release: 1%{?dist}
BuildArch: noarch
Summary: GUI for Tendrl
License: ASL 2.0
Group:   Applications/System
Source0: %{name}-%{version}.tar.gz
URL: https://github.com/Tendrl/dashboard

BuildRequires: npm
BuildRequires: nodejs-packaging
BuildRequires: fontconfig

%description
Contains the JavaScript GUI content for the Tendrl front-end components
(dashboard, login screens, administration screens)

%prep
%setup -q -n %{name}-%{version}
%nodejs_fixdep foomodule

%build
npm install gulp
npm install gulp-concat
npm install gulp-rename
npm install gulp-cssimport
npm install gulp-sass
npm install gulp-minify-css
npm install gulp-postcss
npm install gulp-eslint
npm install gulp-debug
npm install gulp-if
npm install gulp-ignore
npm install gulp-inject
npm install gulp-load-plugins
npm install gulp-match
npm install gulp-ng-annotate
npm install gulp-sourcemaps
npm install gulp-uglify
npm install autoprefixer-core
npm install karma
npm install run-sequence
npm install merge-stream
npm install numeral
npm install eslint
npm install resource
npm install copy
npm install sass
npm install preload
npm install jsbundle

./node_modules/.bin/gulp release

%{__rm} -f .gitignore
#
# Fedora guidlines do not allow bundled modules
# use nodejs_symlink_deps in the install section to generate
# links based on package.json contents
#
%{__rm} -rf node_modules

%install
install -m 755 -d $RPM_BUILD_ROOT/%{_localstatedir}/www/tendrl
cp -a ./dist/* $RPM_BUILD_ROOT/%{_localstatedir}/www/tendrl/

%files
%{_localstatedir}/www/tendrl/
%doc ./docs/*

%changelog
* Thu Nov 10 2016 <kchidamb@redhat.com> 0.0.1-1
- Initial Commit
