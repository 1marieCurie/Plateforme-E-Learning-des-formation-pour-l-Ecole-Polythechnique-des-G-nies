param (
    [string]$BaseUrl = "http://127.0.0.1:8000/api",
    [string]$SuperAdminEmail = "superadmin@epg-plateforme.com",
    [string]$SuperAdminPassword = "SuperAdmin2024!"
)

# Identifiants du nouvel admin
$adminNom = "Ayoubadmin normal"
$adminEmail = "ayoubadmin@epg-plateforme.com"
$adminPassword = "AyoubAdmin2025!"

Write-Host "CONNEXION SUPER ADMIN" -ForegroundColor Cyan
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    email = $SuperAdminEmail
    password = $SuperAdminPassword
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/login" -Method POST -Headers $headers -Body $body
    $superToken = $response.token
    Write-Host "Connexion Super Admin OK" -ForegroundColor Green
} catch {
    Write-Host "Echec connexion Super Admin : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Création de l'admin normal
Write-Host "CREATION ADMIN NORMAL AYOUB" -ForegroundColor Cyan
$adminHeaders = @{ 
    "Authorization" = "Bearer $superToken"
    "Content-Type" = "application/json" 
}

$adminBody = @{
    nom = $adminNom
    email = $adminEmail
    password = $adminPassword
    password_confirmation = $adminPassword
    tel = "+212600000126"
    indicatif = "+212"
    ville = "Rabat"
    villeOrigine = $false
    naissance = "1992-02-02"
    role = "admin"
    # Les attributs de la table admin_profile sont laissés vides
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri "$BaseUrl/admin/register" -Method POST -Headers $adminHeaders -Body $adminBody -ErrorAction Stop
    $content = $createResponse.Content
    Write-Host "Admin Ayoub cree avec succes" -ForegroundColor Green
    Write-Host $content
} catch {
    Write-Host "Echec creation admin : $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response -ne $null) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody -ForegroundColor Red
    }
    exit 1
}

# Connexion en tant qu'admin normal
Write-Host "CONNEXION ADMIN NORMAL AYOUB" -ForegroundColor Cyan
$adminLoginBody = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

try {
    $adminLoginResponse = Invoke-RestMethod -Uri "$BaseUrl/login" -Method POST -Headers $headers -Body $adminLoginBody
    $adminToken = $adminLoginResponse.token
    $adminId = $adminLoginResponse.user.id
    Write-Host "Connexion admin Ayoub OK - Admin ID : $adminId" -ForegroundColor Green
} catch {
    Write-Host "Echec connexion admin Ayoub : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "TEST TERMINE" -ForegroundColor Cyan
Write-Host "Admin Email : $adminEmail" -ForegroundColor Gray
Write-Host "Admin ID : $adminId" -ForegroundColor Gray
