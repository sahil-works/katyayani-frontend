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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Dockerized Staging Deployment

The storefront staging app follows the existing EC2 deployment pattern used by
admin staging:

- Next.js production build with `output: "standalone"`
- Docker container bound to localhost on the EC2 host
- Nginx reverse proxy terminates the public host and forwards to the container
- Cloudflare fronts the staging hostname

`NEXT_PUBLIC_*` variables are build-time variables in Next.js. They are embedded
into browser bundles during `next build`, so changing them requires rebuilding
and redeploying the Docker image. Do not rely on runtime-only environment
changes for client-side values.

Build the staging image:

```bash
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=https://staging.katyayanidesignerhub.com \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://staging-api.katyayanidesignerhub.com/api \
  --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID=TEST_KEY \
  -t katyayani-storefront:staging .
```

Run it on EC2:

```bash
docker run -d \
  --name katyayani-storefront \
  --restart unless-stopped \
  -p 127.0.0.1:3200:3000 \
  katyayani-storefront:staging
```

Nginx should proxy the staging storefront hostname to `http://127.0.0.1:3200`
and pass the usual reverse proxy headers:

```nginx
location / {
  proxy_pass http://127.0.0.1:3200;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

Validate the container and proxy with:

```bash
curl http://127.0.0.1:3200/api/health
curl https://staging.katyayanidesignerhub.com/api/health
```

Cloudflare should keep SSL enabled for the staging hostname and proxy traffic to
Nginx. Razorpay checkout injects scripts dynamically, so this app intentionally
does not define a CSP header yet.

TSTING
