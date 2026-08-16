import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que bots de preview de link (principalmente o WhatsApp, o canal
  // de contato principal do site) recebam o <head> já resolvido, em vez da
  // versão com metadata em streaming — senão o preview do link do carro
  // compartilhado no WhatsApp pode vir sem título/imagem.
  htmlLimitedBots:
    /Mediapartners-Google|AdsBot-Google|Google-PageRenderer|Googlebot|Bingbot|BingPreview|Slackbot|Twitterbot|WhatsApp|facebookexternalhit|Facebot|LinkedInBot|TelegramBot|Discordbot|SkypeUriPreview/,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
