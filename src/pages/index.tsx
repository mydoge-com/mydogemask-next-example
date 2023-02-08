import Head from 'next/head';
import Image from 'next/image';
import sb from 'satoshi-bitcoin';
import { Inter } from '@next/font/google';
import styles from '@/styles/Home.module.css';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useInterval } from '../hooks/useInterval';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [btnText, setBtnText] = useState('Connect');
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState(false);
  const [balance, setBalance] = useState(0);
  const [txId, setTxId] = useState('');
  const [myDogeMask, setMyDogeMask] = useState<any>();

  useEffect(() => {
    function onInit() {
      const { doge } = window as any;
      setMyDogeMask(doge);
      window.removeEventListener('doge#initialized', onInit);
    }
    window.addEventListener('doge#initialized', onInit, { once: true });
  }, []);

  const onConnect = useCallback(async () => {
    if (!myDogeMask?.isMyDogeMask) {
      alert(`MyDogeMask not installed!`);
      return;
    }

    try {
      if (connected) {
        const disconnectRes = await myDogeMask.disconnect();
        console.log('disconnect result', disconnectRes);
        if (disconnectRes.disconnected) {
          setConnected(false);
          setAddress(false);
          setBtnText('Connect');
        }
        return;
      }

      const connectRes = await myDogeMask.connect();
      console.log('connect result', connectRes);
      if (connectRes.approved) {
        setConnected(true);
        setAddress(connectRes.address);
        setBtnText('Disconnect');

        const balanceRes = await myDogeMask.getBalance();
        console.log('balance result', balanceRes);
        setBalance(sb.toBitcoin(balanceRes.balance));
      }
    } catch (e) {
      console.error(e);
    }
  }, [connected, myDogeMask]);

  const checkConnection = useCallback(async () => {
    if (connected) {
      const connectionStatusRes = await myDogeMask
        .getConnectionStatus()
        .catch(console.error);
      console.log('connection status result', connectionStatusRes);

      if (!connectionStatusRes?.connected) {
        setConnected(false);
        setAddress(false);
        setBtnText('Connect');
      }
    }
  }, [connected, myDogeMask]);

  useInterval(checkConnection, 5000, false);

  const onTip = useCallback(async () => {
    if (!myDogeMask?.isMyDogeMask) {
      alert(`MyDogeMask not installed!`);
      return;
    }

    if (!connected) {
      alert(`MyDogeMask not connected!`);
      return;
    }

    try {
      const txReqRes = await myDogeMask.requestTransaction({
        recipientAddress: 'DAHkCF5LajV6jYyi5o4eMvtpqXRcm9eZYq',
        dogeAmount: 4.2,
      });
      console.log('request transaction result', txReqRes);
      setTxId(txReqRes.txId);
    } catch (e) {
      console.error(e);
    }
  }, [connected, myDogeMask]);

  const txStatus = useCallback(async () => {
    if (txId) {
      const txStatusRes = await myDogeMask.getTransactionStatus({
        txId,
      });
      console.log('transaction status result', txStatusRes);
      // Once confirmed, stop polling and update balance
      if (txStatusRes.status === 'confirmed' && txStatusRes.confirmations > 1) {
        const balanceRes = await myDogeMask.getBalance();
        console.log('balance result', balanceRes);
        setBalance(sb.toBitcoin(balanceRes.balance));
        setTxId('');
      }
    }
  }, [myDogeMask, txId]);

  useInterval(txStatus, 10000, false);

  return (
    <>
      <Head>
        <title>MyDogeMask</title>
        <meta name='description' content='Sample integration' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <div>
            <a
              href='https://github.com/mydoge-com/myDogeMask'
              target='_blank'
              rel='noopener noreferrer'
            >
              Checkout MyDogeMask
              <Image
                src='/github.svg'
                alt='GitHub Logo'
                width={25}
                height={25}
                priority
              />
            </a>
          </div>
        </div>

        <div className={styles.center}>
          <button onClick={onConnect}>{btnText}</button>
        </div>
        {connected && <div className={styles.address}>Address: {address}</div>}
        {connected && <div className={styles.balance}>Balance: {balance}</div>}
        {connected && (
          <div className={styles.center}>
            <button onClick={onTip}>Tip MyDogeOfficial 4.20</button>
          </div>
        )}
      </main>
    </>
  );
}
