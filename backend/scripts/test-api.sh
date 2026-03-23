#!/bin/bash

# Turab Root API Testing Script
# Tests all endpoints to verify backend is working correctly

API_URL="${1:-http://localhost:3001/api}"
ADMIN_EMAIL="admin@turabroot.com"
ADMIN_PASSWORD="Admin@2024!"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_code=$4
    local description=$5

    echo -e "\n${YELLOW}Testing:${NC} $description"
    echo "  Method: $method"
    echo "  Endpoint: $endpoint"

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${TOKEN:+-H "Authorization: Bearer $TOKEN"})
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            ${TOKEN:+-H "Authorization: Bearer $TOKEN"} \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" == "$expected_code" ]; then
        echo -e "  ${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASS++))
        echo "  Response: $(echo $body | jq -r '.message // .data.message // "OK"' 2>/dev/null || echo "$body" | head -c 100)"
    else
        echo -e "  ${RED}✗ FAIL${NC} (Expected $expected_code, got $http_code)"
        ((FAIL++))
        echo "  Response: $body"
    fi
}

echo "=========================================="
echo "Turab Root API Test Suite"
echo "=========================================="
echo "API Base URL: $API_URL"
echo "Admin Email: $ADMIN_EMAIL"
echo ""

# Test 1: Health check
echo -e "${YELLOW}=== Health Check ===${NC}"
test_endpoint "GET" "/health" "" "200" "Health check endpoint"

# Test 2: Login (required for other tests)
echo -e "\n${YELLOW}=== Authentication ===${NC}"
login_response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$login_response" | jq -r '.data.accessToken // empty' 2>/dev/null)
REFRESH_TOKEN=$(echo "$login_response" | jq -r '.data.refreshToken // empty' 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Login failed. Cannot continue tests.${NC}"
    echo "Response: $login_response"
    echo ""
    echo "Create admin user first:"
    echo "  sqlite3 db.sqlite"
    echo "  INSERT INTO admins (username, email, password_hash, role, created_at, updated_at)"
    echo "  VALUES ('admin', 'admin@turabroot.com', '\$2a\$12\$...', 'admin', datetime('now'), datetime('now'));"
    exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Access Token: ${TOKEN:0:20}..."
echo ""

# Test 3: Projects endpoints
echo -e "${YELLOW}=== Projects (Public) ===${NC}"
test_endpoint "GET" "/projects" "" "200" "List all projects"
test_endpoint "GET" "/projects?featured=true" "" "200" "List featured projects"

# Create a test project
echo -e "\n${YELLOW}=== Create Project ===${NC}"
PROJECT_DATA='{
    "title": "Test Project",
    "description": "This is a test project for API validation",
    "status": "active",
    "url": "https://example.com",
    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "category": "Web",
    "is_website": true,
    "tech_tags": ["Node.js", "React", "PostgreSQL"],
    "featured": false
}'
test_endpoint "POST" "/projects" "$PROJECT_DATA" "201" "Create new project"

# Extract project ID from response (simplified)
PROJECT_ID=$(curl -s -X POST "$API_URL/projects" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$PROJECT_DATA" | jq -r '.data.id // empty' 2>/dev/null)

if [ ! -z "$PROJECT_ID" ]; then
    echo "Created project ID: $PROJECT_ID"
    
    # Test get single project
    echo -e "\n${YELLOW}=== Get Project ===${NC}"
    test_endpoint "GET" "/projects/$PROJECT_ID" "" "200" "Get single project"
    
    # Test update project
    echo -e "\n${YELLOW}=== Update Project ===${NC}"
    UPDATE_DATA='{"title":"Updated Test Project"}'
    test_endpoint "PUT" "/projects/$PROJECT_ID" "$UPDATE_DATA" "200" "Update project"
fi

# Test 4: Messages endpoints
echo -e "\n${YELLOW}=== Messages (Contact Form) ===${NC}"
MESSAGE_DATA='{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "This is a test message from the API test suite"
}'
test_endpoint "POST" "/messages" "$MESSAGE_DATA" "201" "Submit contact form (public)"
test_endpoint "GET" "/messages" "" "200" "List messages (admin)"

# Test 5: Admin endpoints
echo -e "\n${YELLOW}=== Admin Management ===${NC}"
test_endpoint "GET" "/admins" "" "200" "List admin users"

# Test 6: Social links
echo -e "\n${YELLOW}=== Social Links ===${NC}"
test_endpoint "GET" "/social-links" "" "200" "List enabled social links"

# Create social link
SOCIAL_DATA='{
    "platform": "facebook",
    "url": "https://facebook.com/turabroot",
    "enabled": true
}'
test_endpoint "POST" "/social-links" "$SOCIAL_DATA" "201" "Create social link"

# Test 7: Project requests
echo -e "\n${YELLOW}=== Project Requests ===${NC}"
PROJECT_REQUEST_DATA='{
    "project_type": "Web Application",
    "security_level": "High",
    "custom_features": "Real-time collaboration",
    "company_name": "Test Company",
    "email": "contact@testcompany.com",
    "phone": "+1234567890"
}'
test_endpoint "POST" "/project-requests" "$PROJECT_REQUEST_DATA" "201" "Submit project request (public)"
test_endpoint "GET" "/project-requests" "" "200" "List project requests (admin)"

# Test 8: Error handling
echo -e "\n${YELLOW}=== Error Handling ===${NC}"
test_endpoint "GET" "/projects/99999" "" "404" "Get non-existent project"
test_endpoint "POST" "/messages" '{}' "400" "Invalid message (validation)"

# Test 9: Token refresh
echo -e "\n${YELLOW}=== Token Refresh ===${NC}"
if [ ! -z "$REFRESH_TOKEN" ]; then
    REFRESH_DATA="{\"refreshToken\":\"$REFRESH_TOKEN\"}"
    test_endpoint "POST" "/auth/refresh" "$REFRESH_DATA" "200" "Refresh access token"
fi

# Test 10: Cleanup (delete test project)
if [ ! -z "$PROJECT_ID" ]; then
    echo -e "\n${YELLOW}=== Cleanup ===${NC}"
    test_endpoint "DELETE" "/projects/$PROJECT_ID" "" "200" "Delete test project"
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo "=========================================="

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
