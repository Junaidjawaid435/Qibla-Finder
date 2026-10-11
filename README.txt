QIBLA FINDER — READY-TO-UPLOAD WEBSITE
=====================================

FILES
- index.html        Main responsive website
- styles.css        Design and responsive layout
- app.js            Qibla bearing, GPS, manual search, device compass
- privacy.html      Starter privacy policy (edit owner contact details)
- contact.html      Contact page (replace placeholder email)
- assets/favicon.svg Site icon

HOW TO TEST LOCALLY
1. Extract the ZIP.
2. Open the folder in Visual Studio Code.
3. Use the Live Server extension, or run a local HTTP server.
   Example with Python installed: python -m http.server 8000
4. Open http://localhost:8000
Note: some phone features require HTTPS. Localhost is treated as a secure context by modern browsers.

HOW TO UPLOAD TO HOSTINGER
1. Buy a domain and hosting, then connect the domain to the hosting.
2. Open hPanel > Websites > Manage > File Manager.
3. Open public_html.
4. Upload the ZIP and extract it directly into public_html.
5. Ensure index.html is directly inside public_html (not only inside a nested folder).
6. Enable SSL/HTTPS for your domain and force HTTPS.
7. Open your website and test GPS permission and manual search on a phone.

HOW IT WORKS
- Uses the Kaaba coordinates 21.422487 N, 39.826206 E.
- Calculates the initial great-circle bearing from the chosen coordinates to the Kaaba.
- GPS access is requested only when the visitor clicks the location button.
- Manual location search uses OpenStreetMap Nominatim. An internet connection is required.
- Device orientation is optional and browser/device support varies. Numeric bearing works without a compass sensor.

IMPORTANT BEFORE PUBLISHING
- Replace [Add your email address here] in contact.html and [your contact email] in privacy.html.
- Review the privacy policy for any analytics/advertising services you add later.
- If adding Google AdSense, apply only after adding useful original content and ensuring all policies and site details are complete. Approval is not guaranteed.
- Do not promise survey-grade compass accuracy. Phone sensors can be affected by calibration and magnetic interference.
- Google Fonts and manual search require internet access. Consider self-hosting fonts if you want to avoid the external font request.
- Nominatim is a public service with usage rules; do not use it for heavy traffic or bulk geocoding. For high traffic, use a compliant provider or your own geocoding service.

This is a static website; it does not need a database or PHP backend.
