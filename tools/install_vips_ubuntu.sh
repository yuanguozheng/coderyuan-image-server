#!/bin/bash

sudo apt update
sudo apt-get purge --auto-remove -y libvips*

sudo apt install -y build-essential meson cmake pkg-config libglib2.0-dev
sudo apt install -y libarchive-dev libfftw3-dev libmagickcore-dev imagemagick libcfitsio-dev libimagequant-dev libjpeg-dev libspng-dev libpng-dev libwebp-dev libtiff-dev librsvg2-dev libcairo2-dev openslide-tools libmatio-dev liblcms2-dev libopenexr-dev libopenjp2-7-dev libheif-dev libjxl-dev libpoppler-glib-dev liborc-0.4-dev libnifti-dev gettext gir1.2-glib-2.0 libexpat1-dev libcgif-dev libgsf-1-dev libglib2.0-dev liborc-dev libopenslide-dev libjpeg-turbo8-dev libexif-dev libtiff5-dev libpango1.0-dev

sudo apt install -y libheif-dev
sudo apt install -y libheif-plugin*

rm -rf install_vips
mkdir install_vips
cd install_vips

curl -L -o vips.tar.xz https://github.com/libvips/libvips/releases/download/v8.15.3/vips-8.15.3.tar.xz
mkdir vips
tar xvf vips.tar.xz --strip-components=1 -C vips
cd vips

meson setup build --libdir=lib --buildtype=release
cd build && meson compile
sudo meson install
cd ..
rm -rf install_vips

sudo ldconfig
vips --vips-config