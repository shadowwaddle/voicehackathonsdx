// Placeholder until a QR package is approved (see PROGRESS.md).
export function QrCode({ value }: { value: string }) {
  return (
    <div
      className="grid h-40 w-40 place-items-center rounded-2xl border-4 border-dashed border-ink/20 bg-white text-center text-sm text-ink/50"
      title={value}
    >
      QR code
    </div>
  );
}
