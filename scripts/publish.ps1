# DockTerm publish helper.
# Run from the repo root after authenticating to GitHub (gh auth login, or set
# $env:GH_TOKEN to a token with `repo` scope). Creates the public repo, pushes
# main, and pushes the v0.1.0 tag — which triggers the installer build.

$ErrorActionPreference = 'Stop'
$owner = 'munvard'
$repo = 'dockterm'
$tag = 'v0.1.0'

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

git remote remove origin 2>$null
git remote add origin "https://github.com/$owner/$repo.git"
git tag -a $tag -m "DockTerm $tag" 2>$null

$gh = Get-Command gh -ErrorAction SilentlyContinue
if ($gh) {
  Write-Host "Creating $owner/$repo via GitHub CLI and pushing main..."
  gh repo create "$owner/$repo" --public --source . --remote origin --push
}
elseif ($env:GH_TOKEN) {
  Write-Host "Creating $owner/$repo via the GitHub API and pushing main..."
  $body = @{ name = $repo; private = $false } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri 'https://api.github.com/user/repos' `
    -Headers @{ Authorization = "token $env:GH_TOKEN"; 'User-Agent' = 'dockterm'; Accept = 'application/vnd.github+json' } `
    -Body $body -ContentType 'application/json' | Out-Null
  $b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$env:GH_TOKEN"))
  git -c http.extraheader="AUTHORIZATION: basic $b64" push -u origin main
}
else {
  Write-Host "No gh and no GH_TOKEN found." -ForegroundColor Yellow
  Write-Host "Create an empty public repo at https://github.com/new (name: $repo), then run:"
  Write-Host "  git push -u origin main"
  Write-Host "  git push origin $tag"
  exit 1
}

git push origin $tag
Write-Host "Done. Watch the Actions tab, then check Releases for installers." -ForegroundColor Green
