# JY Scrubs E-Commerce Platform

Welcome to the JY Scrubs e-commerce platform! This project is an online store for selling medical scrubs and providing medical consultation services (limited to Nigeria). The platform supports multi-currency pricing for scrubs, integrates with UPS for shipping, and offers customer support via email and phone.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [License](#license)

---

## Project Overview

**JY Scrubs** is a fully functional e-commerce platform that serves customers by selling scrubs and offering medical consultation services. The store operates globally for scrubs with prices displayed in the user’s local currency, and the consultation service is available exclusively for customers in Nigeria.

### Brand Information

- **Brand Name**: JY Scrubs
- **Brand Colors**: Blue, White, and Pink
- **Logo**: ![JY Scrubs Logo](./public/img/logo.png)


### Product Offerings

- **Scrubs**: Available for global customers, with prices adjusted to local currencies.
- **Medical Consultation**: Available only for Nigerian customers.

---

## Features

1. **Multi-Currency Pricing for Scrubs**:
   - Prices dynamically adjust based on the customer’s location and currency.
   - Support for multiple currencies via exchange rate APIs.

2. **Geo-Restricted Medical Consultations**:
   - Medical consultations are restricted to Nigerian users based on geo-location detection.

3. **Shipping via UPS**:
   - Integration with UPS for real-time shipping rates and tracking for global orders.

4. **Customer Support**:
   - Customers can contact support via email or phone for inquiries and assistance.

---

## Technology Stack

- **Backend Framework**: [Express.js](https://expressjs.com/)
- **Payment Gateway**: [Stripe](https://stripe.com/), [Flutterwave](https://www.flutterwave.com/) (for Nigeria)
- **Currency Conversion**: [currency-converter-lt](https://www.npmjs.com/package/currency-converter-lt)
- **Geo-Location Detection**: [geoip-lite](https://www.npmjs.com/package/geoip-lite)
- **Shipping Integration**: [UPS Shipping API](https://www.ups.com/upsdeveloperkit)
- **Authentication**: [Passport.js](http://www.passportjs.org/), [JWT](https://jwt.io/)
- **Email Support**: [Nodemailer](https://nodemailer.com/)

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/jy-scrubs.git
   cd jy-scrubs
