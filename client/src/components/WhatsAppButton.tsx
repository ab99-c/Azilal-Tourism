import type { MouseEvent } from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

interface WhatsAppButtonProps {
  phone?: string | null;
  message: string;
  label: string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export default function WhatsAppButton({ phone, message, label, className = '', onClick }: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(phone, message);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${className}`}
    >
      <MessageCircle className="w-4 h-4" aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
