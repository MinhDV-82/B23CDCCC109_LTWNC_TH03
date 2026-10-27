import { NextAuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/data-repository';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'class_deadline_hub_super_secret_jwt_key_2026_ptit',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@ptit.edu.vn' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email);
        if (!user || !user.passwordHash) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValidPassword) {
          return null;
        }

        // Return user object without sensitive fields
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || (user.email === 'admin@ptit.edu.vn' ? 'admin' : 'user');
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Fallback on invalid url
      }
      return baseUrl;
    },
  },
};

export async function getServerAuthSession() {
  return getServerSession(authOptions);
}

