import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useCallback, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [btnText, setBtnText] = useState("Connect");
  const [connected, setConnected] = useState(false);

  const onButton = useCallback(async () => {
    const mydogemask = (window as any).doge;
    if (!connected) {
      const result = await mydogemask.connect();
      console.log("connect result", result);
      if (result.approved) {
        setConnected(true);
        setBtnText(result.address);
      }
    }
  }, [connected, setBtnText, setConnected]);

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
      </main>
    </>
  );
}
