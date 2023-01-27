import Head from 'next/head';
import Image from 'next/image';
import sb from 'satoshi-bitcoin';
import { Inter } from '@next/font/google';
import styles from '@/styles/Home.module.css';
import { useCallback, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [btnText, setBtnText] = useState('Connect');
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(0);

  const onConnect = useCallback(async () => {
    const mydogemask = (window as any).doge;

    if (!mydogemask?.isMyDogeMask) {
      alert(`MyDogeMask not installed!`);
      return;
    }

    if (connected) {
      alert(`MyDogeMask already connected!`);
      return;
    }

    try {
      const connectRes = await mydogemask.connect();
      console.log('connect result', connectRes);
      if (connectRes.approved) {
        setConnected(true);
        setBtnText(connectRes.address);

        const balanceRes = await mydogemask.getBalance();
        console.log('balance result', balanceRes);
        setBalance(sb.toBitcoin(balanceRes.balance));
      }
    } catch (e) {
      console.error(e);
    }
  }, [connected, setBalance, setBtnText, setConnected]);

  const onTip = useCallback(async () => {
    const mydogemask = (window as any).doge;

    if (!mydogemask?.isMyDogeMask) {
      alert(`MyDogeMask not installed!`);
      return;
    }

    if (!connected) {
      alert(`MyDogeMask not connected!`);
      return;
    }

    try {
      const txReqRes = await mydogemask.requestTransaction({
        recipientAddress: 'DAHkCF5LajV6jYyi5o4eMvtpqXRcm9eZYq',
        dogeAmount: 4.2,
      });
      console.log('request transaction result', txReqRes);
    } catch (e) {
      console.error(e);
    }
  }, [connected]);

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
              href='https://github.com/mydoge-com/mydogemask'
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
        {connected && (
          <div className={styles.description}>Balance: {balance}</div>
        )}
        {connected && (
          <div className={styles.center}>
            <button onClick={onTip}>Tip MyDogeOfficial 4.20</button>
          </div>
        )}
      </main>
    </>
  );
}
