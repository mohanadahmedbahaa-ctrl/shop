-- =====================================================================
-- PRACTICE QUERIES. Run them one by one inside psql:
--   psql -U postgres -d oakline
-- then paste a query (end it with ;). Or run the whole file:
--   psql -U postgres -d oakline -f server/db/queries.sql
--
-- Each one matches something your React app already does in JavaScript.
-- In the next step your Express API will send these queries to Postgres.
-- =====================================================================


-- 1. SELECT ... FROM: read rows.  JS: products
SELECT id, title, price FROM products;


-- 2. WHERE + ORDER BY: filter and sort.
--    JS (productFilters.ts): list.filter(p => p.category === 'kitchen').toSorted((a, b) => a.price - b.price)
SELECT id, title, price
FROM products
WHERE category = 'kitchen'
ORDER BY price ASC;


-- 3. Several conditions with AND. "On sale and under $50".
--    IS NOT NULL, never `= NULL`: NULL means "unknown", so `x = NULL` is never true.
--    JS: p.price < 50 && getDiscountPercent(p) !== null
SELECT title, price, compare_at_price
FROM products
WHERE compare_at_price IS NOT NULL
  AND price < 50;


-- 4. Calculated column + alias (AS).  JS: getDiscountPercent() + sort 'discount'
--    ROUND(..., 0) on NUMERIC gives a whole number.
SELECT title,
       ROUND((1 - price / compare_at_price) * 100, 0) AS discount_percent
FROM products
WHERE compare_at_price IS NOT NULL
ORDER BY discount_percent DESC
LIMIT 4;                                  -- JS: .slice(0, 4)


-- 5. Search. ILIKE = case-insensitive LIKE, % = "any characters".
--    JS: `${p.title} ${p.category}`.toLowerCase().includes(query)
SELECT id, title FROM products WHERE title ILIKE '%lamp%';


-- 6. JOIN: combine tables. Every product with its MAIN image (position 0).
--    p and i are short ALIASES for the table names.
--    JS: product.images[0]
SELECT p.id, p.title, i.url AS image
FROM products p
JOIN product_images i ON i.product_id = p.id AND i.position = 0
ORDER BY p.id;


-- 7. JOIN with categories to get the readable name.
--    JS: categoryInfo[product.category].name
SELECT p.title, c.name AS category_name
FROM products p
JOIN categories c ON c.slug = p.category;


-- 8. GROUP BY + COUNT: how many products per category.
--    LEFT JOIN keeps categories with 0 products (a plain JOIN would drop them).
--    JS: categoryCounts in FilterPanel.tsx
SELECT c.name, COUNT(p.id) AS product_count
FROM categories c
LEFT JOIN products p ON p.category = c.slug
GROUP BY c.slug, c.name, c.position
ORDER BY c.position;


-- 9. One product with ALL its images as an array, the shape your frontend expects.
--    array_agg collects many rows into one array, in image order.
--    JS: products.find(p => p.id === 3)
SELECT p.*, array_agg(i.url ORDER BY i.position) AS images
FROM products p
JOIN product_images i ON i.product_id = p.id
WHERE p.id = 3
GROUP BY p.id;


-- 10. The constraints at work. Each of these is REJECTED by the database.
--     Uncomment one at a time to see the error message.
-- INSERT INTO products (title, description, category, price) VALUES ('Test', 'x', 'kitchn', 10);  -- foreign key: no such category
-- UPDATE products SET rating = 7 WHERE id = 1;                                                    -- CHECK: rating must be 0-5
-- UPDATE products SET stock = -1 WHERE id = 1;                                                    -- CHECK: stock can't be negative
