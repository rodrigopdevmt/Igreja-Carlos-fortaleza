import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Award, Crown, CheckCircle2, Sparkles } from 'lucide-react';
import { GoldLogo } from '@/components/common/GoldLogo';
import { ChurchDocumentData, DOCUMENT_TEMPLATES } from '@/services/churchDocumentService';

interface DocumentPreviewCanvasProps {
  document: ChurchDocumentData;
  scale?: number;
  onVerifyClick?: () => void;
  className?: string;
  isPrintOnly?: boolean;
}

export const DocumentPreviewCanvas: React.FC<DocumentPreviewCanvasProps> = ({
  document: doc,
  scale = 1,
  onVerifyClick,
  className = '',
  isPrintOnly = false,
}) => {
  const isLandscape = doc.orientation === 'landscape';
  const meta = DOCUMENT_TEMPLATES[doc.type];

  const isDark = doc.theme === 'prestige_gold_dark';
  const isGlass = doc.theme === 'apostolic_glass';
  const isIvory = doc.theme === 'royal_ivory_light';

  // Format date
  const formattedDate = new Date(doc.issuedAt).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className={`relative mx-auto transition-all select-none ${className}`}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* 
        A4 Ratio Dimensions:
        Landscape: ~1050px x 742px (Aspect 1.414)
        Portrait:  ~742px x 1050px (Aspect 0.707)
      */}
      <div
        id="church-printable-document"
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-2xl ${
          isLandscape
            ? 'w-[1000px] min-h-[707px]'
            : 'w-[750px] min-h-[1060px]'
        } ${
          isDark
            ? 'bg-[#140F0A] text-[#F8F5EC] border-[#DAA017]/40 shadow-[0_25px_60px_rgba(0,0,0,0.85)]'
            : isGlass
            ? 'bg-[#1E1710]/95 backdrop-blur-2xl text-[#F8F5EC] border-[#DAA017]/60 shadow-[0_20px_50px_rgba(218,160,23,0.18)]'
            : 'bg-[#FAF8F2] text-[#1F1912] border-[#C59B27]/40 shadow-[0_20px_50px_rgba(0,0,0,0.2)]'
        }`}
        style={{
          boxSizing: 'border-box',
        }}
      >
        {/* Background Texture & Subtle Radial Glow */}
        {isDark || isGlass ? (
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 20%, rgba(218,160,23,0.2) 0%, transparent 65%), radial-gradient(circle at 10% 90%, rgba(184,134,11,0.12) 0%, transparent 50%)`,
            }}
          />
        ) : (
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 15%, rgba(218,160,23,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(218,160,23,0.08) 0%, transparent 50%)`,
            }}
          />
        )}

        {/* Outer Ornamental Gold Double Border */}
        <div className="absolute inset-4 sm:inset-6 rounded-xl pointer-events-none border-2 border-[#DAA017] opacity-80" />
        <div className="absolute inset-6 sm:inset-8 rounded-lg pointer-events-none border border-[#DAA017]/40" />

        {/* Intricate Geometric Corner Ornaments */}
        {[
          'top-6 left-6 border-t-2 border-l-2',
          'top-6 right-6 border-t-2 border-r-2',
          'bottom-6 left-6 border-b-2 border-l-2',
          'bottom-6 right-6 border-b-2 border-r-2',
        ].map((pos, idx) => (
          <div
            key={idx}
            className={`absolute w-8 h-8 pointer-events-none border-[#DAA017] ${pos} z-10 flex items-center justify-center`}
          >
            <div className="w-2 h-2 rounded-full bg-[#DAA017] opacity-90 shadow-[0_0_8px_#DAA017]" />
          </div>
        ))}

        {/* Central Apostolic Emblem Watermark */}
        {doc.includeWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none z-0">
            <GoldLogo size="2xl" className="scale-[3.2]" />
          </div>
        )}

        {/* Document Content Container */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 sm:p-14 min-h-[707px]">
          {/* ------------------------------------------------------------- */}
          {/* HEADER: Church Logo, Typography & Official Seal              */}
          {/* ------------------------------------------------------------- */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full gold-gradient p-0.5 shadow-lg shadow-[#DAA017]/25 flex items-center justify-center">
                <GoldLogo size="sm" showText={false} />
              </div>
              <div className="text-left">
                <h2
                  className={`font-serif text-xl sm:text-2xl font-bold tracking-wider uppercase leading-none ${
                    isDark || isGlass
                      ? 'gold-gradient-text drop-shadow-[0_2px_10px_rgba(218,160,23,0.3)]'
                      : 'text-[#2D2318]'
                  }`}
                >
                  Igreja Apostólica Boas Novas
                </h2>
                <p
                  className={`text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase mt-0.5 ${
                    isDark || isGlass ? 'text-[#DAA017]' : 'text-[#8C6414]'
                  }`}
                >
                  Ministério Apostólico & Conselho Pastoral Sede
                </p>
              </div>
            </div>

            <p
              className={`text-[10.5px] font-mono tracking-wider ${
                isDark || isGlass ? 'text-[#F8F5EC]/50' : 'text-[#2D2318]/60'
              }`}
            >
              CNPJ: {doc.tenantCnpj || '12.345.678/0001-90'} • SÃO PAULO - SP • BRASIL • MINISTÉRIO REGISTRADO
            </p>

            {/* Title Ribbon Divider */}
            <div className="pt-3 pb-2 flex items-center justify-center gap-4">
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-[#DAA017]" />
              <div className="w-2 h-2 rotate-45 border border-[#DAA017] bg-[#DAA017]/40" />
              <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-[#DAA017]" />
            </div>

            {/* Document Main Heading */}
            <h1
              className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight uppercase ${
                isDark || isGlass ? 'text-[#FFF4D0]' : 'text-[#1F1912]'
              }`}
            >
              {doc.customTitle || meta.title}
            </h1>
            <p
              className={`text-xs font-serif italic ${
                isDark || isGlass ? 'text-[#DAA017]' : 'text-[#B8860B]'
              }`}
            >
              {meta.badge} • Documento Eclesiástico Solene
            </p>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* BODY: Main Custom Text According to Document Type             */}
          {/* ------------------------------------------------------------- */}
          <div className="my-6 sm:my-8 text-center space-y-4 px-4 sm:px-12 max-w-4xl mx-auto">
            {doc.type === 'baptism' && (
              <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed">
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  Certificamos perante a congregação apostólica e as sagradas escrituras que o(a) irmão(ã)
                </p>
                <div className="py-2">
                  <h3
                    className={`font-serif text-2xl sm:text-3xl font-bold tracking-wide ${
                      isDark || isGlass ? 'gold-gradient-text' : 'text-[#8C6414]'
                    }`}
                  >
                    {doc.recipientName}
                  </h3>
                  {doc.recipientDocument && (
                    <p
                      className={`text-xs font-mono mt-1 ${
                        isDark || isGlass ? 'text-[#F8F5EC]/50' : 'text-[#2D2318]/60'
                      }`}
                    >
                      Portador(a) do Documento nº {doc.recipientDocument}
                    </p>
                  )}
                </div>
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  foi solenemente <strong className="text-[#DAA017]">BATIZADO(A) NAS ÁGUAS</strong> por imersão, em nome do{' '}
                  <strong>Pai, do Filho e do Espírito Santo</strong>, professando publicamente sua fé salvífica e aliança
                  eterna com nosso Senhor e Salvador Jesus Cristo.
                </p>
              </div>
            )}

            {doc.type === 'ordination' && (
              <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed">
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  O Colegiado de Bispos e Apóstolos da Igreja Apostólica Boas Novas confere o presente certificado a:
                </p>
                <div className="py-2">
                  <h3
                    className={`font-serif text-2xl sm:text-3xl font-bold tracking-wide ${
                      isDark || isGlass ? 'gold-gradient-text' : 'text-[#8C6414]'
                    }`}
                  >
                    {doc.recipientName}
                  </h3>
                  <div className="inline-block mt-2 px-4 py-1 rounded-full border border-[#DAA017]/40 bg-[#DAA017]/10 font-sans text-xs font-bold text-[#DAA017] uppercase tracking-wider">
                    {doc.ministryOrRole || 'Pastor(a) do Evangelho'}
                  </div>
                </div>
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  declarando-o(a) <strong className="text-[#DAA017]">CONSAGRADO(A) E ORDENADO(A) AO SANTO MINISTÉRIO</strong>,
                  tendo recebido a unção sagrada e imposição de mãos para apascentar o rebanho do Senhor com temor e integridade.
                </p>
              </div>
            )}

            {doc.type === 'presentation' && (
              <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed">
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  Certificamos com júbilo que a criança
                </p>
                <div className="py-1">
                  <h3
                    className={`font-serif text-2xl sm:text-3xl font-bold tracking-wide ${
                      isDark || isGlass ? 'gold-gradient-text' : 'text-[#8C6414]'
                    }`}
                  >
                    {doc.recipientName}
                  </h3>
                  {(doc.fatherName || doc.motherName) && (
                    <p
                      className={`text-xs font-serif italic mt-1 ${
                        isDark || isGlass ? 'text-[#F8F5EC]/70' : 'text-[#2D2318]/70'
                      }`}
                    >
                      Filho(a) de {doc.fatherName || 'Pai'} e {doc.motherName || 'Mãe'}
                    </p>
                  )}
                </div>
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  foi solenemente <strong className="text-[#DAA017]">APRESENTADA E DEDICADA AO SENHOR JESUS CRISTO</strong> no
                  santuário, recebendo a oração de bênção sacerdotal e intercessão pela sua vida, graça e futuro.
                </p>
              </div>
            )}

            {doc.type === 'recommendation' && (
              <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed text-left sm:text-justify">
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/90' : 'text-[#2D2318]/90'}>
                  À amada Igreja Coirmã em Cristo Jesus,
                </p>
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  Paz e graça da parte de Deus nosso Pai. Pela presente enviamos e recomendamos com fraterna alegria o(a) irmão(ã):
                </p>
                <div className="text-center py-2">
                  <h3
                    className={`font-serif text-2xl font-bold tracking-wide ${
                      isDark || isGlass ? 'gold-gradient-text' : 'text-[#8C6414]'
                    }`}
                  >
                    {doc.recipientName}
                  </h3>
                  {doc.recipientDocument && (
                    <p
                      className={`text-xs font-mono mt-0.5 ${
                        isDark || isGlass ? 'text-[#F8F5EC]/60' : 'text-[#2D2318]/60'
                      }`}
                    >
                      CPF: {doc.recipientDocument} • {doc.ministryOrRole || 'Membro em Plena Comunhão'}
                    </p>
                  )}
                </div>
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  Atestamos que durante sua permanência entre nós manteve conduta cristã irrepreensível, assiduidade e amor ao Evangelho.
                  {doc.destinationChurch && (
                    <span>
                      {' '}Recomendamos para acolhimento na <strong>{doc.destinationChurch}</strong> ({doc.destinationCity || 'Brasil'}).
                    </span>
                  )}
                </p>
              </div>
            )}

            {doc.type === 'course_completion' && (
              <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed">
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  A Diretoria de Educação Teológica & Discipulado confere o presente certificado a:
                </p>
                <div className="py-2">
                  <h3
                    className={`font-serif text-2xl sm:text-3xl font-bold tracking-wide ${
                      isDark || isGlass ? 'gold-gradient-text' : 'text-[#8C6414]'
                    }`}
                  >
                    {doc.recipientName}
                  </h3>
                  <div className="mt-2 text-sm font-semibold text-[#DAA017] uppercase tracking-wider">
                    {doc.courseName || 'Curso de Formação Ministerial & Liderança Apostólica'}
                  </div>
                  {doc.workloadHours && (
                    <p
                      className={`text-xs font-mono mt-0.5 ${
                        isDark || isGlass ? 'text-[#F8F5EC]/60' : 'text-[#2D2318]/60'
                      }`}
                    >
                      Carga Horária: {doc.workloadHours} horas-aula
                    </p>
                  )}
                </div>
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  tendo cumprido integralmente o programa de estudos bíblicos, avaliações práticas e mentoria ministerial.
                </p>
              </div>
            )}

            {doc.type === 'marriage' && (
              <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed">
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  Certificamos que perante Deus, o Santo Ministério e as testemunhas reunidas, uniram-se em Matrimônio:
                </p>
                <div className="py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <span
                    className={`font-serif text-xl sm:text-2xl font-bold ${
                      isDark || isGlass ? 'text-[#FFF4D0]' : 'text-[#1F1912]'
                    }`}
                  >
                    {doc.recipientName}
                  </span>
                  <span className="text-[#DAA017] font-serif text-lg">&</span>
                  <span
                    className={`font-serif text-xl sm:text-2xl font-bold ${
                      isDark || isGlass ? 'text-[#FFF4D0]' : 'text-[#1F1912]'
                    }`}
                  >
                    {doc.spouseName || 'Cônjuge'}
                  </span>
                </div>
                <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                  celebrando a sagrada aliança de uma só carne conforme as Sagradas Escrituras.
                </p>
              </div>
            )}

            {/* Fallback for other documents (declaration, tithes) */}
            {doc.type !== 'baptism' &&
              doc.type !== 'ordination' &&
              doc.type !== 'presentation' &&
              doc.type !== 'recommendation' &&
              doc.type !== 'course_completion' &&
              doc.type !== 'marriage' && (
                <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed">
                  <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                    Atestamos e certificamos para os devidos fins que:
                  </p>
                  <h3
                    className={`font-serif text-2xl sm:text-3xl font-bold tracking-wide ${
                      isDark || isGlass ? 'gold-gradient-text' : 'text-[#8C6414]'
                    }`}
                  >
                    {doc.recipientName}
                  </h3>
                  <p className={isDark || isGlass ? 'text-[#F8F5EC]/85' : 'text-[#2D2318]/90'}>
                    {doc.customBody ||
                      'Encontra-se devidamente registrado(a) e com situação eclesiástica plenamente regular perante a secretaria desta instituição.'}
                  </p>
                </div>
              )}

            {/* Scripture Verse Citation Box */}
            <div
              className={`mt-6 p-3 sm:p-4 rounded-xl border max-w-2xl mx-auto ${
                isDark || isGlass
                  ? 'bg-[#1A140E]/80 border-[#DAA017]/30 text-[#DAA017]'
                  : 'bg-[#F2EFE9] border-[#C59B27]/30 text-[#8C6414]'
              }`}
            >
              <p className="font-serif italic text-xs sm:text-sm leading-relaxed">
                "{doc.verseText}"
              </p>
              <p className="font-serif font-bold text-xs tracking-wider mt-1 text-right">
                — {doc.verseReference}
              </p>
            </div>

            {/* Location and Date */}
            <p
              className={`text-xs font-serif pt-2 ${
                isDark || isGlass ? 'text-[#F8F5EC]/70' : 'text-[#2D2318]/70'
              }`}
            >
              {doc.city} - {doc.state}, {formattedDate}
            </p>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* FOOTER: Signatures, 3D Gold Embossed Stamp & Security QR Code */}
          {/* ------------------------------------------------------------- */}
          <div className="pt-4 border-t border-[#DAA017]/30">
            <div className="grid grid-cols-12 gap-4 items-end">
              {/* Signatures Column (Cols 1-8) */}
              <div className="col-span-8 grid grid-cols-2 gap-6 text-center">
                {/* Signatory 1 */}
                <div className="flex flex-col items-center">
                  <div className="h-10 flex items-end justify-center mb-1">
                    {/* Simulated Signature Calligraphy */}
                    <span className="font-serif italic text-base sm:text-lg text-[#DAA017] tracking-wider opacity-90">
                      {doc.officiantName.split(' ')[0]} {doc.officiantName.split(' ')[1]}
                    </span>
                  </div>
                  <div className="w-full max-w-[200px] border-b border-[#DAA017]/60 mb-1" />
                  <p
                    className={`font-serif text-xs font-bold ${
                      isDark || isGlass ? 'text-[#F8F5EC]' : 'text-[#1F1912]'
                    }`}
                  >
                    {doc.officiantName}
                  </p>
                  <p
                    className={`text-[10px] uppercase tracking-wider ${
                      isDark || isGlass ? 'text-[#DAA017]' : 'text-[#8C6414]'
                    }`}
                  >
                    {doc.officiantRole}
                  </p>
                </div>

                {/* Signatory 2 */}
                <div className="flex flex-col items-center">
                  <div className="h-10 flex items-end justify-center mb-1">
                    <span className="font-serif italic text-base sm:text-lg text-[#DAA017] tracking-wider opacity-90">
                      {doc.secondSignatoryName ? doc.secondSignatoryName.split(' ')[0] : 'Helena'}{' '}
                      {doc.secondSignatoryName ? doc.secondSignatoryName.split(' ')[1] : 'Silveira'}
                    </span>
                  </div>
                  <div className="w-full max-w-[200px] border-b border-[#DAA017]/60 mb-1" />
                  <p
                    className={`font-serif text-xs font-bold ${
                      isDark || isGlass ? 'text-[#F8F5EC]' : 'text-[#1F1912]'
                    }`}
                  >
                    {doc.secondSignatoryName || 'Bispa Helena Silveira'}
                  </p>
                  <p
                    className={`text-[10px] uppercase tracking-wider ${
                      isDark || isGlass ? 'text-[#DAA017]' : 'text-[#8C6414]'
                    }`}
                  >
                    {doc.secondSignatoryRole || 'Conselho Apostólico & Secretaria'}
                  </p>
                </div>
              </div>

              {/* Gold Embossed Seal & QR Code (Cols 9-12) */}
              <div className="col-span-4 flex items-center justify-end gap-3">
                {/* 3D Embossed Gold Seal Stamp */}
                {doc.includeGoldSeal && (
                  <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-[#DAA017] gold-gradient p-1 shadow-lg shadow-[#DAA017]/30 text-center relative group">
                    <div className="w-full h-full rounded-full border border-dashed border-[#1A140E]/40 flex flex-col items-center justify-center text-[#1A140E]">
                      <Crown className="w-4 h-4 text-[#1A140E]" />
                      <span className="text-[7.5px] font-bold uppercase tracking-tighter leading-tight mt-0.5">
                        SELO SEDE
                      </span>
                      <span className="text-[6.5px] font-semibold tracking-tighter">OFICIAL</span>
                    </div>
                  </div>
                )}

                {/* Live QR Code with Public Verification Target */}
                {doc.includeQrCode && (
                  <button
                    onClick={onVerifyClick}
                    type="button"
                    title="Clique para validar autenticidade deste documento"
                    className="p-2 rounded-xl bg-white border border-[#DAA017]/40 shadow-md transition-transform hover:scale-105 group"
                  >
                    <QRCodeSVG
                      value={`https://boasnovas.org.br/validar/${doc.registrationCode}?hash=${doc.securityHash}`}
                      size={60}
                      level="H"
                      fgColor="#1A140E"
                      bgColor="#FFFFFF"
                    />
                    <span className="block text-[8px] font-mono text-center text-[#1A140E] font-bold mt-0.5 group-hover:text-[#DAA017]">
                      {doc.registrationCode.slice(0, 12)}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Registry Strip */}
            <div
              className={`mt-4 pt-2 border-t flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono gap-1 ${
                isDark || isGlass
                  ? 'border-[#DAA017]/15 text-[#F8F5EC]/40'
                  : 'border-[#DAA017]/20 text-[#2D2318]/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>
                  LIVRO: <strong className="text-[#DAA017]">{doc.bookNumber}</strong>
                </span>
                <span>
                  FOLHA: <strong className="text-[#DAA017]">{doc.pageNumber}</strong>
                </span>
                <span>
                  REGISTRO: <strong className="text-[#DAA017]">{doc.entryNumber}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-[#DAA017]" />
                <span>HASH: {doc.securityHash.slice(0, 20)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
