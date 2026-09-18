import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
    const requestedLocale = await requestLocale;

    const locale = routing.locales.includes(requestedLocale)
        ? requestedLocale
        : routing.defaultLocale;

    console.log("REQUESTED LOCALE:", requestedLocale);
    console.log("FINAL LOCALE:", locale);

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});