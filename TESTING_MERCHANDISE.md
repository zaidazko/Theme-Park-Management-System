# Testing the Merchandise Shop - Quick Start Guide

## Step 1: Add Merchandise to Database

### Option A: Starter Collection (Recommended for Testing)
Run the starter SQL script with 22 curated items:

```bash
# Connect to your MySQL database and run:
mysql -u your_username -p your_database < database/add_merchandise_starter.sql
```

Or open MySQL Workbench and execute the contents of:
- `database/add_merchandise_starter.sql`

### Option B: Full Collection
For the complete 80+ item catalog:
```bash
mysql -u your_username -p your_database < database/add_merchandise.sql
```

### Manual Verification
Check that merchandise was added successfully:

```sql
SELECT
    Commodity_TypeID,
    Commodity_Name,
    Base_Price,
    Stock_Quantity,
    Category
FROM commodity_type
WHERE Category = 'merchandise'
ORDER BY Base_Price;
```

You should see 22 items (starter) or 80+ items (full catalog).

## Step 2: Start the Application

### Backend (Terminal 1)
```bash
cd server
dotnet run
```

Server should start at `http://localhost:5000`

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Frontend should start at `http://localhost:5173`

## Step 3: Test Guest Shopping Flow

### A. Browse as Guest (No Login)
1. Open `http://localhost:5173` in browser
2. On the landing page, hover over **"Shop"** in the navigation
3. Click **"All Merchandise"** from the dropdown
4. You should see the merchandise shop page with products

**Expected Results:**
- Products display with colorful placeholder images
- Each product shows:
  - Product image (colored placeholder with name)
  - Product name
  - Price
  - Stock quantity badge (green if in stock, yellow if low, red if out)
  - Quantity selector
  - "Add to Cart" button (or "Out of Stock" if quantity is 0)

### B. Add Items to Cart
1. Select quantity for any item (use the number input)
2. Click **"🛒 Add to Cart"**
3. Success message should appear: "✅ Added [quantity]x [item name] to cart!"

**Expected Results:**
- Success message appears for 3 seconds
- Quantity resets to 1 for that item
- Cart now contains the item (check by clicking Cart button)

### C. Test Multiple Items
1. Add 3-4 different items to cart
2. Each should show success message
3. All items should accumulate in cart (not replace)

### D. View Cart
1. Click **"🛒 Cart"** button in top navigation
2. Review all items in cart

**Expected Results:**
- All added items displayed
- Correct quantities and prices shown
- Total price calculated correctly
- Each item has a "Remove" button

### E. Test Checkout as Guest
1. In cart, click **"Checkout"** button
2. Fill in guest email: `test@example.com`
3. Select visit date: tomorrow or any future date
4. Select payment method: **Credit Card**
5. Enter card information (any values work):
   - Card Number: `1234567890123456`
   - Expiry: `12/26`
   - CVV: `123`
   - Name: `Test User`
6. Click **"Confirm Purchase"**

**Expected Results:**
- Loading state shows "Processing..."
- Purchase completes successfully
- Success message: "Purchase completed successfully!"
- Cart clears automatically
- Checkout form closes

## Step 4: Test Stock Validation

### A. Out of Stock Items
1. Look for items with 0 stock (e.g., "SOLD OUT - Steel Dragon 'I Survived' Tee")
2. The item should show:
   - Red "Out of Stock" badge
   - No quantity selector
   - "❌ Out of Stock" button (disabled)

**Expected Results:**
- Cannot add out-of-stock items to cart
- Button is disabled and grey

### B. Low Stock Warning
1. Find items with 3-5 items in stock (e.g., "LOW STOCK - Crystal Coaster Sculpture")
2. Should show yellow/orange stock badge

### C. Database Trigger Validation
This tests the MySQL trigger that prevents over-purchasing:

1. Add an item with limited stock to cart (e.g., 3 in stock)
2. Try to purchase 5 of that item (edit quantity in cart before checkout)
3. Proceed to checkout

**Expected Results:**
- Backend should return error from database trigger
- Error message displays: "Insufficient stock. Only X item(s) available for [item name]"
- Cart is NOT cleared
- User can remove item or adjust quantity

### Manual Database Trigger Test
To manually test the trigger:

```sql
-- This should FAIL with trigger error
INSERT INTO commodity_sale (Customer_ID, Commodity_TypeID, Quantity, Purchase_Date, Price, Payment_Method)
VALUES (1, [commodity_type_id_with_low_stock], 999, NOW(), 99.99, 'credit');

-- Check error message contains "Insufficient stock"

-- This should SUCCEED
INSERT INTO commodity_sale (Customer_ID, Commodity_TypeID, Quantity, Purchase_Date, Price, Payment_Method)
VALUES (1, [commodity_type_id_with_stock], 1, NOW(), 29.99, 'credit');

-- Verify stock was deducted
SELECT Stock_Quantity FROM commodity_type WHERE Commodity_TypeID = [commodity_type_id];
```

## Step 5: Test Logged-in Customer Flow

### A. Create Account
1. Go back to landing page
2. Click **"Get Started"** or **"Sign In"**
3. Switch to **Register**
4. Create a new customer account

### B. Shop as Logged-in Customer
1. After login, click **"Shop Merchandise"** in navigation
2. Add items to cart
3. Go to cart
4. Click **"Checkout"**

