# GENEJELLY — DEPLOYMENT GUIDE

# 🚀 GENEJELLY Deployment Guide

This guide explains how to deploy the GENEJELLY website using GitHub Pages.

# 📌 Prerequisites

Before deployment ensure:

- GitHub account is created
- Repository is uploaded
- Project files are pushed to GitHub

Repository:

https://github.com/sm4006/DNA-DATA-STORAGE

# 📂 Recommended Repository Structure

```bash
DNA-DATA-STORAGE/
│
├── index.html
├── style.css
├── script.js
├── assets/
├── images/
└── README.md
````



# ⚙️ Step 1 — Push Project to GitHub

## Initialize Git

```bash
git init
```

---

## Add Files

```bash
git add .
```

---

## Commit Files

```bash
git commit -m "Initial commit"
```

---

## Connect GitHub Repository

```bash
git remote add origin https://github.com/sm4006/DNA-DATA-STORAGE.git
```

---

## Push to GitHub

```bash
git push -u origin main
```

# 🌐 Step 2 — Enable GitHub Pages

1. Open the repository
2. Go to:

Settings → Pages

3. Under:

"Build and deployment"

Select:

* Source → Deploy from a branch
* Branch → main
* Folder → /root

4. Save changes

# 🚀 Step 3 — Access Live Website

GitHub Pages will generate a live URL:

```txt
https://sm4006.github.io/DNA-DATA-STORAGE/
```

Deployment may take a few minutes.

# 🔄 Updating the Website

Whenever changes are made:

```bash
git add .
git commit -m "Updated website"
git push
```

GitHub Pages automatically redeploys the site.

# 🛠️ Common Deployment Issues

## ❌ CSS Not Loading

Ensure paths are correct:

```html
<link rel="stylesheet" href="style.css">
```

Avoid local file paths.

## ❌ Images Not Appearing

Use relative paths:

```html
<img src="images/example.png">
```

## ❌ JavaScript Not Working

Ensure:

```html
<script src="script.js"></script>
```

is placed before:

```html
</body>
```

# 📱 Responsive Testing

Before deployment test:

* Desktop
* Tablet
* Mobile devices
* Firefox
* Chrome
* Edge
# ✨ Recommended Improvements

Future deployment improvements:

* Custom domain
* Analytics integration
* SEO optimization
* Performance optimization
* Progressive Web App support

# 📌 Final Notes

GENEJELLY is designed as a futuristic educational biotechnology visualization platform combining molecular data storage concepts with modern web technologies.
