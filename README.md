# MyDogeMask Integration Example

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Install MyDogeMask from the [chrome store]() or [from source](https://github.com/mydoge-com/myDogeMask).

2. Run the development server:

   ```bash
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to run the demo.

## JavaScript API

```typescript
let myDogeMask = null;

// Listen to the window event which ensures the extension script is injected
window.addEventListener(
  'doge#initialized',
  () => {
    myDogeMask = (window as any).doge;
  },
  { once: true }
);

// Check the extension interface is set and is MyDogeMask
if (myDogeMask?.isMyDogeMask) {
  try {
    // Each api request supports both promise and callback patterns

    // Connect to your website
    const connectRes = await myDogeMask.connect(/*onSuccess, onError*/);
    console.log('connect result', connectRes);
    /*{
        "approved": true,
        "address": "DBKwBLEDY96jBtx1xCmjfBzp9FrNCWxnmM",
        "balance": "4206912345678"
      }*/

    // Request connected address balance
    const balanceRes = await myDogeMask.getBalance(/*onSuccess, onError*/);
    console.log('balance result', balanceRes);
    // { "address": "DBKwBLEDY96jBtx1xCmjfBzp9FrNCWxnmM", "balance": "4206912345678" }

    // Generates a transaction popup, to be confirmed by the user
    const txReqRes = await myDogeMask.requestTransaction(
      {
        recipientAddress: 'DAHkCF5LajV6jYyi5o4eMvtpqXRcm9eZYq',
        dogeAmount: 4.2,
      }
      // onSuccess,
      // onError
    );
    console.log('request transaction result', txReqRes);
    // { "txId": "b9fc04f226b194684fe24c786be89cae26abf8fcebbf90ff7049d5bc7fa003f0" }

    // Poll to get the transaction status
    setInterval(async () => {
      const txStatusRes = await myDogeMask.getTransactionStatus({
        txId: txReqRes.txId,
      });
      console.log('transaction status result', txStatusRes);
      /*{
          "txId": "b9fc04f226b194684fe24c786be89cae26abf8fcebbf90ff7049d5bc7fa003f0",
          "confirmations": 0,
          "dogeAmount": "420000000",
          "blockTime": 1675217503,
          "status": "pending"
        }*/
    }, 10000);

    // Poll to check if the user has disconnected from the extension
    // Note: this method will throw an error if the user has disconnected
    // Handle disconnect by catching the rejected promise or within onError callback
    setInterval(async () => {
      const connectionStatusRes = await myDogeMask
        .getConnectionStatus(/*onSuccess, onError*/)
        .catch(console.error);
      console.log('connection status result', connectionStatusRes);
      // { "connected": true, "address": "DBKwBLEDY96jBtx1xCmjfBzp9FrNCWxnmM" }
    }, 10000);

    // Disconnect the connected address manually
    const disconnectRes = await myDogeMask.disconnect(/*onSuccess, onError*/);
    console.log('disconnect result', disconnectRes);
    // { "disconnected": true }
  } catch (e) {
    console.error(e);
  }
}
```
