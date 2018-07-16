#!/bin/bash

WWW_FOLDER=/var/www/html/budget-optimize

sudo rm -rf $WWW_FOLDER/{api,js,css,img}
sudo cp -r api $WWW_FOLDER/
sudo cp -r dist/* $WWW_FOLDER/
sudo cp config.php $WWW_FOLDER/api/conf.php
sudo chown -R www-data:www-data $WWW_FOLDER