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

## Testing

For Playwright or CI flows that need an authenticated browser session, call the login endpoint, write the returned `token` and `user` into `localStorage`, and set `window.__TEST_INJECT_AUTH = true` before navigating to protected routes.

Example:

```ts
await page.addInitScript({
	script: `window.__TEST_INJECT_AUTH = true; localStorage.setItem('token', ${JSON.stringify(token)}); localStorage.setItem('user', ${JSON.stringify(JSON.stringify(user))});`,
});
await page.goto('http://localhost:3000/company/statistics');
```

The app's auth context reads `localStorage` on mount and, when that flag is present, synchronizes auth state during the first render cycle. That avoids redirect races in automated tests. You can still use the login form normally for manual testing.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
