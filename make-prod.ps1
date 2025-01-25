$prodPath = '.\dist\prod'
if (Test-Path $prodPath) {
    Remove-Item $prodPath -Recurse -Force 
}
mkdir $prodPath
Copy-Item '.\app\index.prod.html' '.\dist\prod\index.html'
foreach ($folder in @('modules', 'js', 'images', 'css', 'components')) {
    Copy-Item ".\app\$folder" ".\dist\prod" -Recurse
}