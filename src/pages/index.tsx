import Head from "next/head";
import Image from "next/image";
import sb from "satoshi-bitcoin";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useCallback, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [btnText, setBtnText] = useState("Connect");
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(0);

  const onButton = useCallback(async () => {
    const mydogemask = (window as any).doge;
    if (!connected) {
      const connectReq = await mydogemask.connect();
      console.log("connect result", connectReq);
      if (connectReq.approved) {
        setConnected(true);
        setBtnText(connectReq.address);
        const balanceReq = await mydogemask.getBalance();
        console.log("balance result", balanceReq);
        setBalance(sb.toBitcoin(balanceReq.balance));
      }
    }
  }, [connected, setBalance, setBtnText, setConnected]);

  return (
    <>
      <Head>
        <title>MyDogeMask</title>
        <meta name="description" content="Sample integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <div>
            <a
              href="https://github.com/mydoge-com/mydogemask"
              target="_blank"
              rel="noopener noreferrer"
            >
              Checkout MyDogeMask
              <Image
                src="/github.svg"
                alt="GitHub Logo"
                width={25}
                height={25}
                priority
              />
            </a>
          </div>
        </div>

        <div className={styles.center}>
          <button onClick={onButton}>{btnText}</button>
        </div>
        {balance !== 0 && (
          <div className={styles.description}>Balance: {balance}</div>
        )}
      </main>
    </>
  );
}
