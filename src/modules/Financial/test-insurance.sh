#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Insurance Card Top-Up Feature Test Suite              ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Base URL
BASE_URL="http://localhost:5000"

# Check if server is running
echo -e "${YELLOW}⏳ Step 1: Checking if server is running...${NC}"
SERVER_STATUS=$(curl -s "$BASE_URL/" | jq -r '.status' 2>/dev/null)
if [ "$SERVER_STATUS" != "healthy" ]; then
    echo -e "${RED}❌ Server is not running on $BASE_URL${NC}"
    echo -e "${YELLOW}💡 Please start the server with: pnpm dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is healthy${NC}"
echo ""

# Get existing user data
echo -e "${YELLOW}⏳ Step 2: Fetching user 1's existing wallet and card...${NC}"
WALLET_DATA=$(curl -s "$BASE_URL/wallets/user/1")
WALLET_ID=$(echo "$WALLET_DATA" | jq -r '.data.wallets[0].id')
WALLET_BALANCE_BEFORE=$(echo "$WALLET_DATA" | jq -r '.data.wallets[0].balance')

CARD_DATA=$(curl -s "$BASE_URL/insurance-cards/user/1")
CARD_ID=$(echo "$CARD_DATA" | jq -r '.data.card.id')
CARD_BALANCE_BEFORE=$(echo "$CARD_DATA" | jq -r '.data.card.balance')
CARD_NUMBER=$(echo "$CARD_DATA" | jq -r '.data.card.card_number')

if [ "$WALLET_ID" == "null" ] || [ "$CARD_ID" == "null" ]; then
    echo -e "${RED}❌ User 1 doesn't have a wallet or insurance card${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found existing data:${NC}"
echo -e "   📱 Wallet ID: ${BLUE}$WALLET_ID${NC}"
echo -e "   💰 Wallet Balance: ${BLUE}$WALLET_BALANCE_BEFORE${NC}"
echo -e "   🏥 Insurance Card ID: ${BLUE}$CARD_ID${NC}"
echo -e "   💳 Card Number: ${BLUE}$CARD_NUMBER${NC}"
echo -e "   💵 Card Balance: ${BLUE}$CARD_BALANCE_BEFORE${NC}"
echo ""

# Test amount
TRANSFER_AMOUNT=250
echo -e "${YELLOW}⏳ Step 3: Topping up insurance card with ${BLUE}$TRANSFER_AMOUNT${NC}${YELLOW} from wallet...${NC}"
echo -e "   Source: Wallet $WALLET_ID"
echo -e "   Target: Insurance Card $CARD_ID"
echo ""

# Perform top-up
TOPUP_RESPONSE=$(curl -s -X POST "$BASE_URL/insurance-cards/$CARD_ID/top-up" \
  -H "Content-Type: application/json" \
  -d "{\"wallet_id\": $WALLET_ID, \"amount\": $TRANSFER_AMOUNT}")

# Check if successful
SUCCESS=$(echo "$TOPUP_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
    TRANSACTION_ID=$(echo "$TOPUP_RESPONSE" | jq -r '.data.transaction_id')
    echo -e "${GREEN}✅ Top-up successful!${NC}"
    echo -e "   Transaction ID: ${BLUE}$TRANSACTION_ID${NC}"
    echo ""
    
    # Get updated balances
    echo -e "${YELLOW}⏳ Step 4: Verifying balances...${NC}"
    WALLET_DATA_AFTER=$(curl -s "$BASE_URL/wallets/$WALLET_ID")
    WALLET_BALANCE_AFTER=$(echo "$WALLET_DATA_AFTER" | jq -r '.data.wallet.balance')
    
    CARD_DATA_AFTER=$(curl -s "$BASE_URL/insurance-cards/$CARD_ID")
    CARD_BALANCE_AFTER=$(echo "$CARD_DATA_AFTER" | jq -r '.data.card.balance')
    
    # Calculate expected values
    EXPECTED_WALLET=$((WALLET_BALANCE_BEFORE - TRANSFER_AMOUNT))
    EXPECTED_CARD=$((CARD_BALANCE_BEFORE + TRANSFER_AMOUNT))
    
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    BALANCE COMPARISON                      ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC} ${YELLOW}Wallet Balance:${NC}                                          ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}   Before:  ${WALLET_BALANCE_BEFORE}                                         ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}   After:   ${GREEN}${WALLET_BALANCE_AFTER}${NC}                                         ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}   Expected: ${EXPECTED_WALLET}                                        ${BLUE}║${NC}"
    if [ "$WALLET_BALANCE_AFTER" == "$EXPECTED_WALLET" ]; then
        echo -e "${BLUE}║${NC}   Status:  ${GREEN}✅ Correct${NC}                                      ${BLUE}║${NC}"
    else
        echo -e "${BLUE}║${NC}   Status:  ${RED}❌ Incorrect${NC}                                   ${BLUE}║${NC}"
    fi
    echo -e "${BLUE}║${NC}                                                            ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC} ${YELLOW}Insurance Card Balance:${NC}                                  ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}   Before:  ${CARD_BALANCE_BEFORE}                                        ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}   After:   ${GREEN}${CARD_BALANCE_AFTER}${NC}                                        ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}   Expected: ${EXPECTED_CARD}                                       ${BLUE}║${NC}"
    if [ "$CARD_BALANCE_AFTER" == "$EXPECTED_CARD" ]; then
        echo -e "${BLUE}║${NC}   Status:  ${GREEN}✅ Correct${NC}                                      ${BLUE}║${NC}"
    else
        echo -e "${BLUE}║${NC}   Status:  ${RED}❌ Incorrect${NC}                                   ${BLUE}║${NC}"
    fi
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Verify correctness
    if [ "$WALLET_BALANCE_AFTER" == "$EXPECTED_WALLET" ] && [ "$CARD_BALANCE_AFTER" == "$EXPECTED_CARD" ]; then
        echo -e "${GREEN}🎉 All tests passed! Insurance card top-up is working correctly.${NC}"
    else
        echo -e "${RED}❌ Balance mismatch detected!${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Top-up failed!${NC}"
    ERROR_MESSAGE=$(echo "$TOPUP_RESPONSE" | jq -r '.error.message')
    echo -e "${RED}Error: $ERROR_MESSAGE${NC}"
    echo ""
    echo -e "${YELLOW}Full response:${NC}"
    echo "$TOPUP_RESPONSE" | jq .
    exit 1
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  TEST SUITE COMPLETED                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
