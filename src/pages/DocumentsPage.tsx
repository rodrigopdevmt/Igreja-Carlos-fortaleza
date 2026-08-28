import React, { useState } from 'react';
import {
  FileText,
  Award,
  Sparkles,
  Plus,
  BookOpen,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  Crown,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { useChurch } from '@/context/ChurchContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MetricCard } from '@/components/ui/MetricCard';
import {
  ChurchDocumentData,
  DocumentType,
  DOCUMENT_TEMPLATES,
  INITIAL_ISSUED_DOCUMENTS,
  generateDocumentSecurityCode,
  exportDocumentToPdf,
} from '@/services/churchDocumentService';
import { DocumentPreviewCanvas } from '@/components/documents/DocumentPreviewCanvas';
import { DocumentCustomizer } from '@/components/documents/DocumentCustomizer';
import { IssuedDocumentsList } from '@/components/documents/IssuedDocumentsList';
import { DocumentVerificationModal } from '@/components/documents/DocumentVerificationModal';

export const DocumentsPage: React.FC = () => {
  const { currentTenant, members, addAuditLog } = useChurch();

  // Storage of issued documents
  const [documentsRegistry, setDocumentsRegistry] = useState<ChurchDocumentData[]>(INITIAL_ISSUED_DOCUMENTS);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'studio' | 'registry' | 'templates'>('studio');

  // Currently editing document in Studio
  const [currentDocument, setCurrentDocument] = useState<ChurchDocumentData>(() => {
    const defaultMeta = DOCUMENT_TEMPLATES.baptism;
    const { code, hash } = generateDocumentSecurityCode('baptism');

    return {
      id: `doc-${Date.now()}`,
      type: 'baptism',
      registrationCode: code,
      securityHash: hash,
      recipientName: members[3]?.full_name || 'Matheus Henrique Silveira',
      recipientDocument: members[3]?.document || '456.789.012-33',
      recipientMemberId: members[3]?.id || 'mem-4',
      ministryOrRole: 'Membro Batizado / Ministério de Louvor',
      officiantName: 'Apóstolo Carlos Alberto Silveira',
      officiantRole: 'Pastor Presidente & Fundador',
      secondSignatoryName: 'Bispa Helena Silveira',
      secondSignatoryRole: 'Conselho Pastoral & Secretaria',
      verseReference: defaultMeta.defaultVerseReference,
      verseText: defaultMeta.defaultVerseText,
      bookNumber: '12',
      pageNumber: '48',
      entryNumber: '0392',
      theme: 'prestige_gold_dark',
      orientation: 'landscape',
      includeWatermark: true,
      includeGoldSeal: true,
      includeQrCode: true,
      includeSignatures: true,
      issuedAt: new Date().toISOString(),
      city: currentTenant.city || 'São Paulo',
      state: currentTenant.state || 'SP',
      tenantName: currentTenant.name,
      tenantCnpj: '12.345.678/0001-90',
      status: 'valid',
    };
  });

  // Canvas zoom/scale
  const [canvasScale, setCanvasScale] = useState(0.85);

  // Modal validation state
  const [validationModalDoc, setValidationModalDoc] = useState<ChurchDocumentData | null>(null);

  // Stats calculation
  const totalIssued = documentsRegistry.length;
  const totalBaptisms = documentsRegistry.filter((d) => d.type === 'baptism').length;
  const totalOrdinations = documentsRegistry.filter((d) => d.type === 'ordination').length;
  const totalRecommendations = documentsRegistry.filter((d) => d.type === 'recommendation').length;

  // Handle saving to registry
  const handleSaveToRegistry = (docToSave: ChurchDocumentData) => {
    setDocumentsRegistry((prev) => {
      const exists = prev.some((d) => d.id === docToSave.id);
      if (exists) {
        return prev.map((d) => (d.id === docToSave.id ? docToSave : d));
      }
      return [docToSave, ...prev];
    });

    addAuditLog(
      'REGISTRO_DOCUMENTO_LIVRO',
      'documentos',
      `Registrado no Livro ${docToSave.bookNumber} o documento ${docToSave.registrationCode} (${docToSave.recipientName})`
    );
  };

  const handleStartNewDocument = (type: DocumentType = 'baptism') => {
    const meta = DOCUMENT_TEMPLATES[type];
    const { code, hash } = generateDocumentSecurityCode(type);

    const newDoc: ChurchDocumentData = {
      id: `doc-${Date.now()}`,
      type,
      registrationCode: code,
      securityHash: hash,
      recipientName: members[0]?.full_name || 'Novo Membro',
      recipientDocument: members[0]?.document || '',
      recipientMemberId: members[0]?.id || '',
      ministryOrRole: meta.defaultRoleOrMinistry || 'Membro Ativo',
      officiantName: meta.defaultOfficiant,
      officiantRole: 'Pastor Presidente',
      secondSignatoryName: 'Bispa Helena Silveira',
      secondSignatoryRole: 'Conselho Apostólico & Secretaria',
      verseReference: meta.defaultVerseReference,
      verseText: meta.defaultVerseText,
      bookNumber: '12',
      pageNumber: '50',
      entryNumber: `${Math.floor(100 + Math.random() * 900)}`,
      theme: 'prestige_gold_dark',
      orientation: meta.defaultOrientation,
      includeWatermark: true,
      includeGoldSeal: true,
      includeQrCode: true,
      includeSignatures: true,
      issuedAt: new Date().toISOString(),
      city: currentTenant.city || 'São Paulo',
      state: currentTenant.state || 'SP',
      tenantName: currentTenant.name,
      tenantCnpj: '12.345.678/0001-90',
      status: 'valid',
    };

    setCurrentDocument(newDoc);
    setActiveTab('studio');
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. Header & Quick Metrics                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F8F5EC]">
              Estúdio de Documentos & Certificados Eclesiásticos
            </h1>
            <Badge variant="gold" size="sm">
              Identidade Oficial
            </Badge>
          </div>
          <p className="text-sm text-[#F8F5EC]/70 mt-1">
            Geração ultra-moderna de certificados de batismo, ordenações, cartas pastorais e atas com validação criptográfica por QR Code
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => handleStartNewDocument('baptism')}
            className="font-bold shadow-lg shadow-[#DAA017]/20"
          >
            Novo Documento
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registrados"
          value={totalIssued}
          icon={FileText}
          badge="Livro Oficial"
        />
        <MetricCard
          title="Batismos nas Águas"
          value={totalBaptisms}
          icon={Sparkles}
          badge="Sacramentos"
        />
        <MetricCard
          title="Consagrações"
          value={totalOrdinations}
          icon={Crown}
          badge="Ministerial"
        />
        <MetricCard
          title="Cartas & Mudanças"
          value={totalRecommendations}
          icon={BookOpen}
          badge="Membresia"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DAA017]/20 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'studio'
                ? 'bg-[#DAA017] text-[#1A1A1A] shadow-md shadow-[#DAA017]/20'
                : 'bg-[#1A140E] text-[#F8F5EC]/70 hover:bg-[#2A2015] border border-[#DAA017]/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Estúdio & Gerador Interativo
          </button>

          <button
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'registry'
                ? 'bg-[#DAA017] text-[#1A1A1A] shadow-md shadow-[#DAA017]/20'
                : 'bg-[#1A140E] text-[#F8F5EC]/70 hover:bg-[#2A2015] border border-[#DAA017]/20'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Livro de Registros ({documentsRegistry.length})
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'templates'
                ? 'bg-[#DAA017] text-[#1A1A1A] shadow-md shadow-[#DAA017]/20'
                : 'bg-[#1A140E] text-[#F8F5EC]/70 hover:bg-[#2A2015] border border-[#DAA017]/20'
            }`}
          >
            <Layers className="w-4 h-4" />
            Catálogo de Modelos Eclesiásticos
          </button>
        </div>

        {activeTab === 'studio' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#F8F5EC]/60 hidden sm:inline">Zoom Canvas:</span>
            <button
              onClick={() => setCanvasScale((prev) => Math.max(0.4, Number((prev - 0.05).toFixed(2))))}
              className="p-1.5 rounded-lg bg-[#1A140E] text-[#DAA017] border border-[#DAA017]/30 hover:bg-[#2A2015]"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-semibold text-[#DAA017]">
              {Math.round(canvasScale * 100)}%
            </span>
            <button
              onClick={() => setCanvasScale((prev) => Math.min(1.2, Number((prev + 0.05).toFixed(2))))}
              className="p-1.5 rounded-lg bg-[#1A140E] text-[#DAA017] border border-[#DAA017]/30 hover:bg-[#2A2015]"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCanvasScale(0.85)}
              className="text-[11px] px-2 py-1 rounded-lg bg-[#1A140E] text-[#F8F5EC]/70 border border-[#DAA017]/20 hover:text-[#DAA017]"
            >
              Ajustar
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TAB: ESTÚDIO & GERADOR INTERATIVO                           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Controls Column (5 Cols) */}
          <div className="xl:col-span-5 space-y-4">
            <DocumentCustomizer
              currentDocument={currentDocument}
              onDocumentChange={setCurrentDocument}
              onSaveToRegistry={handleSaveToRegistry}
              onOpenValidationModal={() => setValidationModalDoc(currentDocument)}
            />
          </div>

          {/* Live Canvas Visual Preview (7 Cols) */}
          <div className="xl:col-span-7 sticky top-6">
            <div className="card-gold-glass rounded-2xl p-6 overflow-hidden flex flex-col items-center justify-center border border-[#DAA017]/30 bg-gradient-to-b from-[#1E1710] to-[#120E09] shadow-2xl min-h-[600px]">
              <div className="w-full flex items-center justify-between border-b border-[#DAA017]/20 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-serif font-bold text-[#F8F5EC]">
                    Visualização em Tempo Real (A4 Proporcional)
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <Badge variant="gold" size="sm">
                    {currentDocument.orientation === 'landscape' ? 'A4 Paisagem' : 'A4 Retrato'}
                  </Badge>
                  <button
                    onClick={() => setValidationModalDoc(currentDocument)}
                    className="text-[#DAA017] hover:underline flex items-center gap-1 font-semibold text-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Testar QR
                  </button>
                </div>
              </div>

              {/* Responsive Container for Scaling */}
              <div className="w-full overflow-x-auto flex justify-center py-4">
                <DocumentPreviewCanvas
                  document={currentDocument}
                  scale={canvasScale}
                  onVerifyClick={() => setValidationModalDoc(currentDocument)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. TAB: LIVRO DE REGISTROS & HISTÓRICO                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'registry' && (
        <IssuedDocumentsList
          documents={documentsRegistry}
          onSelectDocument={(doc) => {
            setCurrentDocument(doc);
            setActiveTab('studio');
          }}
          onOpenValidationModal={(doc) => setValidationModalDoc(doc)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. TAB: CATÁLOGO DE MODELOS                                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Object.keys(DOCUMENT_TEMPLATES) as DocumentType[]).map((typeKey) => {
            const meta = DOCUMENT_TEMPLATES[typeKey];

            return (
              <div
                key={typeKey}
                className="card-gold-glass rounded-2xl p-6 border border-[#DAA017]/30 hover:border-[#DAA017] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="gold" size="sm">
                      {meta.badge}
                    </Badge>
                    <span className="text-[11px] font-mono text-[#F8F5EC]/50 uppercase">
                      {meta.defaultOrientation === 'landscape' ? 'A4 Paisagem' : 'A4 Retrato'}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#F8F5EC] group-hover:text-[#DAA017] transition-colors mb-2">
                    {meta.title}
                  </h3>

                  <p className="text-xs text-[#F8F5EC]/70 leading-relaxed mb-4">
                    {meta.description}
                  </p>

                  <div className="p-3 rounded-xl bg-[#140F0A] border border-[#DAA017]/15 space-y-1 mb-4 text-xs font-serif italic text-[#DAA017]">
                    <p>"{meta.defaultVerseText.slice(0, 100)}..."</p>
                    <p className="text-right font-bold font-sans text-[10px]">— {meta.defaultVerseReference}</p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => handleStartNewDocument(typeKey)}
                  className="w-full justify-center font-bold"
                >
                  Emitir {meta.title.split(' ')[1] || 'Documento'}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL DE VALIDAÇÃO DIGITAL DO DOCUMENTO                    */}
      {/* ------------------------------------------------------------- */}
      <DocumentVerificationModal
        document={validationModalDoc}
        isOpen={Boolean(validationModalDoc)}
        onClose={() => setValidationModalDoc(null)}
        onDownloadPdf={validationModalDoc ? () => exportDocumentToPdf(validationModalDoc) : undefined}
      />
    </div>
  );
};
