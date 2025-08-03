-- SQL script to update the constraint on PaymentTransaction table

-- First, identify the constraint name
DECLARE @constraintName NVARCHAR(128);
SELECT @constraintName = name 
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID(N'[dbo].[PaymentTransaction]') 
AND name LIKE 'CK__PaymentTr__trans%';

-- Print the constraint name for verification
PRINT 'Found constraint: ' + ISNULL(@constraintName, 'No constraint found');

-- Drop the constraint if it exists
IF @constraintName IS NOT NULL
BEGIN
    DECLARE @sql NVARCHAR(MAX);
    SET @sql = N'ALTER TABLE [dbo].[PaymentTransaction] DROP CONSTRAINT ' + QUOTENAME(@constraintName);
    EXEC sp_executesql @sql;
    PRINT 'Dropped constraint: ' + @constraintName;
END

-- Add the new constraint with CANCELLED status
ALTER TABLE [dbo].[PaymentTransaction] WITH CHECK ADD CONSTRAINT [CK_PaymentTransaction_TransactionStatus] 
CHECK (([transaction_status]='FAILED' OR [transaction_status]='SUCCESS' OR [transaction_status]='PENDING' OR [transaction_status]='CANCELLED'));
PRINT 'Added new constraint: CK_PaymentTransaction_TransactionStatus'; 