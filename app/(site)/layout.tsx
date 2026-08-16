import { FavoritesProvider } from "@/components/site/favorites-provider"
import { SiteFooter } from "@/components/site/footer"
import { SiteHeader } from "@/components/site/header"

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <FavoritesProvider>
      <div className="flex min-h-screen flex-1 flex-col bg-white font-body text-[#1A1A1A]">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </FavoritesProvider>
  )
}
