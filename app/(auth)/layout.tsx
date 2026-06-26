export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "radial-gradient(ellipse at top, #7c3aed08 0%, transparent 60%), #0a0a0a",
      }}
    >
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
