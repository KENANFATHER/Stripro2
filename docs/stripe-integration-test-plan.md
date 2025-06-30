# Stripe Integration Test Plan

## 1. Account Connection Flow

### 1.1 Verify OAuth Authentication Process
- [ ] Test initiating Stripe Connect from Settings page
- [ ] Verify correct OAuth parameters are sent to Stripe:
  - `client_id` matches Stripe Connect client ID
  - `scope` is set to "read_write"
  - `response_type` is set to "code"
  - `redirect_uri` points to the Supabase Edge Function

### 1.2 Test Redirection to Stripe Connect
- [ ] Verify user is redirected to Stripe Connect authorization page
- [ ] Confirm all required scopes are requested
- [ ] Test "Cancel" button returns user to application
- [ ] Verify state parameter is properly generated and includes user ID

### 1.3 Validate Return URL Handling
- [ ] Test successful authorization redirects to correct callback URL
- [ ] Verify `stripe-connect-callback` Edge Function processes authorization code
- [ ] Confirm user metadata is updated with Stripe account details
- [ ] Test redirect back to application with success parameters

### 1.4 Error Handling
- [ ] Test user cancellation during Stripe Connect flow
- [ ] Verify error parameters are properly passed back to application
- [ ] Test handling of invalid/expired authorization codes
- [ ] Verify appropriate error messages are displayed to users

## 2. Account Verification

### 2.1 Credential Storage
- [ ] Verify Stripe account ID is stored in user metadata
- [ ] Confirm `stripe_connected` flag is set to true
- [ ] Test that Stripe account email is properly stored
- [ ] Verify connection timestamp is recorded

### 2.2 API Key Validation
- [ ] Test publishable key validation in Settings page
- [ ] Verify API key format validation (pk_test_* or pk_live_*)
- [ ] Test Connect client ID validation (ca_*)
- [ ] Confirm API keys are securely stored in localStorage

### 2.3 Webhook Configuration
- [ ] Verify `stripe-webhook` Edge Function is accessible
- [ ] Test webhook signature validation
- [ ] Confirm webhook processes customer.created events
- [ ] Verify payment_intent.succeeded events update database
- [ ] Test charge.refunded event handling

### 2.4 Account Status Monitoring
- [ ] Verify account status is displayed correctly in UI
- [ ] Test refresh functionality for account status
- [ ] Confirm charges_enabled and payouts_enabled status is tracked
- [ ] Verify last checked timestamp is updated

## 3. Payment Processing

### 3.1 Payment Processing
- [ ] Test creating payment intents through connected account
- [ ] Verify correct customer association
- [ ] Test successful payment completion
- [ ] Confirm payment data is stored in stripe_payments table

### 3.2 Fee Calculations
- [ ] Verify Stripe fee calculation (2.9% + $0.30)
- [ ] Test application fee calculation if applicable
- [ ] Confirm net amount calculation is correct
- [ ] Verify profitability calculations in Edge Function

### 3.3 Payment Methods
- [ ] Test card payment processing
- [ ] Verify bank transfer handling if enabled
- [ ] Test digital wallet support if configured
- [ ] Confirm international payment handling

### 3.4 Refund Handling
- [ ] Test full refund processing
- [ ] Verify partial refund handling
- [ ] Confirm refund data is stored in stripe_refunds table
- [ ] Test refund impact on profitability calculations

## 4. Error Scenarios

### 4.1 Invalid API Keys
- [ ] Test behavior with invalid publishable key
- [ ] Verify error handling for invalid Connect client ID
- [ ] Test application behavior when Stripe.js fails to load
- [ ] Confirm appropriate error messages are displayed

### 4.2 Disconnection Process
- [ ] Test disconnecting Stripe account from Settings
- [ ] Verify proper OAuth deauthorization
- [ ] Confirm user metadata is updated correctly
- [ ] Test security event logging for disconnection

### 4.3 Token Handling
- [ ] Test behavior with expired OAuth tokens
- [ ] Verify handling of revoked access
- [ ] Test reconnection after disconnection
- [ ] Confirm session persistence across page reloads

### 4.4 Rate Limiting
- [ ] Test application behavior under Stripe API rate limits
- [ ] Verify retry logic for failed requests
- [ ] Test exponential backoff implementation
- [ ] Confirm user feedback during rate limiting

## 5. Security Requirements

### 5.1 PCI Compliance
- [ ] Verify no card data is stored in application
- [ ] Confirm Stripe.js is used for secure card collection
- [ ] Test that sensitive data is not logged
- [ ] Verify HTTPS is enforced for all connections

### 5.2 Data Encryption
- [ ] Confirm API keys are not exposed in client-side code
- [ ] Verify localStorage encryption for stored keys
- [ ] Test that API keys are masked in UI displays
- [ ] Confirm secure transmission of sensitive data

### 5.3 Credential Storage
- [ ] Verify Stripe secret key is only stored in Supabase secrets
- [ ] Confirm webhook secret is securely stored
- [ ] Test that publishable key is appropriately handled
- [ ] Verify Connect client ID is properly managed

### 5.4 Access Controls
- [ ] Test RLS policies for Stripe data tables
- [ ] Verify only authenticated users can access Stripe features
- [ ] Confirm users can only access their own Stripe data
- [ ] Test service role permissions for webhook processing

## Test Results

| Test ID | Description | Status | Issues | Notes |
|---------|-------------|--------|--------|-------|
| 1.1.1   | Initiate Stripe Connect | | | |
| 1.1.2   | Verify OAuth parameters | | | |
| ... | | | | |

## Issues and Recommendations

| Issue ID | Description | Severity | Recommendation | Status |
|----------|-------------|----------|----------------|--------|
| | | | | |

## Conclusion

Summary of test results and overall integration status.