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
const connectReq = await mydogemask.connect();
console.log("connection result", connectReq);
// { "approved": true, "address": "DBKwBLEDY96jBtx1xCmjfBzp9FrNCWxnmM", "balance": "4206912345678" }

// Request connected address balance
const balanceReq = await mydogemask.getBalance();
console.log("balance result", balanceReq);
// { "balance": "4206912345678" }
```
