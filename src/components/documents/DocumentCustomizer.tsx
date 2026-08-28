import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Share2,
  Check,
  RefreshCw,
  Search,
  UserCheck,
  BookOpen,
  Calendar,
  Layers,
  Palette,
  ShieldCheck,
  Crown,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  ChurchDocumentData,
  DocumentType,
  DocumentTheme,
  DocumentOrientation,
  DOCUMENT_TEMPLATES,
  generateDocumentSecurityCode,
  exportDocumentToPdf,
  generateWhatsAppDocumentMessage,
} from '@/services/churchDocumentService';
import { useChurch, Person } from '@/context/ChurchContext';

interface DocumentCustomizerProps {
  currentDocument: ChurchDocumentData;
  onDocumentChange: (updated: ChurchDocumentData) => void;
  onSaveToRegistry: (doc: ChurchDocumentData) => void;
  onOpenValidationModal: () => void;
}

const SCRIPTURE_PRESETS: { reference: string; text: string; label: string }[] = [
  {
    reference: 'Romanos 6:4',
    text: 'De sorte que fomos sepultados com ele pelo batismo na morte; para que, como Cristo ressuscitou dos mortos pela glória do Pai, assim andemos nós também em novidade de vida.',
    label: 'Batismo & Regeneração (Rm 6:4)',
  },
  {
    reference: 'Provérbios 22:6',
    text: 'Instrui o menino no caminho em que deve andar, e, até quando envelhecer, não se desviará dele.',
    label: 'Apresentação de Criança (Pv 22:6)',
  },
  {
    reference: '2 Timóteo 4:2',
    text: 'Prega a palavra, insta a tempo e fora de tempo, redargue, repreende, exorta com toda a longanimidade e doutrina.',
    label: 'Consagração Pastoral (2 Tm 4:2)',
  },
  {
    reference: '1 Timóteo 4:14',
    text: 'Não desprezes o dom que há em ti, o qual te foi dado por profecia, com a imposição das mãos do presbitério.',
    label: 'Imposição de Mãos (1 Tm 4:14)',
  },
  {
    reference: '1 Coríntios 13:7-8',
    text: 'O amor tudo sofre, tudo crê, tudo espera, tudo suporta. O amor jamais acaba.',
    label: 'Matrimônio & Aliança (1 Co 13)',
  },
  {
    reference: 'Romanos 16:1-2',
    text: 'Recomendo-vos a nossa irmã, para que a recebais no Senhor como convém aos santos e a ajudeis em tudo o que de vós necessitar.',
    label: 'Carta de Recomendação (Rm 16:1-2)',
  },
  {
    reference: '2 Timóteo 2:15',
    text: 'Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar, que maneja bem a palavra da verdade.',
    label: 'Conclusão de Curso Teológico (2 Tm 2:15)',
  },
  {
    reference: 'Malaquias 3:10',
    text: 'Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa...',
    label: 'Fidelidade & Dízimos (Ml 3:10)',
  },
  {
    reference: '1 Coríntios 12:27',
    text: 'Ora, vós sois o corpo de Cristo, e seus membros em particular.',
    label: 'Membresia Regular (1 Co 12:27)',
  },
];

