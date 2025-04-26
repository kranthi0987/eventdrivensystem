# Check if .env file exists
if (Test-Path .env) {
    Write-Host ".env file already exists. Please remove it if you want to create a new one."
    exit 1
}

# Copy .env.example to .env
Copy-Item .env.example .env

# Get the server IP
$serverIP = Read-Host "Please enter your server IP address (or press Enter to use 0.0.0.0)"
if ([string]::IsNullOrWhiteSpace($serverIP)) {
    $serverIP = "0.0.0.0"
}

# Update .env with server IP
(Get-Content .env) -replace 'http://0.0.0.0', "http://$serverIP" | Set-Content .env

# Generate a random JWT secret
$jwtSecret = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
(Get-Content .env) -replace 'your_jwt_secret_here', $jwtSecret | Set-Content .env

Write-Host "Environment setup complete!"
Write-Host "Please review the .env file and update any other values as needed."
Write-Host "Do not commit the .env file to version control." 