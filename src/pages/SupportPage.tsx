import { useState } from 'react';
import {
  Headphones,
  Mail,
  MessageSquare,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Clock3,
  ShieldCheck,
  Server,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const faqs = [
  {
    question: 'Como adiciono um novo equipamento?',
    answer:
      'Aceda à área Equipment através do menu lateral e utilize a opção para adicionar um novo equipamento. Preencha os dados necessários e guarde.',
  },
  {
    question: 'Como atribuo um equipamento a um utilizador?',
    answer:
      'Abra o equipamento pretendido e utilize a opção de atribuição para selecionar o utilizador responsável pelo equipamento.',
  },
  {
    question: 'Como consulto os equipamentos de um utilizador?',
    answer:
      'Aceda a Utilizadores, selecione o utilizador pretendido e consulte os equipamentos que estão atualmente associados ao seu perfil.',
  },
  {
    question: 'Quem pode alterar a hierarquia?',
    answer:
      'A hierarquia pode ser consultada por todos os utilizadores. As alterações à estrutura organizacional ficam reservadas aos administradores.',
  },
  {
    question: 'Como altero os meus dados?',
    answer:
      'Aceda ao seu Perfil através do menu Sistema. Aí poderá consultar e editar os dados de perfil disponíveis.',
  },
  {
    question: 'Como altero a minha palavra-passe?',
    answer:
      'A opção para alterar a palavra-passe encontra-se no Perfil. A funcionalidade será ligada ao sistema de autenticação numa próxima etapa.',
  },
];

export default function SupportPage() {
  const { language } = useLanguage();
  const isPT = language === 'pt';

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const content = isPT
    ? {
        title: 'Suporte',
        subtitle:
          'Precisa de ajuda? Encontre respostas ou contacte a equipa de IT.',
        contact: 'Contactar IT',
        contactDesc:
          'Entre em contacto com a equipa de IT para obter assistência.',
        ticket: 'Abrir pedido',
        ticketDesc:
          'Crie um pedido de suporte para problemas ou solicitações.',
        docs: 'Documentação',
        docsDesc:
          'Consulte a documentação e os procedimentos disponíveis.',
        faq: 'Perguntas frequentes',
        faqDesc: 'Respostas para as questões mais comuns.',
        supportInfo: 'Informação de suporte',
        availability: 'Disponibilidade',
        availabilityValue: 'Segunda — Sexta, 09:00 — 18:00',
        email: 'Email de suporte',
        emailValue: 'it@empresa.pt',
        services: 'Estado dos serviços',
        servicesValue: 'Todos os serviços operacionais',
        status: 'Operacional',
        useful: 'Recursos úteis',
        usefulDesc: 'Acesso rápido às principais áreas do sistema.',
        goEquipment: 'Gerir equipamentos',
        goUsers: 'Gerir utilizadores',
        goSettings: 'Definições do sistema',
        soon: 'Brevemente',
      }
    : {
        title: 'Support',
        subtitle: 'Need help? Find answers or contact the IT team.',
        contact: 'Contact IT',
        contactDesc: 'Get in touch with the IT team for assistance.',
        ticket: 'Open request',
        ticketDesc: 'Create a support request for issues or questions.',
        docs: 'Documentation',
        docsDesc: 'Access available documentation and procedures.',
        faq: 'Frequently asked questions',
        faqDesc: 'Answers to the most common questions.',
        supportInfo: 'Support information',
        availability: 'Availability',
        availabilityValue: 'Monday — Friday, 09:00 — 18:00',
        email: 'Support email',
        emailValue: 'it@company.com',
        services: 'Service status',
        servicesValue: 'All services operational',
        status: 'Operational',
        useful: 'Useful resources',
        usefulDesc: 'Quick access to the main areas of the system.',
        goEquipment: 'Manage equipment',
        goUsers: 'Manage users',
        goSettings: 'System settings',
        soon: 'Coming soon',
      };

  const supportCards = [
    {
      icon: Mail,
      title: content.contact,
      description: content.contactDesc,
      action: 'mailto:it@empresa.pt',
      available: true,
    },
    {
      icon: MessageSquare,
      title: content.ticket,
      description: content.ticketDesc,
      action: null,
      available: false,
    },
    {
      icon: BookOpen,
      title: content.docs,
      description: content.docsDesc,
      action: null,
      available: false,
    },
  ];

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 lg:px-8 text-white">
      <div className="space-y-5">
        {/* Header */}
        <div className="mb-8">

          <h1 className="text-2xl font-bold tracking-tight text-white">
            {content.title}
          </h1>

          <p className="mt-1 text-sm text-white/45">
            {content.subtitle}
          </p>
        </div>

        {/* Support cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {supportCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group rounded-2xl border border-white/[0.06] bg-[#0D1730] p-5 transition-all duration-200 hover:border-white/[0.10] hover:bg-[#101B36]"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>

                  {!card.available && (
                    <span className="rounded-full border border-amber-400/10 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                      {content.soon}
                    </span>
                  )}
                </div>

                <h2 className="text-[15px] font-semibold text-white">
                  {card.title}
                </h2>

                <p className="mt-2 min-h-[42px] text-sm leading-5 text-white/45">
                  {card.description}
                </p>

                {card.available ? (
                  <a
                    href={card.action ?? '#'}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                  >
                    {content.contact}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/25">
                    {content.soon}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* FAQ */}
          <section className="rounded-2xl border border-white/[0.06] bg-[#0D1730]">
            <div className="border-b border-white/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
                  <HelpCircle className="h-4 w-4 text-white/60" />
                </div>

                <div>
                  <h2 className="text-[15px] font-semibold">
                    {content.faq}
                  </h2>

                  <p className="mt-0.5 text-xs text-white/35">
                    {content.faqDesc}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <button
                    key={faq.question}
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="w-full text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between gap-4 px-6 py-4">
                      <span className="text-sm font-medium text-white/80">
                        {isPT ? faq.question : [
                          'How do I add a new piece of equipment?',
                          'How do I assign equipment to a user?',
                          'How do I view a user’s equipment?',
                          'Who can edit the hierarchy?',
                          'How do I change my personal information?',
                          'How do I change my password?',
                        ][index]}
                      </span>

                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>

                    <div
                      className={`grid transition-all duration-200 ${
                        isOpen
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-4 pr-12 text-sm leading-6 text-white/40">
                          {isPT
                            ? faq.answer
                            : [
                                'Go to Equipment through the sidebar and use the option to add a new piece of equipment. Fill in the required information and save.',
                                'Open the desired equipment and use the assignment option to select the responsible user.',
                                'Go to Users, select the desired user and view the equipment currently assigned to their profile.',
                                'The hierarchy can be viewed by everyone. Changes to the organizational structure are restricted to administrators.',
                                'Go to your Profile through the System menu. You can view and edit the profile information available there.',
                                'The password change option is available in Profile. The functionality will be connected to the authentication system in a future step.',
                              ][index]}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Support information */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/[0.06] bg-[#0D1730]">
              <div className="border-b border-white/[0.06] px-6 py-5">
                <h2 className="text-[15px] font-semibold">
                  {content.supportInfo}
                </h2>
              </div>

              <div className="divide-y divide-white/[0.05]">
                <div className="flex items-center gap-4 px-6 py-4">
                  <Clock3 className="h-4 w-4 shrink-0 text-white/35" />

                  <div className="min-w-0">
                    <p className="text-xs text-white/35">
                      {content.availability}
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      {content.availabilityValue}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-6 py-4">
                  <Mail className="h-4 w-4 shrink-0 text-white/35" />

                  <div className="min-w-0">
                    <p className="text-xs text-white/35">
                      {content.email}
                    </p>
                    <p className="mt-1 truncate text-sm text-white/75">
                      {content.emailValue}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-6 py-4">
                  <Server className="h-4 w-4 shrink-0 text-white/35" />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/35">
                      {content.services}
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      {content.servicesValue}
                    </p>
                  </div>

                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {content.status}
                  </span>
                </div>
              </div>
            </section>

            {/* Useful resources */}
            <section className="rounded-2xl border border-white/[0.06] bg-[#0D1730] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
                  <ShieldCheck className="h-4 w-4 text-white/60" />
                </div>

                <div>
                  <h2 className="text-[15px] font-semibold">
                    {content.useful}
                  </h2>

                  <p className="mt-0.5 text-xs text-white/35">
                    {content.usefulDesc}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <ResourceLink
                  href="/equipment"
                  label={content.goEquipment}
                  icon={<Server className="h-4 w-4" />}
                />

                <ResourceLink
                  href="/users"
                  label={content.goUsers}
                  icon={<ShieldCheck className="h-4 w-4" />}
                />

                <ResourceLink
                  href="/settings"
                  label={content.goSettings}
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3 text-sm text-white/60 transition-all hover:border-white/[0.09] hover:bg-white/[0.035] hover:text-white"
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>

      <ExternalLink className="h-3.5 w-3.5 text-white/25" />
    </a>
  );
}