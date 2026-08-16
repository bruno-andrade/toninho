import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de privacidade",
  robots: { index: false, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-14 font-body text-sm leading-relaxed text-[#1A1A1A] sm:px-12">
      <div className="flex flex-col gap-2">
        <span className="font-body text-[11px] font-bold uppercase tracking-wider text-[#C93A1A]">
          Privacidade
        </span>
        <h1 className="font-heading text-2xl font-extrabold text-[#1A1A1A]">Política de privacidade</h1>
        <p className="text-[#6B6B68]">Última atualização: agosto de 2026.</p>
      </div>

      <p>
        Esta página explica, de forma simples, quais dados o site AuToninho coleta, para que servem e quais direitos
        você tem sobre eles, em linha com a Lei Geral de Proteção de Dados (LGPD).
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-base font-bold text-[#1A1A1A]">Quais dados coletamos</h2>
        <ul className="flex flex-col gap-1.5 pl-5 list-disc">
          <li>
            <b>Formulário &quot;Vender meu carro&quot;</b>: nome, telefone, cidade, dados do veículo (marca, modelo,
            ano, km etc.) e as fotos que você envia.
          </li>
          <li>
            <b>Favoritos</b>: os carros que você marca como favorito ficam salvos só no seu navegador
            (<code className="rounded bg-[#F1F0EC] px-1 py-0.5 text-xs">localStorage</code>) — não enviamos essa
            informação para nossos servidores nem associamos a você como pessoa.
          </li>
          <li>
            <b>Navegação</b>: registramos, de forma anônima, cliques em botões de contato (WhatsApp/agendar visita)
            em cada anúncio, para entender quais carros geram mais interesse. Não coletamos nome, e-mail ou qualquer
            dado que identifique quem clicou.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-base font-bold text-[#1A1A1A]">Para que usamos esses dados</h2>
        <p>
          Os dados do formulário &quot;Vender meu carro&quot; são usados exclusivamente para a equipe AuToninho
          avaliar o veículo oferecido e entrar em contato com uma proposta. Não vendemos, alugamos ou compartilhamos
          esses dados com terceiros para fins de marketing.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-base font-bold text-[#1A1A1A]">Por quanto tempo guardamos</h2>
        <p>
          Mantemos os dados da solicitação enquanto ela estiver em análise e por um período razoável depois, para
          referência interna. Você pode pedir a remoção a qualquer momento (veja abaixo).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-base font-bold text-[#1A1A1A]">Seus direitos</h2>
        <p>
          Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento, entrando em contato
          pelo WhatsApp da loja (disponível nas páginas de carro e na página &quot;Como funciona&quot;).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-base font-bold text-[#1A1A1A]">Terceiros envolvidos</h2>
        <p>
          Este site é hospedado na Vercel e usa Neon (banco de dados) e Vercel Blob (armazenamento de fotos) como
          infraestrutura técnica — nenhum desses provedores usa seus dados para fins próprios.
        </p>
      </section>

      <p className="text-xs text-[#6B6B68]">
        Este texto é um aviso genérico de privacidade, ainda pendente de revisão com os dados legais definitivos da
        loja.
      </p>
    </div>
  )
}
