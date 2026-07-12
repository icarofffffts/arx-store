import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const ARX_JWT_SECRET = new TextEncoder().encode(
  process.env.ARX_JWT_SECRET || "super_secret_arx_auth_key_2026"
);

/**
 * Retorna a sessao do usuario — primeiro tenta ARX JWT, depois NextAuth (Discord).
 * Ambos os metodos de login funcionam nas mesmas paginas protegidas.
 */
export async function getAuthSession(): Promise<any> {
  // 1. ARX JWT token (prioridade)
  const cookieStore = await cookies();
  const arxToken = cookieStore.get("arx_token")?.value;
  if (arxToken) {
    try {
      const { payload } = await jwtVerify(arxToken, ARX_JWT_SECRET);
      return {
        user: {
          name: payload.discordUsername || (payload.email as string),
          email: payload.email as string,
          image: (payload.discordAvatar as string) || null,
          discordId: payload.discordId || null,
          openId: (payload.openId as string) || null,
        },
      };
    } catch {
      // token invalido, segue pro fallback
    }
  }

  // 2. Fallback: NextAuth (Discord)
  const session = await getServerSession(authOptions);
  if (session) return session;

  return null;
}
