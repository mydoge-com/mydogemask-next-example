import Head from 'next/head';
import Image from 'next/image';
import sb from 'satoshi-bitcoin';
import { Inter } from '@next/font/google';
import styles from '@/styles/Home.module.css';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useInterval } from '../hooks/useInterval';

const inter = Inter({ subsets: ['latin'] });
const MDO_ADDRESS = 'DAHkCF5LajV6jYyi5o4eMvtpqXRcm9eZYq';

export default function Home() {
  const [btnText, setBtnText] = useState('Connect');
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState(false);
  const [balance, setBalance] = useState(0);
  const [txId, setTxId] = useState('');
  const [doginalOutput, setDoginalOutput] = useState(
    'c788a88a04a649a5ba049ee7b23ce337a7304d1d0d37cc46108767095fb2d01a:0'
  );
  const [recipientAddress, setRecipientAddress] = useState(MDO_ADDRESS);
  const [drc20Ticker, setDrc20Ticker] = useState('');
  const [drc20Available, setDrc20Available] = useState('');
  const [drc20Transferable, setDrc20Transferable] = useState('');
  const [drc20Inscriptions, setDrc20Inscriptions] = useState<any[]>([]);
  const [drc20Amount, setDrc20Amount] = useState('');
  const [rawTx, setRawTx] = useState('');
  const [psbtIndexes, setPsbtIndexes] = useState([1, 2]);
  const [signMessage, setSignMessage] = useState('');
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

  const isConnected = useCallback(() => {
    if (!myDogeMask?.isMyDogeMask) {
      alert(`MyDogeMask not installed!`);
      return false;
    }

    if (!connected) {
      alert(`MyDogeMask not connected!`);
      return false;
    }

    return true;
  }, [connected, myDogeMask]);

  const onTip = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const txReqRes = await myDogeMask.requestTransaction({
        recipientAddress: MDO_ADDRESS,
        dogeAmount: 4.2,
      });
      console.log('request transaction result', txReqRes);
      setTxId(txReqRes.txId);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDogeMask]);

  const onSendDoginal = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const txReqRes = await myDogeMask.requestInscriptionTransaction({
        recipientAddress,
        output: doginalOutput,
      });
      console.log('request doginal transaction result', txReqRes);
      setTxId(txReqRes.txId);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDogeMask, recipientAddress, doginalOutput]);

  const onGetDRC20Balance = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const balanceReq = await myDogeMask.getDRC20Balance({
        ticker: drc20Ticker,
      });
      console.log('request drc-20 balance result', balanceReq);
      setDrc20Available(balanceReq.availableBalance);
      setDrc20Transferable(balanceReq.transferableBalance);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDogeMask, drc20Ticker]);

  const onGetDRC20Inscriptions = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const transferableReq = await myDogeMask.getTransferableDRC20({
        ticker: drc20Ticker,
      });
      console.log('request drc-20 transferable result', transferableReq);
      setDrc20Inscriptions(transferableReq.inscriptions);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDogeMask, drc20Ticker]);

  const onAvailableDRC20 = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const txReqRes = await myDogeMask.requestAvailableDRC20Transaction({
        ticker: drc20Ticker,
        amount: drc20Amount,
      });
      console.log('request available drc-20 transfer result', txReqRes);
      setTxId(txReqRes.txId);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDogeMask, drc20Ticker, drc20Amount]);

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

  const onSendPSBT = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const txReqRes = await myDogeMask.requestPsbt({
        rawTx,
        indexes: psbtIndexes,
      });
      console.log('request send psbt result', txReqRes);
      setTxId(txReqRes.txId);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDogeMask, psbtIndexes, rawTx]);

  const onSignMessage = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const signMsgReq = await myDogeMask.requestSignedMessage({
        message: signMessage,
      });
      console.log('request sign message result', signMsgReq);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDogeMask, signMessage]);

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
        <div className={styles.item}>
          <div>
            <a
              href='https://github.com/mydoge-com/myDogeMask'
              target='_blank'
              rel='noopener noreferrer'
            >
              Checkout MyDoge Wallet Browser Extension on GitHub
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
          <div className={styles.container}>
            <div className={styles.item}>Address: {address}</div>
            <div className={styles.item}>Balance: {balance}</div>

            <div className={styles.center}>
              <button onClick={onTip}>Tip MyDogeOfficial 4.20</button>
            </div>

            <div className={styles.center}>Doginal inscription output</div>
            <input
              type='text'
              style={{ width: '485px' }}
              value={doginalOutput}
              onChange={(text) => {
                setDoginalOutput(text.target.value);
              }}
            />
            <div className={styles.center}>
              Doginal/DRC-20 recipient address
            </div>
            <input
              type='text'
              style={{ width: '265px' }}
              value={recipientAddress}
              onChange={(text) => {
                setRecipientAddress(text.target.value);
              }}
            />
            <div className={styles.center}>
              <button onClick={onSendDoginal}>Send Doginal</button>
            </div>
            <div className={styles.center}>DRC-20 Ticker</div>
            <input
              type='text'
              style={{ width: '35px' }}
              value={drc20Ticker}
              onChange={(text) => {
                setDrc20Ticker(text.target.value);
              }}
            />
            <div className={styles.center}>
              <button onClick={onGetDRC20Balance}>Get DRC-20 Balance</button>
            </div>
            {drc20Available && (
              <div className={styles.item}>
                Available Balance: {drc20Available}
              </div>
            )}
            {drc20Transferable && (
              <div className={styles.item}>
                Transferable Balance: {drc20Transferable}
              </div>
            )}
            {drc20Available || drc20Transferable ? (
              <input
                type='text'
                className={styles.item}
                style={{ width: '100px' }}
                value={drc20Amount}
                onChange={(text) => {
                  setDrc20Amount(text.target.value);
                }}
              />
            ) : null}
            {drc20Available && drc20Available !== '0' && (
              <div className={styles.center}>
                <button onClick={() => onAvailableDRC20()}>
                  Make Transferable
                </button>
              </div>
            )}
            {drc20Transferable && drc20Transferable !== '0' && (
              <div className={styles.center}>
                <button onClick={() => onGetDRC20Inscriptions()}>
                  Get Transferable DRC-20
                </button>
              </div>
            )}
            {drc20Inscriptions.length > 0 &&
              (drc20Inscriptions as any[]).map((inscription) => (
                <div key={inscription.output}>
                  {inscription.output} {inscription.ticker} {inscription.amount}
                </div>
              ))}
            <div className={styles.item}>Sign PSBT</div>
            <div className={styles.item}>Raw TX</div>
            <input
              type='text'
              className={styles.item}
              style={{ width: '500px' }}
              value={rawTx}
              onChange={(text) => {
                setRawTx(text.target.value);
              }}
            />
            <div className={styles.item}>Input Indexes (csv)</div>
            <input
              type='text'
              className={styles.item}
              style={{ width: '150px' }}
              value={psbtIndexes.join(',')}
              onChange={(text) => {
                if (text?.target?.value) {
                  const indexes = text.target.value.split(',').map(Number);
                  setPsbtIndexes(indexes);
                }
              }}
            />
            <div className={styles.center}>
              <button onClick={() => onSendPSBT()}>Send PSBT</button>
            </div>
            <div className={styles.item}>Sign Message</div>
            <input
              type='text'
              className={styles.item}
              style={{ width: '500px' }}
              value={signMessage}
              onChange={(text) => {
                setSignMessage(text.target.value);
              }}
            />
            <div className={styles.center}>
              <button onClick={() => onSignMessage()}>Sign Message</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
