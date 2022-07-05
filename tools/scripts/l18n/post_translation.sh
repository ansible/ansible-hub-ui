#!/bin/bash

# Rename the zh_cn directory 
mv translations/zh_cn translations/zh

# Rename files and remove from lang directory
cd translations

for d in */ ; do
    dir=${d%*/}
    mv $dir/en.po $dir.po
    rm -rf $dir
done

cd ..

# locale will be dropped here
ansible_hub_ui_path="locale" 

# Overwrite the new files
rsync -av translations/ $ansible_hub_ui_path

# Cleanup
rm -rf translations/