# iCloud Contact Entry Helper

This is a simple web app to make bulk contact entry easier, especially for iPhone/iCloud users. The tool allows you to quickly input multiple contacts and export them in the iCloud-compatible `.vcf` format.

## Features
- Add contact details:
  - First Name
  - Last Name
  - Company
  - Phone 1 (Mobile)
  - Phone 2 (Home)
  - Email
  - Address
- View added contacts in a table
- Export all contacts to a `.vcf` file (compatible with iCloud)
- Bulk delete all entries

## Usage
1. Open the `index.html` file in your browser.
2. Fill out the form and click "Add Contact".
3. Repeat for multiple contacts.
4. Click "Export to VCF" to download the `.vcf` file.
5. Go to [iCloud Contacts](https://www.icloud.com/contacts/) and use the **Import vCard** option.

## Notes
- This app stores no data locally. Refreshing the page will erase all entered data.
- Make sure to use the exported `.vcf` file directly on iCloud; it's formatted to be compatible with iOS contact imports.

## License
MIT
