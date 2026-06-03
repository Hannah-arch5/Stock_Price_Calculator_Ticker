# Stock_Price_Calculator

A sleek, premium macOS desktop application built with Electron, designed to quickly calculate stock target prices based on intrinsic values. 

## Features
- **Intrinsic Value Calculation**: Calculates target stock prices based on earnings growth, P/E ratio, and required rates of return.
- **Calculation History**: Automatically logs your past calculations in a scrolling history panel on the right.
- **Premium macOS Design**: 
  - Floating, perfectly sized compact window.
  - Light theme with beautiful typography and clean borders.
  - Custom Apple-style minimalist flat app icon.

## Tech Stack
- **Electron**: For cross-platform desktop application packaging.
- **Vanilla web technologies**: HTML, CSS, JavaScript (No heavy frontend frameworks).

## How to Run Locally
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```

## Build
To build the macOS `.app` bundle:
```bash
npm run build
```
The packaged application will be available in the `dist/mac-arm64/` directory.

## Design Conventions
- **Naming**: Projects follow the Capitalized with Underscores format (e.g. `Stock_Price_Calculator`).
- **Icons**: Icons use a 15% transparent padding for perfect alignment with macOS native apps.
