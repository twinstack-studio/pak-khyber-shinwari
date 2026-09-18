import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except API routes, the staff panel, Next internals, and files
  // with an extension. /admin is deliberately excluded: it is an English-only
  // staff tool and must not be pushed to /en/admin.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
