param (
    [string]$BaseUrl = "http://127.0.0.1:8000/api",
    [string]$SuperAdminEmail = "superadmin@epg-plateforme.com",
    [string]$SuperAdminPassword = "SuperAdmin2024!"
)

# Identifiants du formateur à créer
$formateurNom = "Youness"
$formateurEmail = "youness@epg-plateforme.com"
$formateurPassword = "Youness2025!"

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

# Création du formateur
Write-Host "CREATION FORMATEUR YOUNESS" -ForegroundColor Cyan
$formateurHeaders = @{ 
    "Authorization" = "Bearer $superToken"
    "Content-Type" = "application/json" 
}


$formateurBody = @{
    nom = $formateurNom
    email = $formateurEmail
    password = $formateurPassword
    password_confirmation = $formateurPassword
    tel = "+212600000427" # Unique phone number
    indicatif = "+212"
    ville = "Casablanca"
    villeOrigine = $false
    naissance = "1990-01-01"
    role = "formateur" # Confirmed from backend validation
    specialite = "Développement Web"
    bio = "Nouveau formateur"
    experience_years = 0
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri "$BaseUrl/admin/register" -Method POST -Headers $formateurHeaders -Body $formateurBody -ErrorAction Stop
    $content = $createResponse.Content
    Write-Host "Formateur Youness cree avec succes" -ForegroundColor Green
    Write-Host $content
} catch {
    Write-Host "Echec creation formateur : $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response -ne $null) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Details: $responseBody" -ForegroundColor Yellow
    }
    exit 1
}

# Test connexion du formateur
Write-Host "TEST CONNEXION FORMATEUR YOUNESS" -ForegroundColor Cyan
$formateurLoginBody = @{
    email = $formateurEmail
    password = $formateurPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/login" -Method POST -Headers $headers -Body $formateurLoginBody
    $formateurId = $loginResponse.user.id
    Write-Host "Connexion formateur Youness OK - ID : $formateurId" -ForegroundColor Green
} catch {
    Write-Host "Echec connexion formateur Youness : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "TEST TERMINE" -ForegroundColor Cyan
