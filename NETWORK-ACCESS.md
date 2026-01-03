# College Event Management System - Network Access

## 🌐 Access from Local Network

Your application is now configured to be accessible from your college network!

### Your Network Details
- **Your IP Address**: `10.1.27.166`
- **Frontend URL**: `http://10.1.27.166:3000`
- **Backend API**: `http://10.1.27.166:5000`

### For Your Peers

Share this URL with your classmates on the same network:
```
http://10.1.27.166:3000
```

They can open this in their browser and access the full application!

### Starting the Servers

**Option 1: Quick Start (Recommended)**
```cmd
start-network.bat
```
This will start both servers in separate windows with network access enabled.

**Option 2: Manual Start**

Backend:
```cmd
cd backend
npm run dev
```

Frontend (in new terminal):
```cmd
cd frontend
npm run dev
```

### Important Notes

1. **Firewall**: Windows Firewall may prompt you - click "Allow access"
2. **Same Network**: Your peers must be on the same WiFi/network (college network)
3. **Keep Running**: Don't close the terminal windows while peers are using the app
4. **Your Computer**: Must stay powered on for peers to access

### Troubleshooting

If peers can't access:
1. Check Windows Firewall settings
2. Verify both are on college network (same WiFi)
3. Try pinging your IP: `ping 10.1.27.166`
4. Disable VPN if active
5. Check antivirus isn't blocking ports 3000 and 5000

### Security Note

This is configured for local network access only. The CORS policy allows:
- localhost connections
- Local network IPs (10.x.x.x, 192.168.x.x ranges)
- Your specific IP: 10.1.27.166

External internet access is blocked for security.
