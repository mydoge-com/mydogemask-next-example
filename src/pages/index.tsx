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
  const [inscriptionLocation, setinscriptionLocation] = useState('');
  const [recipientAddress, setRecipientAddress] = useState(MDO_ADDRESS);
  const [drc20Ticker, setDrc20Ticker] = useState('');
  const [drc20Available, setDrc20Available] = useState('');
  const [drc20Transferable, setDrc20Transferable] = useState('');
  const [drc20Inscriptions, setDrc20Inscriptions] = useState<any[]>([]);
  const [drc20Amount, setDrc20Amount] = useState('');
  const [rawTx, setRawTx] = useState('');
  const [psbtIndexes, setPsbtIndexes] = useState([1, 2]);
  const [signMessage, setSignMessage] = useState('');
  const [decryptMessage, setDecryptMessage] = useState('');
  const [myDoge, setMyDoge] = useState<any>();
  const intervalRef = useRef<any>();

  useEffect(() => {
    if (!myDoge) {
      const onInit = () => {
        const { doge } = window as any;
        setMyDoge(doge);
        window.removeEventListener('doge#initialized', onInit);
        console.log('MyDoge API injected from event');
      };
      window.addEventListener('doge#initialized', onInit, { once: true });
    }
  }, [myDoge]);

  // Handle dev edge case where component mounts after MyDoge is initialized
  useEffect(() => {
    if (!myDoge && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const { doge } = window as any;
        if (doge?.isMyDoge) {
          setMyDoge(doge);
          clearInterval(intervalRef.current);
          console.log('MyDoge API injected from interval');
        } else {
          console.log('MyDoge API not injected');
        }
      }, 1000);
    }
  }, [myDoge]);

  const onConnect = useCallback(async () => {
    if (!myDoge?.isMyDoge) {
      alert(`MyDoge not installed!`);
      return;
    }

    try {
      if (connected) {
        const disconnectRes = await myDoge.disconnect();
        console.log('disconnect result', disconnectRes);
        if (disconnectRes.disconnected) {
          setConnected(false);
          setAddress(false);
          setBtnText('Connect');
        }
        return;
      }

      const connectRes = await myDoge.connect();
      console.log('connect result', connectRes);
      if (connectRes.approved) {
        setConnected(true);
        setAddress(connectRes.address);
        setBtnText('Disconnect');

        const balanceRes = await myDoge.getBalance();
        console.log('balance result', balanceRes);
        setBalance(sb.toBitcoin(balanceRes.balance));
      }
    } catch (e) {
      console.error(e);
    }
  }, [connected, myDoge]);

  const checkConnection = useCallback(async () => {
    if (connected) {
      const connectionStatusRes = await myDoge
        .getConnectionStatus()
        .catch(console.error);
      console.log('connection status result', connectionStatusRes);

      if (!connectionStatusRes?.connected) {
        setConnected(false);
        setAddress(false);
        setBtnText('Connect');
      }
    }
  }, [connected, myDoge]);

  useInterval(checkConnection, 5000, false);

  const isConnected = useCallback(() => {
    if (!myDoge?.isMyDoge) {
      alert(`MyDoge not installed!`);
      return false;
    }

    if (!connected) {
      alert(`MyDoge not connected!`);
      return false;
    }

    return true;
  }, [connected, myDoge]);

  const onTip = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const txReqRes = await myDoge.requestTransaction({
        recipientAddress: MDO_ADDRESS,
        dogeAmount: 4.2,
      });
      console.log('request transaction result', txReqRes);
      setTxId(txReqRes.txId);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDoge]);

  const onSendInscription = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const txReqRes = await myDoge.requestInscriptionTransaction({
        recipientAddress,
        location: inscriptionLocation,
      });
      console.log('request inscription transaction result', txReqRes);
      setTxId(txReqRes.txId);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDoge, recipientAddress, inscriptionLocation]);

  const onGetDRC20Balance = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const balanceRes = await myDoge.getDRC20Balance({
        ticker: drc20Ticker,
      });
      console.log('request drc-20 balance result', balanceRes);
      setDrc20Inscriptions([]);
      setDrc20Available(balanceRes.availableBalance);
      setDrc20Transferable(balanceRes.transferableBalance);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDoge, drc20Ticker]);

  const onGetDRC20Inscriptions = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const transferableRes = await myDoge.getTransferableDRC20({
        ticker: drc20Ticker,
      });
      console.log('request drc-20 transferable result', transferableRes);
      setDrc20Inscriptions(transferableRes.inscriptions);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDoge, drc20Ticker]);

  const onAvailableDRC20 = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const txReqRes = await myDoge.requestAvailableDRC20Transaction({
        ticker: drc20Ticker,
        amount: drc20Amount,
      });
      console.log('request available drc-20 tx result', txReqRes);
      setTxId(txReqRes.txId);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDoge, drc20Ticker, drc20Amount]);

  const txStatus = useCallback(async () => {
    if (txId) {
      const txStatusRes = await myDoge.getTransactionStatus({
        txId,
      });
      console.log('transaction status result', txStatusRes);
      // Once confirmed, stop polling and update balance
      if (txStatusRes.status === 'confirmed' && txStatusRes.confirmations > 1) {
        const balanceRes = await myDoge.getBalance();
        console.log('balance result', balanceRes);
        setBalance(sb.toBitcoin(balanceRes.balance));
        setTxId('');
      }
    }
  }, [myDoge, txId]);

  const onSendPSBT = useCallback(async () => {
    if (!isConnected()) return;
    const signOnly = true;

    try {
      const txReqRes = await myDoge.requestPsbt({
        rawTx,
        indexes: psbtIndexes,
        signOnly, // Optionally return the signed transaction instead of broadcasting
      });
      console.log('request send psbt result', txReqRes);

      if (!signOnly) {
        setTxId(txReqRes.txId);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDoge, psbtIndexes, rawTx]);

  const onSignMessage = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const signMsgRes = await myDoge.requestSignedMessage({
        message: signMessage,
      });
      console.log('request sign message result', signMsgRes);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDoge, signMessage]);

  const onDecryptMessage = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const decryptMsgRes = await myDoge.requestDecryptedMessage({
        message: decryptMessage,
      });
      console.log('request decrypt message result', decryptMsgRes);
    } catch (e) {
      console.error(e);
    }
  }, [isConnected, myDoge, decryptMessage]);

  useInterval(txStatus, 10000, false);

  return (
    <>
      <Head>
        <title>MyDoge</title>
        <meta name='description' content='Sample integration' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
        <div className={styles.item}>
          <div>
            <a
              href='https://github.com/mydoge-com/mydogemask'
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

            <div className={styles.center}>
              Inscription location (Doginal/DRC-20) (txid:vout:offset)
            </div>
            <input
              type='text'
              style={{ width: '485px' }}
              value={inscriptionLocation}
              onChange={(text) => {
                setinscriptionLocation(text.target.value);
              }}
            />
            <div className={styles.center}>Inscription recipient address</div>
            <input
              type='text'
              style={{ width: '265px' }}
              value={recipientAddress}
              onChange={(text) => {
                setRecipientAddress(text.target.value);
              }}
            />
            <div className={styles.center}>
              <button onClick={onSendInscription}>Send Inscription</button>
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
                <div key={inscription.location}>
                  {inscription.location} {inscription.ticker}{' '}
                  {inscription.amount}
                </div>
              ))}
            <div className={styles.item}>Send PSBT</div>
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
            <div className={styles.item}>Decrypt Message</div>
            <input
              type='text'
              className={styles.item}
              style={{ width: '500px' }}
              value={decryptMessage}
              onChange={(text) => {
                setDecryptMessage(text.target.value);
              }}
            />
            <div className={styles.center}>
              <button onClick={() => onDecryptMessage()}>
                Decrypt Message
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
