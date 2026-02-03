@echo off
echo Creating TRAVELLO Blog Database for PHPMyAdmin...
echo.

echo 📋 Instructions for PHPMyAdmin Setup:
echo.
echo 1. Open PHPMyAdmin in your browser
echo 2. Click on "New" to create a new database
echo 3. Database name: travello_blog
echo 4. Collation: utf8mb4_unicode_ci
echo 5. Click "Create"
echo.
echo 6. Select the travello_blog database
echo 7. Click on "Import" tab
echo 8. Choose file: blog-crud.sql
echo 9. Click "Go" to import
echo.
echo ✅ Database will be created with:
echo    • blog_articles table
echo    • blog_authors table  
echo    • blog_categories table
echo    • blog_tags table
echo    • article_tags junction table
echo    • Sample data and stored procedures
echo.
echo 🚀 After setup, you can:
echo    • Access admin panel at: http://localhost:5173/admin/blog
echo    • View blog at: http://localhost:5173/blog
echo    • API endpoints available at: http://localhost:5000/api/blog/*
echo.
echo 📁 SQL file location: %cd%\blog-crud.sql
echo.

if exist "blog-crud.sql" (
    echo ✅ SQL file found: blog-crud.sql
    echo 📏 File size: 
    for %%I in (blog-crud.sql) do echo    %%~zI bytes
) else (
    echo ❌ SQL file not found: blog-crud.sql
    echo Please ensure the blog-crud.sql file exists in this directory.
)

echo.
echo Press any key to open the database directory...
pause >nul
explorer %cd%
