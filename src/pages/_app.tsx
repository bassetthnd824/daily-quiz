import "@/styles/globals.scss";
import FooterComponent from '@/components/footer/FooterComponent';
import HeaderComponent from '@/components/header/HeaderComponent';
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
  return (
      <>
        <HeaderComponent/>
        <Component {...pageProps} />
        <FooterComponent/>
      </>
  )
}

export default App
