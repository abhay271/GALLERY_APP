# Gallery App Backend API Test Script
# PowerShell script to test all API endpoints using Invoke-RestMethod

param(
    [string]$BaseUrl = "http://localhost:3000",
    [switch]$SkipUpload = $false
)

Write-Host "🧪 Gallery App Backend API Tests" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

$Headers = @{ "Content-Type" = "application/json" }
$TestResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [hashtable]$CustomHeaders = $null
    )
    
    Write-Host "🔍 Testing $Name..." -ForegroundColor Cyan
    
    try {
        $Uri = "$BaseUrl$Endpoint"
        $RequestHeaders = if ($CustomHeaders) { $CustomHeaders } else { $Headers }
        
        if ($Body) {
            $JsonBody = $Body | ConvertTo-Json -Depth 10
            $Response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $RequestHeaders -Body $JsonBody
        } else {
            $Response = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $RequestHeaders
        }
        
        Write-Host "✅ $Name - SUCCESS" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Gray
        $Response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
        Write-Host ""
        
        return @{ Name = $Name; Success = $true; Response = $Response }
    }
    catch {
        Write-Host "❌ $Name - FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
        Write-Host ""
        
        return @{ Name = $Name; Success = $false; Error = $_.Exception.Message }
    }
}

function Test-ImageUpload {
    Write-Host "🔍 Testing Image Upload..." -ForegroundColor Cyan
    
    try {
        # Create a temporary test image file (simple PNG)
        $TempImagePath = [System.IO.Path]::GetTempFileName() + ".png"
        
        # Create a minimal 1x1 PNG file
        $PngBytes = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9dYKZ8wAAAABJRU5ErkJggg==")
        [System.IO.File]::WriteAllBytes($TempImagePath, $PngBytes)
        
        # Upload using curl (more reliable for file uploads)
        $CurlCommand = "curl -X POST `"$BaseUrl/api/upload`" -F `"image=@$TempImagePath`""
        $Result = Invoke-Expression $CurlCommand 2>$null
        
        if ($Result) {
            $JsonResult = $Result | ConvertFrom-Json
            Write-Host "✅ Image Upload - SUCCESS" -ForegroundColor Green
            Write-Host "Response:" -ForegroundColor Gray
            $JsonResult | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
            $Success = $true
        } else {
            Write-Host "❌ Image Upload - FAILED (No response)" -ForegroundColor Red
            $Success = $false
        }
        
        # Clean up
        Remove-Item $TempImagePath -Force -ErrorAction SilentlyContinue
        
        return @{ Name = "Image Upload"; Success = $Success }
    }
    catch {
        Write-Host "❌ Image Upload - FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Name = "Image Upload"; Success = $false; Error = $_.Exception.Message }
    }
}

# Test 1: API Info
$TestResults += Test-Endpoint -Name "API Info" -Method "GET" -Endpoint "/"

# Test 2: Health Check
$TestResults += Test-Endpoint -Name "Health Check" -Method "GET" -Endpoint "/api/health"

# Test 3: Database Stats
$TestResults += Test-Endpoint -Name "Database Stats" -Method "GET" -Endpoint "/api/stats"

# Test 4: Image Upload (skip if requested)
if (-not $SkipUpload) {
    # Check if curl is available
    $CurlAvailable = Get-Command curl -ErrorAction SilentlyContinue
    if ($CurlAvailable) {
        $TestResults += Test-ImageUpload
    } else {
        Write-Host "⚠️  Skipping Image Upload test - curl not available" -ForegroundColor Yellow
        $TestResults += @{ Name = "Image Upload"; Success = $false; Error = "curl not available" }
    }
} else {
    Write-Host "⏭️  Skipping Image Upload test (requested)" -ForegroundColor Yellow
}

# Test 5: Image Search
$SearchBody = @{
    query = "test image"
    limit = 5
    scoreThreshold = 0.5
}
$TestResults += Test-Endpoint -Name "Image Search" -Method "POST" -Endpoint "/api/query" -Body $SearchBody

# Summary
Write-Host "📊 Test Results Summary:" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

$PassedCount = 0
foreach ($Result in $TestResults) {
    $Status = if ($Result.Success) { "✅ PASS" } else { "❌ FAIL" }
    $Color = if ($Result.Success) { "Green" } else { "Red" }
    Write-Host "$Status - $($Result.Name)" -ForegroundColor $Color
    
    if ($Result.Success) { $PassedCount++ }
}

Write-Host ""
Write-Host "📈 Overall: $PassedCount/$($TestResults.Count) tests passed" -ForegroundColor Yellow

if ($PassedCount -eq $TestResults.Count) {
    Write-Host "🎉 All tests passed! The API is working correctly." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the configuration:" -ForegroundColor Yellow
    Write-Host "   1. Server is running on $BaseUrl" -ForegroundColor Yellow
    Write-Host "   2. Qdrant is running and accessible" -ForegroundColor Yellow
    Write-Host "   3. OpenAI API key is configured" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 To run specific tests:" -ForegroundColor Cyan
Write-Host "   .\test-api.ps1 -SkipUpload    # Skip file upload test" -ForegroundColor Gray
Write-Host "   .\test-api.ps1 -BaseUrl 'http://other:3000'    # Use different URL" -ForegroundColor Gray
