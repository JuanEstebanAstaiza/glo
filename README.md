# Glo: The Artisan Nail Suite

[cloudflarebutton]

Glo is a modern, visually stunning SaaS platform designed exclusively for manicurists. It empowers nail artisans to manage their entire business from a single, intuitive dashboard. The application is built with three primary user roles in mind: the Manicurist, their Client, and a Super Admin.

The entire experience is designed to be elegant, seamless, and beautiful to use, providing a comprehensive solution for independent nail professionals to streamline their operations and enhance client relationships.

## ✨ Key Features

*   **Manicurist Dashboard**: Manage your personal profile, create a custom catalog of services (with names, descriptions, durations, and prices), and control your availability with an interactive calendar.
*   **Client Portal**: A dedicated space for clients to register, find their preferred manicurist, browse services, book appointments from real-time availability, and track their loyalty progress.
*   **Loyalty & Rewards**: Create custom incentives and loyalty programs, such as offering a free service after a certain number of appointments, to retain clients.
*   **Super Admin Panel**: A global dashboard for administrators to manage all registered manicurists, handle SaaS subscriptions, toggle account statuses, and view system-wide analytics.
*   **Multi-Currency & Multi-Language**: Full support for multiple currencies and languages (Spanish, English, German, French) to cater to a global user base.
*   **Fully Responsive**: A beautiful and functional experience across all devices, from desktops to mobile phones.

## 🚀 Technology Stack

*   **Frontend**: React, Vite, React Router, TypeScript
*   **Backend**: Cloudflare Workers, Hono
*   **Styling**: Tailwind CSS, shadcn/ui
*   **State Management**: Zustand
*   **Animations**: Framer Motion
*   **Database**: Cloudflare Durable Objects
*   **Tooling**: Bun, Wrangler CLI

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your machine:

*   [Bun](https://bun.sh/) (v1.0 or higher)
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (v3.0 or higher)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/glo_nail_saas.git
    cd glo_nail_saas
    ```

2.  **Install dependencies:**
    This project uses Bun as the package manager.
    ```bash
    bun install
    ```

## 🛠️ Development

To start the local development server, which includes both the frontend application and the local Cloudflare Worker, run the following command:

```bash
bun dev
```

This will start the Vite development server, typically on `http://localhost:3000`. The application will automatically reload when you make changes to the code. The backend API endpoints are available under the `/api/*` path.

## 📂 Project Structure

The codebase is organized into three main directories:

*   `src/`: Contains the frontend React application, including pages, components, hooks, and styles.
*   `worker/`: Contains the Hono-based Cloudflare Worker backend, including API routes and Durable Object entity definitions.
*   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and backend to ensure type safety.

## ☁️ Deployment

This application is designed for seamless deployment to the Cloudflare ecosystem.

1.  **Build the application:**
    First, build the frontend assets and worker script for production.
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    Use the Wrangler CLI to deploy the application. Make sure you are logged into your Cloudflare account (`wrangler login`).
    ```bash
    bun run deploy
    ```

This command will deploy your application to Cloudflare Pages and publish your Worker, making it available at your configured Cloudflare subdomain.

Alternatively, you can deploy directly from your GitHub repository with a single click:

[cloudflarebutton]

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.