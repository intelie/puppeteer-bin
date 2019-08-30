version=$1
folder=./dist/widget-export-resources-$version
chromeurl=http://localhost:5000/chrome # https://puppeteer-bin.s3.amazonaws.com/chrome-linux/chrome
echo "Building widget-export-resources-"$version

rm -r dist
mkdir -p $folder

# Copying resources
echo "Copying puppeteer..."
cp ./puppeteer $folder
echo "Copying phantomjs..."
cp ./phantomjs $folder
echo "Downloading chrome..."
mkdir -p $folder/chrome-linux
cp -r ./chrome-linux/swiftshader $folder/chrome-linux
wget -O $folder/chrome-linux/chrome $chromeurl

echo "Zipping files..."
cd $folder
zip -r ../../$folder.zip .
cd ../../

rm -r $folder

md5output="$(md5sum $folder.zip)"
md5output=($md5output)
echo -e "\n\nThe hash is: "${md5output[0]} 
echo "Successfully!"

# Useful
rm /home/yep/Documents/puppeteer-export-headless-chrome/chrome-linux/widget-export-resources-$version.zip
cp $folder.zip /home/yep/Documents/puppeteer-export-headless-chrome/chrome-linux