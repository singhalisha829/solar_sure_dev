import Layout from "@/components/shared/Layout";
import { ModalProvider } from "@/contexts/modal";
import "@/styles/dropdown.css";
import "@/styles/globals.css";
import "@/styles/login.css";
import "@/styles/leaflet.css";
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster } from "sonner";

const nunito_sans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-Nunito-Sans",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const ALTERNATE_FLOW_ROUTES = [
  "/vendor-registration/*",
];

const isAlternateFlow = (pathname) => {
  return ALTERNATE_FLOW_ROUTES.some(route => {
    if (route.endsWith("/*")) {
      return pathname.startsWith(route.slice(0, -2));
    }
    return pathname === route;
  });
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAlternate = isAlternateFlow(router.pathname);

  if (router.pathname === "/404") {
    return (
      <main className={`${nunito_sans.variable} font-sans`}>
        <Head>
          <title>Ornate Dashboard</title>
        </Head>
        <Component {...pageProps} />
      </main>
    );
  }

  // Alternate flow layout
  if (isAlternate) {
    return (
      <main className={`${nunito_sans.variable} font-sans bg-zinc-100`}>
        <Head>
          <title>Alternate Dashboard</title>
        </Head>
        <ModalProvider>
          <section className="h-screen grow basis-[85%] overflow-scroll rounded-2xl px-4 md:px-8 py-5 flex flex-col gap-5  print:h-fit">
            <Component {...pageProps} />
          </section>
          <Toaster richColors position="top-right" />
        </ModalProvider>
      </main>
    );
  }

  return (
    <main className={`${nunito_sans.variable} font-sans text-textcolor`}>
      <Head>
        <title>Ornate Dashboard</title>
      </Head>
      <ModalProvider>
        <Layout>
          <Component {...pageProps} />
          <Toaster richColors position="top-right" />
        </Layout>
      </ModalProvider>
    </main>
  );
}
