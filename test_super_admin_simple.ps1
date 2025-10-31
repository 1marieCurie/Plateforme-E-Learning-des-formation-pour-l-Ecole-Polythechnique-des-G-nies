# Script PowerShell simple pour tester les fonctionnalites Super Admin
param(
    [string]$BaseUrl = "http://127.0.0.1:8000/api",
    [string]$SuperAdminEmail = "admin@epg.ma",
    [string]$SuperAdminPassword = "admin2025"
)

Write-Host "=== DEBUT DES TESTS SUPER ADMIN ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray

# 1. Connexion Super Admin
Write-Host "`n1. Test de connexion Super Admin..." -ForegroundColor Yellow
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    email = $SuperAdminEmail
    password = $SuperAdminPassword
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/login" -Method POST -Headers $headers -Body $body
    $superToken = $response.token
    $superAdminId = $response.user.id
    Write-Host "SUCCESS - Connexion reussie - Super Admin ID: $superAdminId" -ForegroundColor Green
} catch {
    Write-Host "ERROR - Echec de connexion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Test accès liste admin (Super Admin)
Write-Host "`n2. Test acces liste des admins (Super Admin)..." -ForegroundColor Yellow
$authHeaders = @{ 
    "Authorization" = "Bearer $superToken"
    "Content-Type" = "application/json" 
}

try {
    $admins = Invoke-RestMethod -Uri "$BaseUrl/admin-profiles" -Method GET -Headers $authHeaders
    if ($admins -is [Array]) {
        Write-Host "SUCCESS - Acces autorise - $($admins.Count) admin(s) trouve(s)" -ForegroundColor Green
    } else {
        Write-Host "SUCCESS - Acces autorise - 1 admin trouve" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR - Acces refuse: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test protection auto-suppression Super Admin
Write-Host "`n3. Test protection auto-suppression (Super Admin)..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$BaseUrl/admin-profiles/$superAdminId" -Method DELETE -Headers $authHeaders
    Write-Host "ERROR - ALERTE: Auto-suppression du Super Admin possible !" -ForegroundColor Red
} catch {
    Write-Host "SUCCESS - Protection OK - Auto-suppression bloquee" -ForegroundColor Green
}

# 4. Test acces formateurs
Write-Host "`n4. Test acces formateurs (Super Admin)..." -ForegroundColor Yellow
try {
    $teachers = Invoke-RestMethod -Uri "$BaseUrl/teacher-profiles" -Method GET -Headers $authHeaders
    if ($teachers -is [Array]) {
        Write-Host "SUCCESS - Acces formateurs OK - $($teachers.Count) formateur(s)" -ForegroundColor Green
    } else {
        Write-Host "SUCCESS - Acces formateurs OK" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING - Pas de formateurs ou route non disponible" -ForegroundColor Yellow
}

# 5. Test acces etudiants  
Write-Host "`n5. Test acces etudiants (Super Admin)..." -ForegroundColor Yellow
try {
    $students = Invoke-RestMethod -Uri "$BaseUrl/student-profiles" -Method GET -Headers $authHeaders
    if ($students -is [Array]) {
        Write-Host "SUCCESS - Acces etudiants OK - $($students.Count) etudiant(s)" -ForegroundColor Green
    } else {
        Write-Host "SUCCESS - Acces etudiants OK" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING - Pas d'etudiants ou route non disponible" -ForegroundColor Yellow
}

# Test avec admin normal si disponible
Write-Host "`n6. Test connexion Admin Normal..." -ForegroundColor Yellow
$normalHeaders = @{ "Content-Type" = "application/json" }
$normalBody = @{
    email = "admin-normal@epg.ma"
    password = "password123"
} | ConvertTo-Json

try {
    $normalResponse = Invoke-RestMethod -Uri "$BaseUrl/login" -Method POST -Headers $normalHeaders -Body $normalBody
    $normalToken = $normalResponse.token
    $normalAdminId = $normalResponse.user.id
    Write-Host "SUCCESS - Admin Normal connecte - ID: $normalAdminId" -ForegroundColor Green
    
    # Test que admin normal ne peut pas acceder aux autres profils
    Write-Host "`n7. Test restriction Admin Normal (doit echouer)..." -ForegroundColor Yellow
    $normalAuthHeaders = @{ 
        "Authorization" = "Bearer $normalToken"
        "Content-Type" = "application/json" 
    }
    
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/admin-profiles" -Method GET -Headers $normalAuthHeaders
        Write-Host "ERROR - SECURITE COMPROMISE - Admin normal a acces !" -ForegroundColor Red
    } catch {
        Write-Host "SUCCESS - Securite OK - Acces refuse a l'admin normal" -ForegroundColor Green
    }
    
} catch {
    Write-Host "INFO - Admin Normal non disponible (sera ignore)" -ForegroundColor Yellow
}

# Resume final
Write-Host "`n=== TESTS TERMINES ===" -ForegroundColor Cyan
Write-Host "Super Admin Email: $SuperAdminEmail" -ForegroundColor Gray
Write-Host "Super Admin ID: $superAdminId" -ForegroundColor Gray
Write-Host "`nTous les tests de securite sont recommandes avant la mise en production !" -ForegroundColor Green
