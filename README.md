# MyDogeMask Integration Example

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API

```typescript
const mydogemask = (window as any).doge;

// Connect to your website
const result = await mydogemask.connect();
console.log("connection result", result);
// { "approved": true, "address": "DBKwBLEDY96jBtx1xCmjfBzp9FrNCWxnmM" }
```
