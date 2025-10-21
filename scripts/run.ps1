param(
  [string]$script = "dev"
)

# Use pnpm if available, otherwise fallback to npm
$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpm) {
  Write-Host "Using pnpm to run script '$script'"
  pnpm run $script
} else {
  Write-Host "pnpm not found — falling back to npm to run script '$script'"
  npm run $script
}
