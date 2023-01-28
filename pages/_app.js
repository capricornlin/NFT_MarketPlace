import { ThemeProvider } from 'next-themes';
import Script from 'next/script';

import '../styles/globals.css';
import { Navbar, Footer } from '../components';
import { NFTProvider } from '../context/NFTcontext';

function MyApp({ Component, pageProps }) {
  return (
    <NFTProvider>
      <ThemeProvider attribute="class">
        <div className="dark:bg-nft-dark bg-white min-h-screen">
          <Navbar />
          <div className="pt-65">
            <Component {...pageProps} />
          </div>
          <Footer />
        </div>
        <Script src="https://kit.fontawesome.com/bd34fe56db.js" crossorigin="anonymous"></Script>
      </ThemeProvider>
    </NFTProvider>
  );
}

export default MyApp;
