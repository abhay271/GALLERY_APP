# Gallery App Backend Setup Script
# This script helps set up the environment and dependencies

param(
    [switch]$SetupQdrant = $false,
    [switch]$TestOnly = $false,
    [string]$OpenAIKey = ""
)

Write-Host "🚀 Gallery App Backend Setup" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

function Write-Step {
    param([string]$Message)
    Write-Host "📋 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-Command {
    param([string]$Command)
    return Get-Command $Command -ErrorAction SilentlyContinue
}

function Test-Port {
    param([int]$Port)
    try {
        $Connection = Test-NetConnection -ComputerName localhost -Port $Port -ErrorAction SilentlyContinue -WarningAction SilentlyContinue
        return $Connection.TcpTestSucceeded
    }
    catch {
        return $false
    }
}

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check Node.js
if (Test-Command "node") {
    $NodeVersion = node --version
    Write-Success "Node.js found: $NodeVersion"
} else {
    Write-Error "Node.js not found. Please install Node.js >= 18.0.0"
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Gray
    exit 1
}

# Check npm
if (Test-Command "npm") {
    $NpmVersion = npm --version
    Write-Success "npm found: v$NpmVersion"
} else {
    Write-Error "npm not found. Please install npm"
    exit 1
}

# Check Docker (optional)
if (Test-Command "docker") {
    Write-Success "Docker found"
    $DockerAvailable = $true
} else {
    Write-Warning "Docker not found. You'll need to install Qdrant manually"
    $DockerAvailable = $false
}

Write-Host ""

# Install dependencies
if (-not $TestOnly) {
    Write-Step "Installing dependencies..."
    try {
        npm install
        Write-Success "Dependencies installed successfully"
    }
    catch {
        Write-Error "Failed to install dependencies: $($_.Exception.Message)"
        exit 1
    }
    Write-Host ""
}

# Setup environment file
Write-Step "Setting up environment configuration..."

$EnvPath = ".env"
$EnvExists = Test-Path $EnvPath

if (-not $EnvExists) {
    Write-Warning ".env file not found. Creating from template..."
    
    $EnvContent = @"
# Server Configuration
PORT=3000

# OpenAI Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key

# Qdrant Configuration
# Default settings for local Qdrant instance
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=gallery_images
"@
    
    Set-Content -Path $EnvPath -Value $EnvContent
    Write-Success ".env file created"
}

# Update OpenAI API key if provided
if ($OpenAIKey -ne "") {
    Write-Step "Updating OpenAI API key in .env file..."
    
    $EnvContent = Get-Content $EnvPath -Raw
    $EnvContent = $EnvContent -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$OpenAIKey"
    Set-Content -Path $EnvPath -Value $EnvContent
    
    Write-Success "OpenAI API key updated"
}

# Check current .env configuration
$CurrentEnv = Get-Content $EnvPath | Where-Object { $_ -match "OPENAI_API_KEY=" }
if ($CurrentEnv -match "your_openai_api_key") {
    Write-Warning "OpenAI API key needs to be configured in .env file"
    Write-Host "   1. Get API key from: https://platform.openai.com/api-keys" -ForegroundColor Gray
    Write-Host "   2. Edit .env file and replace 'your_openai_api_key' with your actual key" -ForegroundColor Gray
} else {
    Write-Success "OpenAI API key is configured"
}

Write-Host ""

# Setup Qdrant
if ($SetupQdrant -and $DockerAvailable) {
    Write-Step "Setting up Qdrant with Docker..."
    
    # Check if Qdrant is already running
    if (Test-Port 6333) {
        Write-Success "Qdrant is already running on port 6333"
    } else {
        try {
            Write-Host "Starting Qdrant container..." -ForegroundColor Gray
            docker run -d --name qdrant -p 6333:6333 qdrant/qdrant
            
            # Wait for Qdrant to start
            Write-Host "Waiting for Qdrant to start..." -ForegroundColor Gray
            $Timeout = 30
            $Started = $false
            
            for ($i = 0; $i -lt $Timeout; $i++) {
                Start-Sleep 2
                if (Test-Port 6333) {
                    $Started = $true
                    break
                }
                Write-Host "." -NoNewline -ForegroundColor Gray
            }
            
            Write-Host ""
            
            if ($Started) {
                Write-Success "Qdrant started successfully on port 6333"
            } else {
                Write-Error "Qdrant failed to start within $Timeout seconds"
            }
        }
        catch {
            Write-Error "Failed to start Qdrant: $($_.Exception.Message)"
        }
    }
} else {
    Write-Step "Checking Qdrant status..."
    if (Test-Port 6333) {
        Write-Success "Qdrant is running on port 6333"
    } else {
        Write-Warning "Qdrant is not running on port 6333"
        Write-Host "To start Qdrant manually:" -ForegroundColor Gray
        if ($DockerAvailable) {
            Write-Host "   docker run -p 6333:6333 qdrant/qdrant" -ForegroundColor Gray
        } else {
            Write-Host "   Download from: https://github.com/qdrant/qdrant/releases" -ForegroundColor Gray
        }
    }
}

Write-Host ""

# Test server
Write-Step "Testing if server is ready to start..."

# Check if port 3000 is available
if (Test-Port 3000) {
    Write-Warning "Port 3000 is already in use. Another instance might be running."
} else {
    Write-Success "Port 3000 is available"
}

Write-Host ""

# Summary and next steps
Write-Host "📋 Setup Summary:" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green

$ReadyToRun = $true

# Check OpenAI key
$EnvContent = Get-Content $EnvPath -Raw
if ($EnvContent -match "OPENAI_API_KEY=your_openai_api_key") {
    Write-Host "❌ OpenAI API key not configured" -ForegroundColor Red
    $ReadyToRun = $false
} else {
    Write-Host "✅ OpenAI API key configured" -ForegroundColor Green
}

# Check Qdrant
if (Test-Port 6333) {
    Write-Host "✅ Qdrant running on port 6333" -ForegroundColor Green
} else {
    Write-Host "❌ Qdrant not running" -ForegroundColor Red
    $ReadyToRun = $false
}

# Check dependencies
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Dependencies not installed" -ForegroundColor Red
    $ReadyToRun = $false
}

Write-Host ""

if ($ReadyToRun) {
    Write-Host "🎉 Setup complete! Ready to start the server." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "   npm start           # Start the server" -ForegroundColor Gray
    Write-Host "   npm run dev         # Start with auto-restart" -ForegroundColor Gray
    Write-Host "   node test-api.js    # Test all endpoints" -ForegroundColor Gray
    Write-Host "   .\test-api.ps1      # Test with PowerShell" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Setup incomplete. Please fix the issues above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Cyan
    Write-Host "   1. Configure OpenAI API key in .env file" -ForegroundColor Gray
    Write-Host "   2. Start Qdrant: docker run -p 6333:6333 qdrant/qdrant" -ForegroundColor Gray
    Write-Host "   3. Install dependencies: npm install" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📖 For detailed instructions, see README.md" -ForegroundColor Cyan
