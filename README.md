# MyDogeMask Integration Example

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Install MyDogeMask from the [chrome store]() or [from source](https://github.com/mydoge-com/mydogemask).

2. Run the development server:

   ```bash
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to run the demo.

## JavaScript API

```typescript
const mydogemask = (window as any).doge;

// Check the extension is installed
if (mydogemask?.isMyDogeMask) {
  try {
    // Each api request supports both promise and callback patterns

    // Connect to your website
    const connectRes = await mydogemask.connect(/*onSuccess, onError*/);
    console.log('connect result', connectRes);
    // { "approved": true, "address": "DBKwBLEDY96jBtx1xCmjfBzp9FrNCWxnmM", "balance": "4206912345678" }

    // Request connected address balance
    const balanceRes = await mydogemask.getBalance(/*onSuccess, onError*/);
    console.log('balance result', balanceRes);
    // { "address": "DBKwBLEDY96jBtx1xCmjfBzp9FrNCWxnmM", "balance": "4206912345678" }

    // Generates a transaction popup, to be confirmed by the user
    const txReqRes = await mydogemask.requestTransaction(
      {
        recipientAddress: 'DAHkCF5LajV6jYyi5o4eMvtpqXRcm9eZYq',
        dogeAmount: 4.2,
      }
      // onSuccess,
      // onError
    );
    console.log('request transaction result', txReqRes);
    // { "txId": "b9fc04f226b194684fe24c786be89cae26abf8fcebbf90ff7049d5bc7fa003f0" }

    // Disconnect the currently connected address
    const disconnectRes = await mydogemask.disconnect(/*onSuccess, onError*/);
    console.log('disconnect result', disconnectRes);
    // { "disconnected": true }
  } catch (e) {
    console.error(e);
  }
}
```
