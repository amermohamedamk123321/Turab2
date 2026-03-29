#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001/api"
ADMIN_EMAIL="admin@turabroot.com"
ADMIN_PASSWORD="admin123"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test header
print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

# Function to test endpoint
test_endpoint() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected_code="$5"
  local auth_token="$6"

  echo -e "${YELLOW}Testing: $test_name${NC}"
  
  local headers="-H 'Content-Type: application/json'"
  if [ ! -z "$auth_token" ]; then
    headers="$headers -H 'Authorization: Bearer $auth_token'"
  fi

  if [ "$method" = "GET" ]; then
    response=$(eval "curl -s -w '\n%{http_code}' -X GET '$API_URL$endpoint' $headers")
  else
    response=$(eval "curl -s -w '\n%{http_code}' -X $method '$API_URL$endpoint' $headers -d '$data'")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "$expected_code" ]; then
    echo -e "${GREEN}✓ PASS${NC} - HTTP $http_code"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC} - Expected $expected_code, got $http_code"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  echo ""
}

# Test 1: Authentication
print_header "TEST 1: AUTHENTICATION"

# Test 1.1: Valid login
response=$(curl -s -w '\n%{http_code}' -X POST "$API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - Login successful (HTTP 200)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  
  # Extract tokens
  ACCESS_TOKEN=$(echo "$body" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  REFRESH_TOKEN=$(echo "$body" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
  
  echo "Access Token: ${ACCESS_TOKEN:0:20}..."
  echo "Refresh Token: ${REFRESH_TOKEN:0:20}..."
else
  echo -e "${RED}✗ FAIL${NC} - Login failed (HTTP $http_code)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  exit 1
fi
echo ""

# Test 1.2: Invalid credentials
echo -e "${YELLOW}Testing: Invalid credentials${NC}"
response=$(curl -s -w '\n%{http_code}' -X POST "$API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@turabroot.com","password":"wrongpassword"}')

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ]; then
  echo -e "${GREEN}✓ PASS${NC} - Invalid password rejected (HTTP 401)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC} - Expected 401, got $http_code"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 1.3: Logout now REQUIRES authentication (the fix!)
echo -e "${YELLOW}Testing: Logout without token should fail (SECURITY FIX)${NC}"
response=$(curl -s -w '\n%{http_code}' -X POST "$API_URL/auth/logout" \
  -H 'Content-Type: application/json' \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ]; then
  echo -e "${GREEN}✓ PASS${NC} - Logout without auth token rejected (HTTP 401) - SECURITY FIX VERIFIED${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC} - Logout should require auth token. Got $http_code"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 1.4: Logout WITH authentication
echo -e "${YELLOW}Testing: Logout with valid token${NC}"
response=$(curl -s -w '\n%{http_code}' -X POST "$API_URL/auth/logout" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - Logout with auth token successful (HTTP 200)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC} - Expected 200, got $http_code"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Get a fresh token for remaining tests
response=$(curl -s -w '\n%{http_code}' -X POST "$API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
body=$(echo "$response" | sed '$d')
ACCESS_TOKEN=$(echo "$body" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Test 2: Input Validation
print_header "TEST 2: INPUT VALIDATION & INJECTION"

# Test 2.1: SQL Injection attempt in login
echo -e "${YELLOW}Testing: SQL Injection in login email${NC}"
response=$(curl -s -w '\n%{http_code}' -X POST "$API_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"admin@turabroot.com' OR '1'='1\",\"password\":\"test\"}")

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ]; then
  echo -e "${GREEN}✓ PASS${NC} - SQL injection attempt rejected (HTTP 401)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${YELLOW}⚠ WARNING${NC} - Unexpected response: HTTP $http_code"
fi
echo ""

# Test 3: Authorization
print_header "TEST 3: AUTHORIZATION & ACCESS CONTROL"

# Test 3.1: Access protected endpoint without token
echo -e "${YELLOW}Testing: Access /admins without token${NC}"
response=$(curl -s -w '\n%{http_code}' -X GET "$API_URL/admins" \
  -H 'Content-Type: application/json')

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ]; then
  echo -e "${GREEN}✓ PASS${NC} - Protected endpoint blocked (HTTP 401)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC} - Expected 401, got $http_code"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 3.2: Access protected endpoint with token
echo -e "${YELLOW}Testing: Access /admins with valid token${NC}"
response=$(curl -s -w '\n%{http_code}' -X GET "$API_URL/admins" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - Protected endpoint accessible with token (HTTP 200)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC} - Expected 200, got $http_code"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 4: Dashboard Data
print_header "TEST 4: DASHBOARD ENDPOINTS"

# Test 4.1: Get projects (public)
echo -e "${YELLOW}Testing: Get projects (public)${NC}"
response=$(curl -s -w '\n%{http_code}' -X GET "$API_URL/projects")

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✓ PASS${NC} - Public projects endpoint (HTTP 200)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC} - Expected 200, got $http_code"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 4.2: Get messages (admin only)
echo -e "${YELLOW}Testing: Get messages without token${NC}"
response=$(curl -s -w '\n%{http_code}' -X GET "$API_URL/messages")

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "401" ]; then
  echo -e "${GREEN}✓ PASS${NC} - Admin messages blocked without auth (HTTP 401)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ FAIL${NC} - Expected 401, got $http_code"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 5: Rate Limiting
print_header "TEST 5: RATE LIMITING"

# Test 5.1: Contact form rate limit
echo -e "${YELLOW}Testing: Contact form rate limiting${NC}"
for i in {1..4}; do
  response=$(curl -s -w '\n%{http_code}' -X POST "$API_URL/messages" \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"Test\",\"email\":\"test$i@example.com\",\"subject\":\"Test\",\"message\":\"This is a test message for rate limiting testing\"}")
  
  http_code=$(echo "$response" | tail -n1)
  
  if [ $i -lt 4 ]; then
    if [ "$http_code" = "201" ]; then
      echo -e "${GREEN}✓${NC} Request $i: HTTP $http_code (allowed)"
    else
      echo -e "${YELLOW}⚠${NC} Request $i: HTTP $http_code"
    fi
  else
    if [ "$http_code" = "429" ]; then
      echo -e "${GREEN}✓ PASS${NC} - Rate limit enforced (HTTP 429)"
      TESTS_PASSED=$((TESTS_PASSED + 1))
    else
      echo -e "${YELLOW}⚠ WARNING${NC} - Rate limit may not be enforced correctly (HTTP $http_code)"
    fi
  fi
done
echo ""

# Summary
print_header "TEST SUMMARY"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
