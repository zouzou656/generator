-- =============================================
-- Fix Owner Password Hash
-- Run this script if the database was seeded with the wrong password hash
-- =============================================

USE [YourDatabaseName]; -- Change to your database name
GO

-- Update the owner user's password hash to the correct SHA256 hash of "owner"
UPDATE dbo.AppUser
SET PasswordHash = '4c1029697ee358715d3a14a2add817c4b01651440de808371f78165ac90dc581'
WHERE Email = 'owner@generator.com';

PRINT 'Owner password hash updated successfully!';
PRINT 'You can now login with: owner@generator.com / owner';
GO

