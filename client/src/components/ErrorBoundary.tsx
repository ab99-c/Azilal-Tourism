import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackRender?: (info: { error: Error | null }) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackRender) {
        return <>{this.props.fallbackRender({ error: this.state.error })}</>;
      }
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">An unexpected error occurred.</h2>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/** Friendly multilingual fallback so a JS crash never shows a blank page. */
export function CrashFallback({ message }: { message?: string }) {
  const { lang } = useLanguage();
  const texts: Record<string, { title: string; hint: string }> = {
    ar: {
      title: "وقع خطأ غير متوقع",
      hint: "حاولنا نحمّلو الصفحة وما قدرناش. عاود حمّلها ولا استعمل النسخة الرئيسية ديال الموقع.",
    },
    fr: {
      title: "Une erreur inattendue s'est produite",
      hint: "Nous n'avons pas pu charger la page. Rechargez-la ou utilisez la version principale du site.",
    },
    ber: {
      title: "ⵜⵍⵍⴰ ⵜⵓⴽⴽⵙⴰ",
      hint: "ⵓⵔ ⵏⵣⵎⵉⵔ ⴰⴷ ⵏⵙⵍⴽⵎ ⵜⴰⵙⵏⴰ. ⵙⵙⵏⵙ ⵜⵉⴽⵍⵉⵜ ⵏⵏⵙ ⵏⵏⵉⴹⵏ.",
    },
  };
  const text = texts[lang] || texts.fr;
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <AlertTriangle size={44} className="text-destructive mb-4" />
      <h3 className="text-lg font-bold mb-2">{text.title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{text.hint}</p>
      {message && (
        <p className="text-xs text-muted-foreground/60 max-w-lg mb-4">{message}</p>
      )}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
        >
          <RotateCcw size={16} />
          {lang === "ar" ? "عاود حمّل" : lang === "ber" ? "ⵙⵏⵙ ⵜⵉⴽⵍⵉⵜ" : "Reload"}
        </button>
        <a
          href="https://azilaltour-j2sx2a5n.manus.space"
          className="px-4 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/5"
        >
          {lang === "ar"
            ? "النسخة الرئيسية ديال الموقع"
            : lang === "ber"
              ? "ⵜⴰⵏⵖⵍⵜ ⵜⴰⵎⴰⵜⴰⵢⵜ ⵏ ⵓⵙⵉⵜ"
              : "Main site version"}
        </a>
      </div>
    </div>
  );
}

export default ErrorBoundaryInner;
