# Vercel Environment Variables Setup Script
# Run this ONCE after: vercel login
# Usage: .\set-vercel-env.ps1

$project = "toletboardchennai"
$team = "aphidsgroup"

Write-Host "Setting Vercel environment variables for $project..." -ForegroundColor Cyan

function Add-VercelEnv {
    param($key, $value)
    Write-Host "Adding $key..." -ForegroundColor Yellow
    # Add to Production, Preview, and Development
    echo $value | vercel env add $key production --yes --scope $team
    echo $value | vercel env add $key preview --yes --scope $team
    echo $value | vercel env add $key development --yes --scope $team
    Write-Host "$key added!" -ForegroundColor Green
}

$dbUrl = "postgresql://neondb_owner:npg_oz1BiR6HlkYs@ep-wandering-butterfly-ao5zn6p5-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Add-VercelEnv "DATABASE_URL" $dbUrl
Add-VercelEnv "DIRECT_URL" $dbUrl
Add-VercelEnv "CLOUDINARY_CLOUD_NAME" "dautrievu"
Add-VercelEnv "CLOUDINARY_API_KEY" "679492442332914"
Add-VercelEnv "CLOUDINARY_API_SECRET" "fsbtgq1hnAJV_dKk_1gfSpb_AbA"
Add-VercelEnv "CLOUDINARY_URL" "cloudinary://679492442332914:fsbtgq1hnAJV_dKk_1gfSpb_AbA@dautrievu"
Add-VercelEnv "SESSION_SECRET" "tolet-board-chennai-secret-key-2026"
Add-VercelEnv "ADMIN_EMAIL" "admin@toletboardchennai.com"
Add-VercelEnv "ADMIN_PASSWORD" "ChangeThisPassword123!"
Add-VercelEnv "NEXT_PUBLIC_SITE_URL" "https://toletboardchennai.com"

Write-Host "`n✅ All environment variables set!" -ForegroundColor Green
Write-Host "Triggering redeploy..." -ForegroundColor Cyan
vercel deploy --prod --scope $team
