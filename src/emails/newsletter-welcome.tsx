import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/Layout";

interface NewsletterWelcomeProps {
  locale?: string;
}

const copy: Record<string, { subject: string; preview: string; heading: string; body1: string; body2: string; cta: string; sign: string }> = {
  en: {
    subject: "Welcome to Blossom by Olha",
    preview: "You're now part of the Blossom family",
    heading: "Welcome to Blossom by Olha",
    body1: "Thank you for subscribing! You'll be the first to know about new collections, limited-edition pieces, and the stories behind each creation.",
    body2: "Each piece is handcrafted from polymer clay, inspired by the organic beauty of botanical forms. We can't wait to share what's coming next.",
    cta: "Explore the Collection",
    sign: "With love,\nOlha\nFounder & Artist, Blossom by Olha",
  },
  es: {
    subject: "Bienvenida a Blossom by Olha",
    preview: "Ya eres parte de la familia Blossom",
    heading: "Bienvenida a Blossom by Olha",
    body1: "¡Gracias por suscribirte! Serás la primera en conocer las nuevas colecciones, piezas de edición limitada e historias detrás de cada creación.",
    body2: "Cada pieza está hecha a mano con arcilla polimérica, inspirada en la belleza orgánica de las formas botánicas. No podemos esperar para compartir lo que viene.",
    cta: "Explorar la Colección",
    sign: "Con cariño,\nOlha\nFundadora & Artista, Blossom by Olha",
  },
  uk: {
    subject: "Ласкаво просимо до Blossom by Olha",
    preview: "Ви тепер частина родини Blossom",
    heading: "Ласкаво просимо до Blossom by Olha",
    body1: "Дякуємо за підписку! Ви першою дізнаєтесь про нові колекції, лімітовані вироби та історії за кожним виробом.",
    body2: "Кожен виріб виготовляється вручну з полімерної глини, натхненний органічною красою ботанічних форм. Не можемо дочекатися, щоб поділитись тим, що буде далі.",
    cta: "Переглянути Колекцію",
    sign: "З любов'ю,\nОльга\nЗасновниця & Художниця, Blossom by Olha",
  },
};

export default function NewsletterWelcome({ locale = "en" }: NewsletterWelcomeProps) {
  const t = copy[locale] || copy.en;

  return (
    <EmailLayout preview={t.preview}>
      <Section style={content}>
        <Text style={heading}>{t.heading}</Text>
        <Text style={body}>{t.body1}</Text>
        <Text style={body}>{t.body2}</Text>
      </Section>

      <Section style={ctaSection}>
        <Button style={button} href="https://www.blossombyolha.com/products">
          {t.cta}
        </Button>
      </Section>

      <Section style={content}>
        <Text style={signature}>
          {t.sign.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {i === 2 ? <span style={{ fontSize: "12px", color: "#999" }}>{line}</span> : line}
            </React.Fragment>
          ))}
        </Text>
      </Section>
    </EmailLayout>
  );
}

const content: React.CSSProperties = { padding: "24px" };

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "normal",
  margin: "0 0 16px",
};

const body: React.CSSProperties = {
  fontSize: "14px",
  color: "#333",
  lineHeight: "1.7",
  margin: "0 0 12px",
};

const ctaSection: React.CSSProperties = {
  padding: "0 24px 24px",
  textAlign: "center" as const,
};

const button: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
  padding: "12px 32px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
};

const signature: React.CSSProperties = {
  fontSize: "14px",
  color: "#333",
  lineHeight: "1.6",
  fontStyle: "italic",
};
