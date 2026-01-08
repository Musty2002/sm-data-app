# SM Data App

A modern mobile-first web application for affordable data, airtime, and bill payments in Nigeria.

## Overview

SM Data App provides a seamless platform for Nigerians to purchase data bundles, airtime, pay electricity bills, and manage TV subscriptions at competitive rates. Built with a focus on user experience, security, and reliability.

## Features

- **Data Bundles** - Affordable data packages for MTN, Airtel, Glo, and 9Mobile
- **Airtime Top-up** - Instant airtime recharge for all Nigerian networks
- **Electricity Bills** - Pay NEPA/electricity bills for all distribution companies
- **TV Subscriptions** - Renew DStv, GOtv, and Startimes subscriptions
- **Money Transfer** - Send money to any Nigerian bank account
- **Referral Program** - Earn rewards by referring friends and family
- **Wallet System** - Secure digital wallet for quick transactions

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **State Management**: TanStack Query
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/sm-data-app.git
cd sm-data-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── assets/          # Images and static assets
├── components/      # Reusable UI components
│   ├── dashboard/   # Dashboard-specific components
│   ├── layout/      # Layout components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── integrations/    # Third-party integrations
├── lib/             # Utility functions
├── pages/           # Page components
└── types/           # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Contact

- **Email**: support@smdataapp.com
- **Phone**: 09026486913

---

© 2024 SM Data App. All rights reserved.
