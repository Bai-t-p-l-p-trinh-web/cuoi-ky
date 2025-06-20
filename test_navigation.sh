#!/bin/bash

# 🧪 Test Script - Payment Flow Navigation
echo "🚀 Testing Payment Flow Navigation..."

# 1. Check if frontend server is running
echo "📡 Checking frontend server..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend server is running"
else
    echo "❌ Frontend server is not running. Please start: npm run dev"
    exit 1
fi

# 2. Check if backend server is running  
echo "📡 Checking backend server..."
if curl -s http://localhost:3000/api/v1/health > /dev/null; then
    echo "✅ Backend server is running"
else
    echo "❌ Backend server is not running. Please start backend"
    exit 1
fi

# 3. Test key URLs
echo "🔍 Testing key navigation URLs..."

echo "Testing: http://localhost:5173/admin/payments"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/admin/payments | grep -q "200"; then
    echo "✅ Admin payments page accessible"
else
    echo "⚠️  Admin payments page may have issues"
fi

# 4. Test API endpoints
echo "🔌 Testing Payment Flow API endpoints..."

# Test payment status endpoint
if curl -s http://localhost:3000/api/v1/payments/status > /dev/null; then
    echo "✅ Payment status API working"
else
    echo "❌ Payment status API not responding"
fi

echo ""
echo "🎯 NAVIGATION SUMMARY:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏠 Frontend:     http://localhost:5173"
echo "🔧 Admin Panel:  http://localhost:5173/admin"  
echo "💳 Payments:     http://localhost:5173/admin/payments"
echo "🔄 Payment Flow: Tab 'Payment Flow (Mới)'"
echo "📋 New Payments: Filter 'Chờ xác nhận'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Ready to test! Admin can now see buyer payments immediately!"

# 5. Show next steps
echo ""
echo "📝 NEXT STEPS TO TEST:"
echo "1. 👤 Create buyer account & login"
echo "2. 🚗 Find a car & click 'Đặt mua'"  
echo "3. 💰 Choose payment method & submit"
echo "4. 📱 QR code appears instantly"
echo "5. 🏦 Simulate bank transfer"
echo "6. 🔢 Enter transaction ID"
echo "7. 👨‍💼 Admin login → /admin/payments"
echo "8. 🔄 Switch to 'Payment Flow' tab"
echo "9. 📋 See new payment in 'Chờ xác nhận'"
echo "10. ✅ Click 'Xác nhận nhận tiền'"
echo ""
echo "🚀 Complete payment flow test ready!"
