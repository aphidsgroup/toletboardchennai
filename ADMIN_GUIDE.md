# Admin User Guide - Tolet Board Chennai CMS

Welcome to the Tolet Board Chennai CMS! This guide will help you manage your property listings effectively.

## Table of Contents
1. [Logging In](#logging-in)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Properties](#managing-properties)
4. [Site Settings](#site-settings)
5. [Best Practices](#best-practices)

## Logging In

1. Navigate to http://localhost:3000/admin/login (or your production URL + /admin/login)
2. Enter your credentials:
   - **Email**: admin@toletboardchennai.com
   - **Password**: (your admin password)
3. Click "Login"

You'll be redirected to the dashboard upon successful login.

## Dashboard Overview

The dashboard provides a quick overview of your property listings:

- **Total Properties**: All properties in the system
- **Published**: Properties visible on the public site
- **Rent**: Published rent properties
- **Lease**: Published lease properties

### Quick Actions
- **Add New Property**: Create a new property listing
- **View All Properties**: See and manage all properties
- **Site Settings**: Configure global site settings

### Recent Properties
View your 5 most recently created properties with quick access to edit them.

## Managing Properties

### Viewing All Properties

1. Click "Properties" in the navigation or "View All Properties" on the dashboard
2. You'll see a table with all your properties
3. Use the search bar to find specific properties by title or area

### Creating a New Property

1. Click "+ Add Property" button
2. Fill in the required fields:

   **Basic Information**
   - **Title**: Property name (e.g., "3BHK Premium Apartment in OMR")
   - **Slug**: URL-friendly identifier (auto-generated from title)
   - **Deal Type**: Rent or Lease
   - **Usage Type**: Residential or Commercial
   - **Property Subtype**: e.g., Apartment, Villa, Office
   - **Area**: Location area (e.g., OMR, ECR, Velachery)

   **Pricing & Size**
   - **Price**: Monthly rent/lease amount in INR
   - **Size**: Property size in square feet
   - **Bedrooms**: Number of bedrooms (optional for commercial)
   - **Bathrooms**: Number of bathrooms
   - **Parking**: Parking details (e.g., "2 covered, 1 open")

   **360° Virtual Tour**
   - **Embed URL**: Paste the iframe URL for the 360° tour
     - For YouTube: Use the embed URL (e.g., `https://www.youtube.com/embed/VIDEO_ID`)
     - For other platforms: Use their embed/iframe URL
   - **Preview**: The tour will preview automatically below the URL field

   **Amenities**
   - Click on amenities to select/deselect them
   - Available amenities are configured in Settings

   **Publishing**
   - **Publish this property**: Check to make it visible on the public site
   - **Feature on homepage**: Check to show it as a featured property

3. Click "Create Property"

### Editing a Property

1. Go to Properties list
2. Click "Edit" next to the property you want to modify
3. Update any fields as needed
4. Use the action buttons:
   - **Preview**: View the property on the public site
   - **Copy Link**: Copy the public URL to clipboard
   - **Delete**: Remove the property (requires confirmation)
5. Click "Update Property" to save changes

### Publishing/Unpublishing

You can quickly toggle a property's published status from the properties list:
- Click the status badge (Published/Draft) to toggle
- Published properties appear on the public site immediately
- Unpublished properties are only visible in the CMS

### Deleting a Property

1. Click "Delete" on the property (either in the list or edit page)
2. Confirm the deletion
3. The property will be permanently removed

**Warning**: Deletion cannot be undone!

## Site Settings

Access Settings from the navigation menu to configure global site options.

### Brand Settings
- **Brand Name**: Your company name (appears on homepage and throughout the site)
- **Tagline**: Short description (e.g., "360° Tours • Rent & Lease • Chennai")
- **Default City**: Default city for properties (usually Chennai)

### Contact Settings
- **WhatsApp Number**: Include country code (e.g., +919876543210)
- **Phone Number**: Contact phone number
- **WhatsApp Message Template**: 
  - Use `{propertyTitle}` to insert the property name
  - Use `{propertyUrl}` to insert the property link
  - Example: "Hi, I'm interested in {propertyTitle}. Link: {propertyUrl}"

### Amenities Vocabulary
- **Add New Amenity**: Type the name and click "Add"
- **Remove Amenity**: Click the X next to an amenity
- These amenities will be available when creating/editing properties

**Note**: After updating settings, click "Save Settings" at the bottom.

## Best Practices

### Property Titles
- Be descriptive and specific
- Include key details: BHK, property type, location
- Examples:
  - ✅ "3BHK Premium Apartment in OMR"
  - ✅ "Commercial Office Space in Adyar"
  - ❌ "Nice Property"
  - ❌ "For Rent"

### 360° Tour URLs
- Always test the embed URL before saving
- Use the preview feature to verify it loads correctly
- Supported platforms:
  - YouTube (use embed URL, not watch URL)
  - Matterport
  - Kuula
  - Any platform that provides an iframe embed code

### Pricing
- Enter monthly amounts only
- Be consistent with pricing across similar properties
- Update prices regularly to reflect market rates

### Amenities
- Select all applicable amenities
- Be honest about what's available
- Add new amenities to the vocabulary as needed

### Publishing Strategy
- **Draft**: Create and perfect the listing before publishing
- **Published**: Make it visible to the public
- **Featured**: Highlight your best or newest properties on the homepage
  - Limit featured properties to 2-3 for best impact

### Regular Maintenance
- Review and update property listings monthly
- Remove or unpublish properties that are no longer available
- Keep contact information current in Settings
- Add new amenities as they become relevant

## Tips for Success

1. **Use High-Quality 360° Tours**: The virtual tour is the main attraction
2. **Complete All Fields**: More information helps potential clients
3. **Update Regularly**: Keep listings fresh and accurate
4. **Monitor Inquiries**: Respond quickly to WhatsApp and phone contacts
5. **Feature Strategically**: Rotate featured properties to showcase variety

## Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save (when editing a property)
- **Esc**: Close filter sheets and modals

## Troubleshooting

### "Property not found" error
- The property may have been deleted
- Check the URL and try again

### Embed preview not showing
- Verify the embed URL is correct
- Some platforms require specific embed formats
- Try the URL in an incognito window

### Changes not appearing on public site
- Make sure the property is published
- Try refreshing the public site page
- Clear your browser cache if needed

## Need Help?

If you encounter any issues or have questions:
1. Check this guide first
2. Try logging out and back in
3. Contact your technical support team

---

Happy listing! 🏠
