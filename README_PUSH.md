Preparation for push to GitHub

What's included:
- .gitignore to exclude node_modules, DB file and editor temp files
- Confirmed project structure:
  - index.html, cart.html, login.html
  - css/styles.css
  - js/script.js
  - server.js
  - db_init.js and food_chooser.db (DB file will be ignored)
  - package.json

Recommended steps to push:
1. Open terminal in project root.
2. Check status and add files:
   git add .
3. Commit:
   git commit -m "Prepare project for publish: add .gitignore, clean structure"
4. Add remote (if not exists):
   git remote add origin <your-repo-url>
5. Push:
   git push -u origin main

Notes:
- The database file `food_chooser.db` is ignored by .gitignore. If you want to include an initial DB, export schema or use db_init.js.
- Consider removing node_modules before pushing (it is ignored) and add a short README describing how to run the server.
