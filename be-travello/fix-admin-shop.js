const fs = require('fs');

// Read the current file
const filePath = '../fe-travello/src/pages/admin/shop/AdminShopPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the broken handleSubmit function
const oldFunction = `  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const productData = {
        title: String(data.title ?? ""),
        description: String(data.title ?? ""), // Using title as description for now
        image_src: normalizeImageValue(data.imageSrc),
        price: parseFloat(String(data.price ?? "0").replace(/[^0-9.]/g, "")),
    }

    const result = await response.json();
    console.log(' Product saved successfully:', result);`;

const newFunction = `  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const productData = {
        title: String(data.title ?? ""),
        description: String(data.title ?? ""), // Using title as description for now
        image_src: normalizeImageValue(data.imageSrc),
        price: parseFloat(String(data.price ?? "0").replace(/[^0-9.]/g, "")),
        delivery_time: String(data.deliveryTime ?? "2 Days Delivery"),
        service_category: String(data.serviceCategory ?? ""),
        status: String(data.status ?? "active") === "inactive" ? "inactive" : "active",
      };

      console.log('📝 Submitting product data:', productData);

      let response;
      if (editingItem) {
        // Update existing product
        console.log('🔄 Updating product ID:', editingItem.id);
        response = await fetch(\`http://localhost:5000/api/shops/\${editingItem.id}\`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      } else {
        // Create new product
        console.log('➕ Creating new product');
        response = await fetch('http://localhost:5000/api/shops', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || \`HTTP \${response.status}: \${response.statusText}\`);
      }

      const result = await response.json();
      console.log('✅ Product saved successfully:', result);

      // Refresh products list
      await fetchProducts();

      setIsModalOpen(false);
      setEditingId(null);

      toast.success(
        "Success",
        editingItem ? "Product updated successfully" : "Product added successfully"
      );
    } catch (error) {
      console.error('❌ Error saving product:', error);
      toast.error("Error", \`Failed to save product: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  };`;

// Replace the broken function
content = content.replace(oldFunction, newFunction);

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ AdminShopPage.tsx has been fixed!');
