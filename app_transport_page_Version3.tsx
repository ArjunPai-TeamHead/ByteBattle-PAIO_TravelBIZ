export const metadata = { title: "Transport • PAIO TravelBiz" };

export default function TransportPage() {
  return (
    <div className="grid gap-4">
      <div className="card">
        <h1 className="text-xl font-bold mb-2">Transport Discovery (BANG Bus)</h1>
        <p className="text-fgMuted mb-3">
          This embeds the BANG Bus module. Place your built/static assets under <code>/apps/bang-bus/</code> so they can be loaded below.
        </p>
        <div className="rounded-xl overflow-hidden border border-border">
          {/* If you host BANG-Bus assets here, the iframe will load them. */}
          <iframe
            src="/apps/bang-bus/index.html"
            title="BANG Bus"
            className="w-full"
            style={{ height: "70vh", background: "#111" }}
          />
        </div>
        <div className="text-xs text-fgMuted mt-2">
          Payments, if any, occur only on provider sites. PAIO TravelBiz is discovery-only.
        </div>
      </div>
    </div>
  );
}