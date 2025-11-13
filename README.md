This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Admin Panel
ADMIN_PASSWORD=your-secure-password-here

# Contact Form (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
CONTACT_EMAIL=your-email@example.com
RESEND_FROM_EMAIL=noreply@yourdomain.com

# GitHub (for Vercel deployments)
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
```

## Admin Panel

The site includes an admin panel for managing content. To access it:

1. Set the `ADMIN_PASSWORD` environment variable in `.env.local`
2. Navigate to `/admin/login` and enter your password.
3. Once logged in, you can:
   - Delete images from the homepage gallery
   - Edit artist names, biographies, and specialties
   - View all works and artists

**Note:** Change the default password (`admin123`) in production! Set the `ADMIN_PASSWORD` environment variable to a secure password.

## Contact Form

The contact form uses [Resend](https://resend.com) for sending emails. To enable email functionality:

1. Sign up for a free Resend account at https://resend.com
2. Get your API key from the Resend dashboard
3. Add `RESEND_API_KEY` to your `.env.local` file
4. Set `CONTACT_EMAIL` to the email address where you want to receive contact form submissions
5. (Optional) Set `RESEND_FROM_EMAIL` to your verified domain email (defaults to `onboarding@resend.dev`)

**Note:** Without `RESEND_API_KEY`, the contact form will still work but emails won't be sent (submissions will be logged to console).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
