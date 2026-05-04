export function OnlineDot({ size = 8 }: { size?: number }) {
    return (
    <span
      className="inline-block rounded-full animate-pulse-dot"
        style={{
        width: size,
        height: size,
        background: 'var(--pixel-green)',
        boxShadow: '0 0 6px var(--pixel-green)',
        }}
    />
    );
}
