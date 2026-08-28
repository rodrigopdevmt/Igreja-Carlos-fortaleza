import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Printer,
  Share2,
  ShieldCheck,
  Eye,
  CheckCircle,
  Clock,
  Filter,
  Trash2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ChurchDocumentData,
  DOCUMENT_TEMPLATES,
  exportDocumentToPdf,
  generateWhatsAppDocumentMessage,
} from '@/services/churchDocumentService';
import { useChurch } from '@/context/ChurchContext';

interface IssuedDocumentsListProps {
  documents: ChurchDocumentData[];
  onSelectDocument: (doc: ChurchDocumentData) => void;
  onOpenValidationModal: (doc: ChurchDocumentData) => void;
  onRevokeDocument?: (id: string) => void;
}

export const IssuedDocumentsList: React.FC<IssuedDocumentsListProps> = ({
  documents,
  onSelectDocument,
  onOpenValidationModal,
  onRevokeDocument,
}) => {
  const { addAuditLog } = useChurch();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      doc.registrationCode.toLowerCase().includes(search.toLowerCase()) ||
      (doc.recipientDocument && doc.recipientDocument.includes(search));
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDownloadSinglePdf = (doc: ChurchDocumentData) => {
    exportDocumentToPdf(doc);
    addAuditLog(
      'REEMISSAO_PDF',
      'documentos',
      `Reemitido PDF de ${doc.registrationCode} para ${doc.recipientName}`
    );
  };

  const handleShareSingleWhatsApp = (doc: ChurchDocumentData) => {
    const message = generateWhatsAppDocumentMessage(doc);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 text-xs w-full sm:w-auto">
          {[
            { id: 'all', label: 'Todos os Registros' },
            { id: 'baptism', label: 'Batismos' },
            { id: 'ordination', label: 'Ordenações' },
            { id: 'recommendation', label: 'Cartas' },
            { id: 'presentation', label: 'Apresentações' },
            { id: 'marriage', label: 'Casamentos' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTypeFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                typeFilter === item.id
                  ? 'bg-[#DAA017] text-[#1A1A1A] shadow-md shadow-[#DAA017]/20 font-bold'
                  : 'bg-[#1A140E] text-[#F8F5EC]/70 hover:bg-[#2A2015] border border-[#DAA017]/20'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A140E] text-[#F8F5EC] text-xs placeholder-[#F8F5EC]/40 rounded-xl px-3 py-2 pl-8 border border-[#DAA017]/30 focus:outline-none focus:ring-1 focus:ring-[#DAA017]"
          />
          <Search className="w-3.5 h-3.5 text-[#DAA017] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Table of Issued Documents */}
      <div className="card-gold-glass rounded-2xl overflow-hidden border border-[#DAA017]/25">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A140E] border-b border-[#DAA017]/25 text-[#DAA017] uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Código & Tipo</th>
                <th className="py-3 px-4">Destinatário(a) / Membro</th>
                <th className="py-3 px-4">Livro & Registro</th>
                <th className="py-3 px-4">Data de Emissão</th>
                <th className="py-3 px-4">Autoridade</th>
                <th className="py-3 px-4">Status & Hash</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DAA017]/10 font-sans text-xs">
              {filteredDocs.map((doc) => {
                const meta = DOCUMENT_TEMPLATES[doc.type];

                return (
                  <tr key={doc.id} className="hover:bg-[#2A2015]/40 transition-colors">
                    {/* Code & Type */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-emerald-400">
                          {doc.registrationCode}
                        </span>
                        <span className="font-serif text-[11px] text-[#F8F5EC] mt-0.5">
                          {meta.title}
                        </span>
                        <span className="text-[9px] text-[#DAA017] uppercase font-semibold">
                          {meta.badge}
                        </span>
                      </div>
                    </td>

                    {/* Recipient */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-[#F8F5EC] text-sm">
                          {doc.recipientName}
                        </span>
                        <span className="text-[10px] font-mono text-[#F8F5EC]/60">
                          {doc.recipientDocument ? `CPF: ${doc.recipientDocument}` : 'Membro Regular'}
                        </span>
                        {doc.ministryOrRole && (
                          <span className="text-[10px] text-[#DAA017] mt-0.5">
                            {doc.ministryOrRole}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Book & Sheet */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="flex flex-col text-[#F8F5EC]/80">
                        <span>Livro: <strong className="text-[#DAA017]">{doc.bookNumber}</strong></span>
                        <span>Folha: <strong className="text-[#DAA017]">{doc.pageNumber}</strong></span>
                        <span>Reg: <strong className="text-[#DAA017]">{doc.entryNumber}</strong></span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[#F8F5EC]/80">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(doc.issuedAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-[10px] text-[#F8F5EC]/50 font-mono">
                          {new Date(doc.issuedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* Officiant */}
                    <td className="py-3.5 px-4">
                      <span className="font-serif text-[#F8F5EC] block font-semibold text-[11px]">
                        {doc.officiantName}
                      </span>
                      <span className="text-[9.5px] text-[#DAA017] block">
                        {doc.officiantRole}
                      </span>
                    </td>

                    {/* Status & Verification */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant="green" size="sm">
                          VÁLIDO
                        </Badge>
                        <button
                          onClick={() => onOpenValidationModal(doc)}
                          className="text-[9px] font-mono text-emerald-300 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          {doc.securityHash.slice(0, 10)}...
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectDocument(doc)}
                          className="p-1.5 rounded-lg bg-[#2A2015] hover:bg-[#DAA017] text-[#DAA017] hover:text-black transition-all"
                          title="Abrir no Estúdio / Editar"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDownloadSinglePdf(doc)}
                          className="p-1.5 rounded-lg bg-[#2A2015] hover:bg-[#DAA017] text-[#DAA017] hover:text-black transition-all"
                          title="Baixar PDF Oficial"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleShareSingleWhatsApp(doc)}
                          className="p-1.5 rounded-lg bg-[#2A2015] hover:bg-emerald-500 text-emerald-400 hover:text-black transition-all"
                          title="Enviar via WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
