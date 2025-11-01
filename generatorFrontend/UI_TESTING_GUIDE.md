# UI Testing Guide - Generator Platform

This guide provides step-by-step instructions to test all UI functionality with example data.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Check My Bill Feature](#check-my-bill-feature)
3. [Navigation & Pages](#navigation--pages)
4. [Theme & Language Switching](#theme--language-switching)
5. [Login & Authentication](#login--authentication)
6. [Interactive Elements](#interactive-elements)

---

## Prerequisites

1. Start the development server:
   ```bash
   cd generatorFrontend
   npm start
   ```

2. Open your browser to `http://localhost:4200`

3. Ensure the mock API data is loaded (check browser console for any errors)

---

## Check My Bill Feature

### Test Case 1: Find Bills with Phone Number Only

**Steps:**
1. Navigate to the home page (`/`)
2. Click the **"Check my bill"** button (prominent purple button in hero section)
3. You should see the "Check my bill" page
4. In the **Phone number** field, enter: `+96170100000`
5. Leave the **Subscription number** field empty
6. Click **"Find my bills"** button

**Expected Result:**
- You should see bill results displayed in tabs
- **Pending** tab should show bills that need to be paid
- **Paid** tab should show bills that have been paid
- Each bill card should display:
  - Customer name
  - Billing period
  - Due date
  - USD amount
  - LBP amount
  - Status chip (warn color for pending, primary for paid)

---

### Test Case 2: Find Bills with Phone + Subscription Number

**Steps:**
1. Navigate to `/check-bill`
2. Enter phone number: `+96170100027`
3. Enter subscription number: `SUB1201`
4. Click **"Find my bills"**

**Expected Result:**
- Bills filtered by both phone number and subscription number
- More specific results (fewer bills than phone-only search)

---

### Test Case 3: Phone Number with Multiple Bills

**Steps:**
1. Go to `/check-bill`
2. Enter: `+96170100054`
3. Click **"Find my bills"**

**Expected Result:**
- Should display multiple bills if the customer has multiple subscriptions
- Both pending and paid bills should be visible in their respective tabs

---

### Test Case 4: Invalid Phone Number

**Steps:**
1. Go to `/check-bill`
2. Enter an invalid phone number like: `123456` or `+1234567890`
3. Click **"Find my bills"**

**Expected Result:**
- Form validation error message appears
- Button should be disabled or form submission prevented
- Error message should say: "Enter a valid Lebanese phone number starting with +961"

---

### Test Case 5: Phone Number with No Bills

**Steps:**
1. Go to `/check-bill`
2. Enter: `+96170999999` (non-existent number)
3. Click **"Find my bills"**

**Expected Result:**
- Error message displayed: "No bills found for this phone yet."
- No tabs or bill cards shown

---

### Test Case 6: Check Bill Button Styling

**Steps:**
1. Navigate to home page (`/`)
2. Hover over the **"Check my bill"** button
3. Click and hold the button (active state)
4. Observe button transitions

**Expected Result:**
- Button should have smooth hover effect (lifts up slightly)
- Shadow increases on hover
- Button has smooth transitions
- Active state shows button press effect

---

## Navigation & Pages

### Test Case 7: Navigation Links

**Steps:**
1. From the home page, click each navigation link in the top menu:
   - **Home** (`/`)
   - **About** (`/about`)
   - **Services** (`/services`)
   - **Contact** (`/contact`)
   - **Check My Bill** (`/check-bill`)

**Expected Result:**
- Each link navigates to the correct page
- Active link should be highlighted (blue underline)
- Page titles should update correctly
- All i18n keys should be translated (no placeholder text)

---

### Test Case 8: Footer Links

**Steps:**
1. Scroll to the bottom of any page
2. Test footer links:
   - Click **LinkedIn** link (should open LinkedIn in new tab)
   - Click **Instagram** link (should open Instagram in new tab)
   - Click **hello@generator.example** (should open email client)

**Expected Result:**
- Social media links open in new browser tabs
- Email link opens default email client with recipient pre-filled

---

## Theme & Language Switching

### Test Case 9: Theme Toggle

**Steps:**
1. Look at the top-right corner of the page
2. Find the theme button (shows "Dark" or "Soft Light")
3. Click the theme button
4. Observe the page appearance

**Expected Result:**
- Page theme switches between dark and soft-light themes
- All colors update appropriately
- Theme preference should persist on page refresh
- Button text updates to show current theme

---

### Test Case 10: Language Switching

**Steps:**
1. Find the language selector in the top-right (shows "EN" and "ع")
2. Click on **"ع"** (Arabic)
3. Observe the page content

**Expected Result:**
- All text should switch to Arabic (if translations are loaded)
- Page layout should switch to RTL (Right-to-Left)
- Navigation and content should align to the right
4. Click **"EN"** to switch back to English
5. Layout should return to LTR (Left-to-Right)

**Note:** If you see i18n keys instead of translations, the translations are still loading. Refresh the page.

---

## Login & Authentication

### Test Case 11: Login Page Access

**Steps:**
1. Click **"Login"** button in the top navigation
2. You should be redirected to `/auth/login`

**Expected Result:**
- Login form should appear
- Form should have:
  - Email field
  - Password field
  - Role selector (Administrator / Generator Owner)
  - "Keep me signed in" checkbox
  - Submit button

---

### Test Case 12: Admin Login

**Steps:**
1. Go to `/auth/login`
2. Enter email: `admin@example.com`
3. Enter password: (any password)
4. Select role: **Administrator**
5. Click **"Continue"**

**Expected Result:**
- Should redirect to `/admin` dashboard
- Admin sidebar and navigation should appear
- Should have access to:
  - Requests management
  - User management
  - Reports

---

### Test Case 13: Generator Owner Login

**Steps:**
1. Go to `/auth/login`
2. Enter email: `owner@example.com`
3. Enter password: (any password)
4. Select role: **Generator Owner**
5. Click **"Continue"**

**Expected Result:**
- Should redirect to `/owner/dashboard`
- Owner dashboard should display:
  - KPIs (Customers, Active subscriptions, Pending bills, SMS sent)
  - Monthly billed totals chart
- Owner navigation should include:
  - Dashboard
  - Customers
  - Bills
  - Imports
  - SMS
  - Reports

---

## Interactive Elements

### Test Case 14: Button Interactions

**Test all buttons on the site:**

1. **Primary buttons** (Check my bill, Submit forms):
   - Hover: Button should lift slightly with enhanced shadow
   - Click: Should have active/pressed state
   - Disabled: Should show reduced opacity and no hover effects

2. **Secondary buttons** (Talk to us, Cancel):
   - Hover: Background color should change subtly
   - Border should become more prominent

**Expected Result:**
- All buttons should have smooth transitions
- No jarring animations
- Buttons should feel responsive

---

### Test Case 15: Form Field Interactions

**Steps:**
1. Navigate to `/check-bill`
2. Click in the **Phone number** field
3. Type and observe field behavior
4. Click outside the field (blur)
5. Click back in the field

**Expected Result:**
- Field should have smooth focus/blur transitions
- Focused field should have subtle shadow/outline
- Error messages should appear below fields when invalid
- Form validation should work in real-time

---

### Test Case 16: Card Hover Effects

**Steps:**
1. Navigate to `/check-bill`
2. Search for bills using: `+96170100000`
3. Hover over the bill cards

**Expected Result:**
- Cards should lift up slightly on hover
- Shadow should enhance
- Border color should become more prominent
- Transitions should be smooth

---

### Test Case 17: Tab Navigation

**Steps:**
1. Go to `/check-bill`
2. Search with: `+96170100000`
3. Click between **Pending** and **Paid** tabs

**Expected Result:**
- Tabs should switch smoothly
- Active tab should be highlighted
- Tab count should be accurate (e.g., "Pending (3)")
- Content should update immediately

---

## Quick Test Data Reference

### Phone Numbers with Bills:
- `+96170100000` - Customer with bills
- `+96170100027` - Customer with subscription SUB1201
- `+96170100054` - Customer with multiple bills
- `+96170100081` - Customer with bills

### Subscription Numbers:
- `SUB1200` through `SUB1235` - Valid subscriptions
- `SUB1300` through `SUB1347` - Import batch subscriptions

### Invalid Test Data:
- `+1234567890` - Invalid format
- `123456` - Missing country code
- `+96170999999` - Non-existent customer

---

## Common Issues & Troubleshooting

### Issue: i18n keys showing instead of translations
**Solution:** 
- Refresh the page
- Check browser console for translation loading errors
- Verify `assets/i18n/en.json` is accessible

### Issue: Buttons not responding
**Solution:**
- Check browser console for JavaScript errors
- Verify Angular is fully loaded
- Try clearing browser cache

### Issue: Bills not loading
**Solution:**
- Verify mock API is working (check Network tab)
- Ensure `assets/mocks/mock-state.json` is accessible
- Check browser console for API errors

---

## Performance Testing

### Test Case 18: Page Load Performance

**Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to different pages
4. Observe load times

**Expected Result:**
- Initial page load: < 2 seconds
- Navigation between pages: < 500ms
- Translations should load within 1 second
- No blocking resources

---

## Accessibility Testing

### Test Case 19: Keyboard Navigation

**Steps:**
1. Use Tab key to navigate through page
2. Use Enter/Space to activate buttons
3. Use Arrow keys in forms and tabs

**Expected Result:**
- All interactive elements should be focusable
- Focus indicators should be visible
- Keyboard shortcuts should work
- No keyboard traps

---

## Browser Compatibility

Test the application in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

**Last Updated:** After i18n and CSS enhancements
**Tested By:** [Your Name]
**Version:** 1.0

