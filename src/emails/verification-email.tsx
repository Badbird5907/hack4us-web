import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type VerificationEmailProps = {
  appName?: string;
  userName?: string;
  verificationUrl: string;
};

export function VerificationEmail({
  appName = "Hack4Us",
  userName,
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email to finish setting up your {appName} account.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Confirm your email address</Heading>
          <Text style={paragraph}>Hi {userName ?? "there"},</Text>
          <Text style={paragraph}>
            Thanks for signing up for {appName}. Please verify your email address to
            activate your account and sign in.
          </Text>

          <Section style={buttonContainer}>
            <Button href={verificationUrl} style={button}>
              Verify email
            </Button>
          </Section>

          <Text style={paragraph}>
            If the button doesn&apos;t work, copy and paste this URL into your browser:
          </Text>
          <Link href={verificationUrl} style={link}>
            {verificationUrl}
          </Link>

          <Hr style={divider} />

          <Text style={footer}>
            If you didn&apos;t create a {appName} account, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 20px",
  maxWidth: "560px",
  backgroundColor: "#ffffff",
  border: "1px solid #e6ebf1",
};

const heading = {
  margin: "0 0 20px",
  fontSize: "24px",
  lineHeight: "1.3",
  color: "#111827",
};

const paragraph = {
  margin: "0 0 14px",
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#111827",
  borderRadius: "6px",
  color: "#fff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "bold",
  lineHeight: "42px",
  textDecoration: "none",
  textAlign: "center" as const,
  width: "180px",
};

const link = {
  color: "#2563eb",
  fontSize: "13px",
  wordBreak: "break-all" as const,
};

const divider = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const footer = {
  margin: "0",
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "1.5",
};
