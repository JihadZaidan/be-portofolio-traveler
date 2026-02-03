# PHPMyAdmin Blog Database Setup Guide

## 🚀 Quick Setup Instructions

### Method 1: Copy & Paste (Recommended)

1. **Open PHPMyAdmin**
   - Go to `http://localhost/phpmyadmin` in your browser
   - Login with your MySQL credentials

2. **Create Database**
   - Click on "New" in the left sidebar
   - Database name: `travello_blog`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

3. **Run SQL Script**
   - Select the `travello_blog` database
   - Click on the "SQL" tab
   - Copy the entire content from `blog-setup-simple.sql`
   - Paste it in the SQL textarea
   - Click "Go"

4. **Verify Setup**
   - You should see success messages
   - Check that tables were created: `blog_articles`, `blog_authors`, `blog_categories`
   - Verify sample data exists

### Method 2: Import File

1. **Create Database** (same as steps 1-2 above)

2. **Import SQL File**
   - Select the `travello_blog` database
   - Click on the "Import" tab
   - Choose file: `blog-crud.sql` (full version) or `blog-setup-simple.sql` (simple version)
   - Click "Go"

## 📊 Database Structure

### Tables Created:

1. **blog_articles** - Main articles table
   - id, title, slug, cover, category, content
   - status (publish/draft), author_id, excerpt
   - meta_title, meta_description, view_count
   - created_at, updated_at, published_at

2. **blog_authors** - Author management
   - id, name, email, bio, avatar
   - created_at, updated_at

3. **blog_categories** - Category management
   - id, name, slug, description, color
   - created_at

### Sample Data Included:
- 2 authors (Admin Travello, Rizqi Maulana)
- 5 categories (Travel, Tips, Story, Food, Lifestyle)
- 3 sample articles with full content

## 🔗 API Integration

Once database is set up, the following API endpoints will work:

### Admin Endpoints:
- `GET /api/admin/blog/articles` - Get all articles
- `POST /api/admin/blog/articles` - Create article
- `PUT /api/admin/blog/articles/:id` - Update article
- `DELETE /api/admin/blog/articles/:id` - Delete article

### Frontend Endpoints:
- `GET /api/blog/articles` - Get published articles
- `GET /api/blog/articles/slug/:slug` - Get article by slug
- `GET /api/blog/categories` - Get categories

## 🚀 Testing the Setup

1. **Start Backend Server**
   ```bash
   cd be-travello/src
   node app-simple-fixed.js
   ```

2. **Start Frontend Server**
   ```bash
   cd fe-travello
   npm run dev
   ```

3. **Test Admin Panel**
   - Go to `http://localhost:5173/admin/blog`
   - Create, edit, delete articles
   - Check if they appear on frontend

4. **Test Frontend Blog**
   - Go to `http://localhost:5173/blog`
   - View published articles
   - Check categories and filtering

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Ensure MySQL/XAMPP is running
   - Check database name: `travello_blog`
   - Verify credentials in backend config

2. **Table Not Found**
   - Run the SQL script again
   - Check if database was selected before running script

3. **API Not Working**
   - Ensure backend server is running on port 5000
   - Check console for database connection errors
   - Verify API endpoints are correctly registered

4. **Frontend Not Loading**
   - Ensure frontend server is running on port 5173
   - Check browser console for API errors
   - Verify API base URL is correct

### Manual Verification:

```sql
-- Check if database exists
SHOW DATABASES LIKE 'travello_blog';

-- Check tables
USE travello_blog;
SHOW TABLES;

-- Check sample data
SELECT COUNT(*) as article_count FROM blog_articles;
SELECT COUNT(*) as author_count FROM blog_authors;
SELECT COUNT(*) as category_count FROM blog_categories;

-- Check published articles
SELECT title, category, status FROM blog_articles WHERE status = 'publish';
```

## ✅ Success Indicators

If setup is successful, you should see:
- ✅ Database `travello_blog` created
- ✅ 3 tables created
- ✅ Sample data inserted
- ✅ Admin panel loads articles from database
- ✅ Frontend blog displays published articles
- ✅ Create/Edit/Delete operations work

## 📞 Support

If you encounter issues:
1. Check the console logs in browser
2. Verify backend server logs
3. Ensure database permissions are correct
4. Test API endpoints directly in browser or Postman

The blog system is now ready for full CRUD operations! 🎉
