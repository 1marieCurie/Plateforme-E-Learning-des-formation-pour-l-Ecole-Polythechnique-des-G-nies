
param (
    [string]$BaseUrl = "http://127.0.0.1:8000/api"
    [string]$SuperAdminEmail = "superadmin@epg-plateforme.com"
    [string]$SuperAdminPassword = "SuperAdmin2024!"
)

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

# 3. Test acces liste admins (Super Admin)
Write-Host "Test acces liste admins (Super Admin)" -ForegroundColor Yellow
$authHeaders = @{ 
    "Authorization" = "Bearer $superToken"
    "Content-Type" = "application/json" 
}

try {
    $admins = Invoke-RestMethod -Uri "$BaseUrl/admin-profiles" -Method GET -Headers $authHeaders
    if ($admins -is [Array]) {
        Write-Host "Acces autorise - $($admins.Count) admin(s) trouves" -ForegroundColor Green
    } else {
        Write-Host "Acces autorise - 1 admin trouve" -ForegroundColor Green
    }
} catch {
    Write-Host "Acces refuse : $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test acces liste admins (Admin Normal)
if ($normalToken) {
    Write-Host "Test acces liste admins (Admin Normal - doit echouer)" -ForegroundColor Yellow
    $normalAuthHeaders = @{ 
        "Authorization" = "Bearer $normalToken"
        "Content-Type" = "application/json" 
    }

    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/admin-profiles" -Method GET -Headers $normalAuthHeaders
        Write-Host "SECURITE COMPROMISE - Admin normal a acces !" -ForegroundColor Red
    } catch {
        Write-Host "SECURITE OK - Acces refuse a l admin normal" -ForegroundColor Green
    }
}

# 5. Test acces profil specifique (Super Admin)
Write-Host "Test acces profil specifique (Super Admin)" -ForegroundColor Yellow
if ($normalAdminId) {
    try {
        $profile = Invoke-RestMethod -Uri "$BaseUrl/admin-profiles/$normalAdminId" -Method GET -Headers $authHeaders
        Write-Host "Super Admin peut voir le profil d autres admins" -ForegroundColor Green
    } catch {
        Write-Host "Super Admin ne peut pas voir les autres profils : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Test acces profil Super Admin (Admin Normal - doit echouer)
if ($normalToken -and $superAdminId) {
    Write-Host "Test acces profil Super Admin (Admin Normal - doit echouer)" -ForegroundColor Yellow
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/admin-profiles/$superAdminId" -Method GET -Headers $normalAuthHeaders
        Write-Host "SECURITE COMPROMISE - Admin normal peut voir le Super Admin !" -ForegroundColor Red
    } catch {
        Write-Host "SECURITE OK - Admin normal ne peut pas voir le Super Admin" -ForegroundColor Green
    }
}

# 7. Test protection auto suppression (Super Admin)
Write-Host "Test protection auto suppression (Super Admin)" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$BaseUrl/admin-profiles/$superAdminId" -Method DELETE -Headers $authHeaders
    Write-Host "ALERTE : Auto suppression du Super Admin possible !" -ForegroundColor Red
} catch {
    Write-Host "Protection OK - Auto suppression bloquee" -ForegroundColor Green
}

# 8. Test suppression Super Admin par Admin Normal (doit echouer)
if ($normalToken -and $superAdminId) {
    Write-Host "Test suppression Super Admin par Admin Normal (doit echouer)" -ForegroundColor Yellow
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/admin-profiles/$superAdminId" -Method DELETE -Headers $normalAuthHeaders
        Write-Host "SECURITE COMPROMISE - Admin normal peut supprimer Super Admin !" -ForegroundColor Red
    } catch {
        Write-Host "SECURITE OK - Admin normal ne peut pas supprimer Super Admin" -ForegroundColor Green
    }
}

# 9. Test acces formateurs (Super Admin)
Write-Host "Test acces formateurs (Super Admin)" -ForegroundColor Yellow
try {
    $teachers = Invoke-RestMethod -Uri "$BaseUrl/teacher-profiles" -Method GET -Headers $authHeaders
    if ($teachers -is [Array]) {
        Write-Host "Acces formateurs OK - $($teachers.Count) formateur(s)" -ForegroundColor Green
    } else {
        Write-Host "Acces formateurs OK" -ForegroundColor Green
    }
} catch {
    Write-Host "Pas de formateurs ou route non disponible" -ForegroundColor Yellow
}

# 10. Test acces etudiants (Super Admin)
Write-Host "Test acces etudiants (Super Admin)" -ForegroundColor Yellow
try {
    $students = Invoke-RestMethod -Uri "$BaseUrl/student-profiles" -Method GET -Headers $authHeaders
    if ($students -is [Array]) {
        Write-Host "Acces etudiants OK - $($students.Count) etudiant(s)" -ForegroundColor Green
    } else {
        Write-Host "Acces etudiants OK" -ForegroundColor Green
    }
} catch {
    Write-Host "Pas d etudiants ou route non disponible" -ForegroundColor Yellow
}

# Resume final
Write-Host "TESTS SUPER ADMIN TERMINES" -ForegroundColor Cyan
Write-Host "Super Admin Email : $SuperAdminEmail" -ForegroundColor Gray
Write-Host "Super Admin ID : $superAdminId" -ForegroundColor Gray
if ($normalAdminId) {
    Write-Host "Admin Normal ID : $normalAdminId" -ForegroundColor Gray
}
Write-Host "Tous les tests de securite sont recommandes avant la mise en production !" -ForegroundColor Green
