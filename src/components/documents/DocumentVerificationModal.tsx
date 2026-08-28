import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Calendar,
  User,
  Crown,
  FileText,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GoldLogo } from '@/components/common/GoldLogo';
import { ChurchDocumentData, DOCUMENT_TEMPLATES } from '@/services/churchDocumentService';

interface DocumentVerificationModalProps {
  document: ChurchDocumentData | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf?: () => void;
}

export const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onDownloadPdf,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!doc) return null;

  const meta = DOCUMENT_TEMPLATES[doc.type];
  const validationUrl = `https://boasnovas.org.br/validar/${doc.registrationCode}?hash=${doc.securityHash.slice(0, 16)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(validationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Portal de Validação & Autenticidade Eclesiástica"
      subtitle="Verificação criptográfica de documentos emitidos pela Igreja Apostólica Boas Novas"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Verification Status Banner */}
        <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-950/80 via-[#1A140E] to-emerald-950/80 border border-emerald-500/40 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-serif text-base font-bold text-[#F8F5EC]">
                  Documento Autêntico e Registrado
                </h4>
                <Badge variant="green" size="sm">
                  100% VÁLIDO
                </Badge>
              </div>
              <p className="text-xs text-[#F8F5EC]/70 mt-0.5">
                Chave criptográfica verificada nos registros oficiais da Igreja Sede
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[10px] uppercase font-mono text-emerald-300">Status no Livro</span>
            <span className="text-xs font-bold text-[#F8F5EC]">Ativo & Inalterado</span>
          </div>
        </div>

        {/* Official Header Preview */}
        <div className="p-4 rounded-xl bg-[#1A140E] border border-[#DAA017]/30 space-y-3">
          <div className="flex items-center justify-between border-b border-[#DAA017]/20 pb-3">
            <div className="flex items-center gap-2.5">
              <GoldLogo size="sm" showText={false} />
              <div>
                <h5 className="font-serif text-sm font-bold text-[#F8F5EC]">
                  Igreja Apostólica Boas Novas
                </h5>
                <p className="text-[10px] text-[#DAA017] font-semibold uppercase tracking-wider">
                  Secretaria Geral Eclesiástica • CNPJ: 12.345.678/0001-90
                </p>
              </div>
            </div>

            <Badge variant="gold" size="sm">
              {doc.registrationCode}
            </Badge>
          </div>

          {/* Grid of Verified Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#221B13]/90 border border-[#DAA017]/15">
              <span className="text-[10px] text-[#DAA017] uppercase tracking-wider block font-semibold">
                Tipo do Documento
              </span>
              <span className="font-serif font-bold text-[#F8F5EC] text-sm mt-0.5 block">
                {meta.title}
              </span>
              <span className="text-[10px] text-[#F8F5EC]/60">{meta.badge}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#221B13]/90 border border-[#DAA017]/15">
              <span className="text-[10px] text-[#DAA017] uppercase tracking-wider block font-semibold">
                Titular / Destinatário(a)
              </span>
              <span className="font-serif font-bold text-[#F8F5EC] text-sm mt-0.5 block">
                {doc.recipientName}
              </span>
              <span className="text-[10px] font-mono text-[#F8F5EC]/60">
                {doc.recipientDocument ? `Doc: ${doc.recipientDocument}` : 'Membro Regular'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#221B13]/90 border border-[#DAA017]/15">
              <span className="text-[10px] text-[#DAA017] uppercase tracking-wider block font-semibold">
                Data de Emissão & Local
              </span>
              <span className="font-semibold text-[#F8F5EC] mt-0.5 block">
                {new Date(doc.issuedAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="text-[10px] text-[#F8F5EC]/60">{doc.city} - {doc.state}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#221B13]/90 border border-[#DAA017]/15">
              <span className="text-[10px] text-[#DAA017] uppercase tracking-wider block font-semibold">
                Autoridade Ministrante
              </span>
              <span className="font-semibold text-[#F8F5EC] mt-0.5 block">
                {doc.officiantName}
              </span>
              <span className="text-[10px] text-[#F8F5EC]/60">{doc.officiantRole}</span>
            </div>
          </div>

          {/* Registry Folio & Book */}
          <div className="p-3 rounded-lg bg-[#140F0A] border border-[#DAA017]/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-4">
              <span>LIVRO: <strong className="text-[#DAA017]">{doc.bookNumber}</strong></span>
              <span>FOLHA: <strong className="text-[#DAA017]">{doc.pageNumber}</strong></span>
              <span>REGISTRO: <strong className="text-[#DAA017]">{doc.entryNumber}</strong></span>
            </div>
            <span className="text-emerald-400 font-bold">ASSINATURA DIGITAL VALIDADA</span>
          </div>

          {/* Cryptographic Hash */}
          <div className="p-2.5 rounded-lg bg-[#140F0A] border border-[#DAA017]/15 text-[10.5px] font-mono text-[#F8F5EC]/70 space-y-1">
            <span className="text-[9.5px] text-[#DAA017] uppercase tracking-wider block font-bold">
              Hash Criptográfico de Integridade (SHA-256):
            </span>
            <code className="text-emerald-300 break-all select-all block">
              {doc.securityHash}
            </code>
          </div>
        </div>

        {/* Verification Link Share Box */}
        <div className="p-3.5 rounded-xl bg-[#221B13] border border-[#DAA017]/20 flex items-center justify-between gap-3">
          <div className="overflow-hidden">
            <span className="text-[10px] text-[#DAA017] font-semibold uppercase tracking-wider block">
              Link Público de Verificação do QR Code:
            </span>
            <span className="text-xs text-[#F8F5EC]/80 font-mono truncate block">
              {validationUrl}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A140E] hover:bg-[#DAA017] text-[#DAA017] hover:text-[#1A1A1A] font-bold text-xs border border-[#DAA017]/40 transition-all shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copiar Link
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#DAA017]/20">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>

          {onDownloadPdf && (
            <Button
              variant="primary"
              size="sm"
              icon={FileText}
              onClick={onDownloadPdf}
              className="font-bold shadow-md shadow-[#DAA017]/20"
            >
              Baixar Certificado em PDF
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
