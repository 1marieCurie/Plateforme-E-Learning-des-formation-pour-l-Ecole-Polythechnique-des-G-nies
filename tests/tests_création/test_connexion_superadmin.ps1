param (
    [string]$BaseUrl = "http://127.0.0.1:8000/api",
    [string]$SuperAdminEmail = "superadminkhadija@epg-plateforme.com",
    [String]$SuperAdminPassword = "SuperAdmin2025!"
)

Write-Host "CRÉATION SUPER ADMIN" -ForegroundColor Cyan
$headers = @{ "Content-Type" = "application/json" }
$createBody = @{
    nom = "Nouveau Super Admin"
    email = $SuperAdminEmail
    password = $SuperAdminPassword
    password_confirmation = $SuperAdminPassword
    tel = "0600000000"
    indicatif = "+212"
    ville = "Fès"
    role = "super_admin"
    is_super_admin = 1
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$BaseUrl/admin/register" -Method POST -Headers $headers -Body $createBody
    Write-Host "Super Admin créé avec succès." -ForegroundColor Green
} catch {
    Write-Host "Erreur création Super Admin : $($_.Exception.Message)" -ForegroundColor Yellow
    if ($_.Exception.Response -and $_.Exception.Response.Content) {
        Write-Host "Détail : $($_.Exception.Response.Content)" -ForegroundColor Yellow
    }
}

Write-Host "TEST CONNEXION SUPER ADMIN" -ForegroundColor Cyan
Write-Host "Base URL : $BaseUrl" -ForegroundColor Gray

$headers = @{ "Content-Type" = "application/json" }
$body = @{
    email = $SuperAdminEmail
    password = $SuperAdminPassword
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/login" -Method POST -Headers $headers -Body $body
    $superToken = $response.token
    $superAdminId = $response.user.id
    Write-Host "Connexion reussie - Super Admin ID : $superAdminId" -ForegroundColor Green
} catch {
    Write-Host "Echec connexion Super Admin : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "TEST TERMINE" -ForegroundColor Cyan
Write-Host "Super Admin Email : $SuperAdminEmail" -ForegroundColor Gray
Write-Host "Super Admin ID : $superAdminId" -ForegroundColor Gray