export const DocumentCustomizer: React.FC<DocumentCustomizerProps> = ({
  currentDocument: doc,
  onDocumentChange,
  onSaveToRegistry,
  onOpenValidationModal,
}) => {
  const { members, currentTenant, addAuditLog } = useChurch();
  const [memberSearch, setMemberSearch] = useState('');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Template switch
  const handleSelectTemplate = (type: DocumentType) => {
    const meta = DOCUMENT_TEMPLATES[type];
    const { code, hash } = generateDocumentSecurityCode(type);

    onDocumentChange({
      ...doc,
      type,
      customTitle: meta.title,
      orientation: meta.defaultOrientation,
      verseReference: meta.defaultVerseReference,
      verseText: meta.defaultVerseText,
      officiantName: meta.defaultOfficiant,
      ministryOrRole: meta.defaultRoleOrMinistry || doc.ministryOrRole || 'Membro Ativo',
      registrationCode: code,
      securityHash: hash,
    });
  };

  // Quick auto-fill from member
  const handleSelectMember = (member: Person) => {
    onDocumentChange({
      ...doc,
      recipientName: member.full_name,
      recipientDocument: member.document,
      recipientMemberId: member.id,
      ministryOrRole: member.ministry || doc.ministryOrRole,
    });
    setMemberSearch('');
  };

  // Regenerate Code & Hash
  const handleRegenerateCode = () => {
    const { code, hash } = generateDocumentSecurityCode(doc.type);
    onDocumentChange({
      ...doc,
      registrationCode: code,
      securityHash: hash,
    });
  };

  // Download PDF
  const handleDownloadPdf = () => {
    exportDocumentToPdf(doc);
    addAuditLog(
      'EMISSAO_DOCUMENTO_PDF',
      'documentos',
      `Emitido PDF do ${DOCUMENT_TEMPLATES[doc.type].title} para ${doc.recipientName} (${doc.registrationCode})`
    );
  };

  // Print
  const handlePrint = () => {
    window.print();
    addAuditLog(
      'IMPRESSAO_DOCUMENTO',
      'documentos',
      `Impresso documento ${doc.registrationCode} (${doc.recipientName})`
    );
  };

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    const message = generateWhatsAppDocumentMessage(doc);
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  // Save to official book
  const handleSave = () => {
    onSaveToRegistry(doc);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  // Filtered members for dropdown
  const filteredMembers = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.document.includes(memberSearch)
  );

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. SELETOR DE TEMPLATES OFICIAIS                              */}
      {/* ------------------------------------------------------------- */}
      <div className="card-gold-glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#DAA017]/20 pb-2">
          <h3 className="font-serif text-sm font-bold text-[#F8F5EC] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#DAA017]" /> 1. Escolha o Tipo de Documento Eclesiástico
          </h3>
          <Badge variant="gold" size="sm">
            8 Modelos Oficiais
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(DOCUMENT_TEMPLATES) as DocumentType[]).map((typeKey) => {
            const meta = DOCUMENT_TEMPLATES[typeKey];
            const isSelected = doc.type === typeKey;

            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => handleSelectTemplate(typeKey)}
                className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#DAA017] text-[#1A1A1A] border-[#DAA017] font-bold shadow-md shadow-[#DAA017]/25'
                    : 'bg-[#1A140E] text-[#F8F5EC]/80 border-[#DAA017]/20 hover:border-[#DAA017]/50 hover:bg-[#2A2015]'
                }`}
              >
                <div>
                  <span
                    className={`text-[9px] uppercase tracking-wider block font-semibold ${
                      isSelected ? 'text-[#1A1A1A]/80' : 'text-[#DAA017]'
                    }`}
                  >
                    {meta.badge}
                  </span>
                  <h4 className="font-serif text-xs leading-tight mt-0.5">{meta.title}</h4>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] opacity-75">
                  <span>{meta.defaultOrientation === 'landscape' ? 'Paisagem (A4)' : 'Retrato (A4)'}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1A1A1A]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. DADOS DO DESTINATÁRIO & MEMBRO                             */}
      {/* ------------------------------------------------------------- */}
      <div className="card-gold-glass rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAA017]/20 pb-2">
          <h3 className="font-serif text-sm font-bold text-[#F8F5EC] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#DAA017]" /> 2. Titular do Documento & Preenchimento Automático
          </h3>

          {/* Quick Member Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar membro no rol..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full bg-[#1A140E] text-xs text-[#F8F5EC] placeholder-[#F8F5EC]/40 rounded-xl px-3 py-1.5 pl-8 border border-[#DAA017]/30 focus:outline-none focus:ring-1 focus:ring-[#DAA017]"
            />
            <Search className="w-3.5 h-3.5 text-[#DAA017] absolute left-2.5 top-2" />

            {/* Member Dropdown */}
            {memberSearch.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#1A140E] border border-[#DAA017]/40 rounded-xl shadow-2xl z-40 max-h-48 overflow-y-auto divide-y divide-[#DAA017]/10">
                {filteredMembers.slice(0, 6).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMember(m)}
                    className="w-full text-left p-2 hover:bg-[#2A2015] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-serif text-xs font-bold text-[#F8F5EC] block">
                        {m.full_name}
                      </span>
                      <span className="text-[10px] text-[#DAA017]">{m.ministry || 'Membro'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#F8F5EC]/50">{m.document}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#DAA017] block mb-1">
              Nome Completo do Destinatário(a) *
            </label>
            <input
              type="text"
              value={doc.recipientName}
              onChange={(e) => onDocumentChange({ ...doc, recipientName: e.target.value })}
              className="w-full bg-[#1A140E] text-sm text-[#F8F5EC] rounded-xl px-3.5 py-2 border border-[#DAA017]/30 focus:ring-1 focus:ring-[#DAA017] focus:outline-none"
              placeholder="Ex: Matheus Henrique Silveira"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#DAA017] block mb-1">
              CPF / Documento Oficial
            </label>
            <input
              type="text"
              value={doc.recipientDocument || ''}
              onChange={(e) => onDocumentChange({ ...doc, recipientDocument: e.target.value })}
              className="w-full bg-[#1A140E] text-sm text-[#F8F5EC] rounded-xl px-3.5 py-2 border border-[#DAA017]/30 focus:ring-1 focus:ring-[#DAA017] focus:outline-none font-mono"
              placeholder="Ex: 123.456.789-00"
            />
          </div>

          {/* Conditional inputs by type */}
          {doc.type === 'presentation' && (
            <>
              <div>
                <label className="text-xs font-semibold text-[#DAA017] block mb-1">Nome do Pai</label>
                <input
                  type="text"
                  value={doc.fatherName || ''}
                  onChange={(e) => onDocumentChange({ ...doc, fatherName: e.target.value })}
                  className="w-full bg-[#1A140E] text-sm text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none"
                  placeholder="Nome do Pai"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#DAA017] block mb-1">Nome da Mãe</label>
                <input
                  type="text"
                  value={doc.motherName || ''}
                  onChange={(e) => onDocumentChange({ ...doc, motherName: e.target.value })}
                  className="w-full bg-[#1A140E] text-sm text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none"
                  placeholder="Nome da Mãe"
                />
              </div>
            </>
          )}

          {doc.type === 'ordination' && (
            <div>
              <label className="text-xs font-semibold text-[#DAA017] block mb-1">
                Cargo / Função de Consagração *
              </label>
              <select
                value={doc.ministryOrRole || 'Pastor(a) Auxiliar'}
                onChange={(e) => onDocumentChange({ ...doc, ministryOrRole: e.target.value })}
                className="w-full bg-[#1A140E] text-sm text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none"
              >
                <option value="Pastor(a) Titular">Pastor(a) Titular</option>
                <option value="Pastor(a) Auxiliar">Pastor(a) Auxiliar</option>
                <option value="Bispo(a) / Apóstolo(a)">Bispo(a) / Apóstolo(a)</option>
                <option value="Presbítero(a)">Presbítero(a)</option>
                <option value="Evangelista">Evangelista</option>
                <option value="Diácono / Diaconisa">Diácono / Diaconisa</option>
                <option value="Missionário(a)">Missionário(a)</option>
                <option value="Ministro(a) de Louvor">Ministro(a) de Louvor</option>
              </select>
            </div>
          )}

          {doc.type === 'marriage' && (
            <div>
              <label className="text-xs font-semibold text-[#DAA017] block mb-1">Nome do(a) Cônjuge *</label>
              <input
                type="text"
                value={doc.spouseName || ''}
                onChange={(e) => onDocumentChange({ ...doc, spouseName: e.target.value })}
                className="w-full bg-[#1A140E] text-sm text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none"
                placeholder="Ex: Amanda Santos Silveira"
              />
            </div>
          )}

          {doc.type === 'recommendation' && (
            <>
              <div>
                <label className="text-xs font-semibold text-[#DAA017] block mb-1">Igreja de Destino</label>
                <input
                  type="text"
                  value={doc.destinationChurch || ''}
                  onChange={(e) => onDocumentChange({ ...doc, destinationChurch: e.target.value })}
                  className="w-full bg-[#1A140E] text-sm text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none"
                  placeholder="Ex: Igreja Apostólica Boas Novas - Sede Regional"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#DAA017] block mb-1">Cidade / Estado de Destino</label>
                <input
                  type="text"
                  value={doc.destinationCity || ''}
                  onChange={(e) => onDocumentChange({ ...doc, destinationCity: e.target.value })}
                  className="w-full bg-[#1A140E] text-sm text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none"
                  placeholder="Ex: Curitiba - PR"
                />
              </div>
            </>
          )}

          {doc.type === 'course_completion' && (
            <>
              <div>
                <label className="text-xs font-semibold text-[#DAA017] block mb-1">Nome do Curso / Treinamento</label>
                <input
                  type="text"
                  value={doc.courseName || ''}
                  onChange={(e) => onDocumentChange({ ...doc, courseName: e.target.value })}
                  className="w-full bg-[#1A140E] text-sm text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none"
                  placeholder="Ex: Escola Bíblica de Liderança Apostólica"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#DAA017] block mb-1">Carga Horária (Horas)</label>
                <input
                  type="number"
                  value={doc.workloadHours || 40}
                  onChange={(e) => onDocumentChange({ ...doc, workloadHours: Number(e.target.value) })}
                  className="w-full bg-[#1A140E] text-sm text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none font-mono"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. VERSÍCULO BÍBLICO & MINISTRANTES                           */}
      {/* ------------------------------------------------------------- */}
      <div className="card-gold-glass rounded-2xl p-5 space-y-4">
        <h3 className="font-serif text-sm font-bold text-[#F8F5EC] flex items-center gap-2 border-b border-[#DAA017]/20 pb-2">
          <BookOpen className="w-4 h-4 text-[#DAA017]" /> 3. Versículo Bíblico & Autoridades Assinantes
        </h3>

        {/* Verses Presets */}
        <div>
          <label className="text-xs font-semibold text-[#DAA017] block mb-1">
            Escolher Versículo Sugerido:
          </label>
          <select
            onChange={(e) => {
              const found = SCRIPTURE_PRESETS.find((p) => p.reference === e.target.value);
              if (found) {
                onDocumentChange({
                  ...doc,
                  verseReference: found.reference,
                  verseText: found.text,
                });
              }
            }}
            value={doc.verseReference}
            className="w-full bg-[#1A140E] text-xs text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none"
          >
            {SCRIPTURE_PRESETS.map((p) => (
              <option key={p.reference} value={p.reference}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#DAA017] block mb-1">Texto Bíblico Impresso</label>
          <textarea
            rows={2}
            value={doc.verseText}
            onChange={(e) => onDocumentChange({ ...doc, verseText: e.target.value })}
            className="w-full bg-[#1A140E] text-xs text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none font-serif italic"
          />
        </div>

        {/* Signatories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#DAA017] block mb-1">Ministrante Principal</label>
            <input
              type="text"
              value={doc.officiantName}
              onChange={(e) => onDocumentChange({ ...doc, officiantName: e.target.value })}
              className="w-full bg-[#1A140E] text-xs text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none"
            />
            <input
              type="text"
              value={doc.officiantRole}
              onChange={(e) => onDocumentChange({ ...doc, officiantRole: e.target.value })}
              className="w-full bg-[#1A140E] text-[11px] text-[#DAA017] rounded-xl px-3 py-1.5 border border-[#DAA017]/20 focus:outline-none mt-1"
              placeholder="Cargo Eclesiástico"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#DAA017] block mb-1">Segundo Assinante / Secretaria</label>
            <input
              type="text"
              value={doc.secondSignatoryName || 'Bispa Helena Silveira'}
              onChange={(e) => onDocumentChange({ ...doc, secondSignatoryName: e.target.value })}
              className="w-full bg-[#1A140E] text-xs text-[#F8F5EC] rounded-xl px-3 py-2 border border-[#DAA017]/30 focus:outline-none"
            />
            <input
              type="text"
              value={doc.secondSignatoryRole || 'Conselho Apostólico & Secretaria'}
              onChange={(e) => onDocumentChange({ ...doc, secondSignatoryRole: e.target.value })}
              className="w-full bg-[#1A140E] text-[11px] text-[#DAA017] rounded-xl px-3 py-1.5 border border-[#DAA017]/20 focus:outline-none mt-1"
              placeholder="Cargo Eclesiástico"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. DESIGN, TEMA & OPÇÕES DE SEGURANÇA                          */}
      {/* ------------------------------------------------------------- */}
      <div className="card-gold-glass rounded-2xl p-5 space-y-4">
        <h3 className="font-serif text-sm font-bold text-[#F8F5EC] flex items-center gap-2 border-b border-[#DAA017]/20 pb-2">
          <Palette className="w-4 h-4 text-[#DAA017]" /> 4. Identidade Visual, Tema & Livro de Registro
        </h3>

        {/* Theme & Orientation Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#DAA017] block mb-1.5">
              Tema Visual do Documento:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'prestige_gold_dark', label: 'Gold Escuro' },
                { id: 'royal_ivory_light', label: 'Marfim Impresso' },
                { id: 'apostolic_glass', label: 'Glass Luxury' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onDocumentChange({ ...doc, theme: theme.id as DocumentTheme })}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border ${
                    doc.theme === theme.id
                      ? 'bg-[#DAA017] text-[#1A1A1A] border-[#DAA017] shadow-sm'
                      : 'bg-[#1A140E] text-[#F8F5EC]/70 border-[#DAA017]/20 hover:bg-[#2A2015]'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#DAA017] block mb-1.5">
              Orientação do Papel (A4):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'landscape', label: 'Paisagem (Certificados)' },
                { id: 'portrait', label: 'Retrato (Cartas/Ofícios)' },
              ].map((orient) => (
                <button
                  key={orient.id}
                  type="button"
                  onClick={() =>
                    onDocumentChange({ ...doc, orientation: orient.id as DocumentOrientation })
                  }
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border ${
                    doc.orientation === orient.id
                      ? 'bg-[#DAA017] text-[#1A1A1A] border-[#DAA017] shadow-sm'
                      : 'bg-[#1A140E] text-[#F8F5EC]/70 border-[#DAA017]/20 hover:bg-[#2A2015]'
                  }`}
                >
                  {orient.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Watermark Toggles */}
        <div className="pt-2 border-t border-[#DAA017]/15 flex flex-wrap items-center justify-between gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#F8F5EC]">
            <input
              type="checkbox"
              checked={doc.includeWatermark}
              onChange={(e) => onDocumentChange({ ...doc, includeWatermark: e.target.checked })}
              className="rounded border-[#DAA017] bg-[#1A140E] text-[#DAA017]"
            />
            <span>Marca D'água do Brasão</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#F8F5EC]">
            <input
              type="checkbox"
              checked={doc.includeGoldSeal}
              onChange={(e) => onDocumentChange({ ...doc, includeGoldSeal: e.target.checked })}
              className="rounded border-[#DAA017] bg-[#1A140E] text-[#DAA017]"
            />
            <span>Selo 3D Alto-Relevo Dourado</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#DAA017]">
            <input
              type="checkbox"
              checked={doc.includeQrCode}
              onChange={(e) => onDocumentChange({ ...doc, includeQrCode: e.target.checked })}
              className="rounded border-[#DAA017] bg-[#1A140E] text-[#DAA017]"
            />
            <span>QR Code de Autenticidade Digital</span>
          </label>
        </div>

        {/* Book, Sheet, Registry and Code */}
        <div className="p-3.5 rounded-xl bg-[#120E09] border border-[#DAA017]/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-[#DAA017] block font-semibold">Livro Nº</label>
            <input
              type="text"
              value={doc.bookNumber}
              onChange={(e) => onDocumentChange({ ...doc, bookNumber: e.target.value })}
              className="w-full bg-[#1A140E] text-xs text-[#F8F5EC] rounded-lg px-2 py-1 border border-[#DAA017]/30 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#DAA017] block font-semibold">Folha Nº</label>
            <input
              type="text"
              value={doc.pageNumber}
              onChange={(e) => onDocumentChange({ ...doc, pageNumber: e.target.value })}
              className="w-full bg-[#1A140E] text-xs text-[#F8F5EC] rounded-lg px-2 py-1 border border-[#DAA017]/30 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#DAA017] block font-semibold">Registro Nº</label>
            <input
              type="text"
              value={doc.entryNumber}
              onChange={(e) => onDocumentChange({ ...doc, entryNumber: e.target.value })}
              className="w-full bg-[#1A140E] text-xs text-[#F8F5EC] rounded-lg px-2 py-1 border border-[#DAA017]/30 font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#DAA017] block font-semibold">Código Oficial</label>
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono font-bold text-emerald-400 truncate">
                {doc.registrationCode}
              </span>
              <button
                type="button"
                onClick={handleRegenerateCode}
                title="Gerar novo código e hash"
                className="text-[#DAA017] hover:scale-110 p-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. BARRA DE AÇÕES PRINCIPAIS                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-[#1A140E] border border-[#DAA017]/40 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={onOpenValidationModal}
            className="text-xs"
          >
            Validar Autenticidade
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Share2}
            onClick={handleShareWhatsApp}
            className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/30"
          >
            {copiedWhatsApp ? 'Enviando WhatsApp...' : 'Enviar no WhatsApp'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            icon={Printer}
            onClick={handlePrint}
            className="font-semibold"
          >
            Imprimir A4
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Download}
            onClick={handleDownloadPdf}
            className="font-bold shadow-md shadow-[#DAA017]/25"
          >
            Baixar PDF Oficial
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={Check}
            onClick={handleSave}
            className="border-[#DAA017]/50 text-[#DAA017]"
          >
            {isSavedSuccess ? 'Salvo no Livro!' : 'Registrar no Livro'}
          </Button>
        </div>
      </div>
    </div>
  );
};