**Expected Results:**
- No email field required (using account email)
- Same checkout flow as guest
- Purchase records saved to your customer account

### C. View Purchase History
1. Navigate to **"My Merchandise"** in the menu
2. Should see all your commodity purchases

## Step 6: Test Features

### ✅ Features to Verify

- [ ] Products load successfully from API
- [ ] Images show (placeholder colors for testing)
- [ ] Stock badges display correctly (in stock, low stock, out of stock)
- [ ] Quantity selector works
- [ ] Add to cart shows success message
- [ ] Multiple items can be added to cart
- [ ] Cart displays all items with correct totals
- [ ] Remove from cart works
- [ ] Clear cart works
- [ ] Guest email field appears for non-logged-in users
- [ ] Payment method selection works
- [ ] Card information fields appear for credit/debit
- [ ] Mobile payment option hides card fields
- [ ] Checkout validates required fields
- [ ] Purchase completes successfully
- [ ] Cart clears after successful purchase
- [ ] Database trigger prevents over-purchasing
- [ ] Stock quantity decreases after purchase
- [ ] Error messages display from database triggers

## Common Issues & Solutions

### Issue: No Products Showing
**Solution:**
- Check backend is running on port 5000
- Verify `VITE_API_URL` in frontend `.env` file
- Check browser console for API errors
- Verify merchandise was added to database with correct category 'merchandise'

### Issue: Images Not Loading
**Solution:**
- This is expected! Placeholder images should automatically load
- Colored placeholders with item names will display
- To add real images, follow `MERCHANDISE_IMAGE_GUIDE.md`

### Issue: Cannot Add to Cart
**Solution:**
- Check browser console for errors
- Verify localStorage is enabled in browser
- Clear browser cache and cookies
- Check if item is out of stock

### Issue: Checkout Fails
**Solution:**
- Check backend logs for errors
- Verify database triggers are installed
- Check if item has sufficient stock
- Ensure visit date is filled in
- Verify card info is complete (for credit/debit)

### Issue: Trigger Error Messages
**Solution:**
- This is actually GOOD - triggers are working!
- Adjust cart quantities to match available stock
- Remove out-of-stock items from cart

## Next Steps

### After Testing Works:

1. **Add Real Images:**
   - Follow `MERCHANDISE_IMAGE_GUIDE.md`
   - Place images in `frontend/public/merchandise/`
   - Images will automatically replace placeholders

2. **Expand Catalog:**
   - Run full merchandise SQL script (80+ items)
   - Or add custom items via database

3. **Customize Merchandise:**
   - Edit item names in database
   - Adjust prices for your park
   - Set realistic stock quantities
   - Add store locations (if you have multiple stores)

4. **Add Categories:**
   - Implement category filtering in shop
   - Create category navigation
   - Add sort/filter options

5. **Enhance UI:**
   - Add product detail pages
   - Implement search functionality
   - Add reviews/ratings for products
   - Create "Featured Products" section

## Performance Testing

### Load Test
- Add all items to cart at once
- Test with 100+ items in database
- Check page load times
- Verify cart performance with many items

### Stress Test the Trigger
1. Open two browser windows
2. Add same limited-stock item to both carts
3. Try to checkout simultaneously
4. Verify trigger prevents over-selling

## Database Queries for Testing

### Check Stock After Purchase
```sql
SELECT
    ct.Commodity_Name,
    ct.Stock_Quantity,
    COUNT(cs.Commodity_SaleID) as total_sales,
    SUM(cs.Quantity) as total_quantity_sold
FROM commodity_type ct
LEFT JOIN commodity_sale cs ON ct.Commodity_TypeID = cs.Commodity_TypeID
WHERE ct.Category = 'merchandise'
GROUP BY ct.Commodity_TypeID
ORDER BY total_quantity_sold DESC;
```

### View Recent Sales
```sql
SELECT
    cs.Commodity_SaleID,
    cs.Purchase_Date,
    ct.Commodity_Name,
    cs.Quantity,
    cs.Price,
    cs.Payment_Method
FROM commodity_sale cs
JOIN commodity_type ct ON cs.Commodity_TypeID = ct.Commodity_TypeID
WHERE ct.Category = 'merchandise'
ORDER BY cs.Purchase_Date DESC
LIMIT 20;
```

### Reset Stock (if needed for testing)
```sql
-- Reset all merchandise to default stock
UPDATE commodity_type
SET Stock_Quantity = 100
WHERE Category = 'merchandise';
```

---

## Quick Test Checklist

**Before Starting:**
- [ ] Backend running (`dotnet run`)
- [ ] Frontend running (`npm run dev`)
- [ ] Merchandise added to database
- [ ] Database triggers installed

**Guest Flow:**
- [ ] Can browse shop without login
- [ ] Can add items to cart
- [ ] Can view cart
- [ ] Can checkout with guest email
- [ ] Purchase completes successfully

**Stock Management:**
- [ ] Out of stock items disabled
- [ ] Low stock items show warning
- [ ] Trigger prevents over-purchasing
- [ ] Stock decreases after purchase

**UI/UX:**
- [ ] Images display (placeholders)
- [ ] Stock badges show correctly
- [ ] Prices formatted properly
- [ ] Cart total calculates correctly
- [ ] Success/error messages appear

**Ready for Production!** 🎉

Once all items are checked, your merchandise shop is fully functional!
