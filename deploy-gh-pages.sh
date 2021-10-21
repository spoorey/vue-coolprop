npm run build
git checkout gh-pages
rm -rf public
rm -rf src
rm *
cp -r dist/* .
rm -rf dist
git add .
git commit -m "update gh-pages"
