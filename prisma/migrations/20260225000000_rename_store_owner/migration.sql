-- Rename PRODUCT_MANAGER role to STORE_OWNER
-- This reflects that Olha is the business owner, not just a product manager
ALTER TYPE "UserRole" RENAME VALUE 'PRODUCT_MANAGER' TO 'STORE_OWNER';
