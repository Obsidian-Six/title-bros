// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";

// import { NextIntlClientProvider } from "next-intl";
// import { getMessages } from "next-intl/server";
// import { notFound } from "next/navigation";

// import { routing } from "@/i18n/routing";

// export default async function LocaleLayout({ children, params }) {
//   const { locale } = await params;

//   if (!routing.locales.includes(locale)) {
//     notFound();
//   }

//   const messages = await getMessages();

//   return (
//     <NextIntlClientProvider messages={messages}>
//       <Navbar />

//       <main>{children}</main>

//       <Footer />
//     </NextIntlClientProvider>
//   );
// }
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <AuthModal />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}