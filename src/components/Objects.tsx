import { ENGINE_EFFECTS, OBJECT_CATEGORIES, WORLD_OBJECTS } from '../data/objects';

const DELIVERY = [
  ['Format', 'One .glb per object (binary glTF) with textures embedded, named by its ID — e.g. mammoth.glb.'],
  ['Scale', 'Real-world metres. The sizes below are what the scene is laid out for.'],
  ['Origin', 'On the ground, at the centre of the footprint. Y is up.'],
  ['Facing', 'People, animals and vehicles face +X (the walking direction). Buildings face +Z (toward the road).'],
  ['Materials', 'PBR: base colour, normal, roughness, metallic. No baked-in lighting or shadows — the sun, snow and haze are applied in the scene.'],
  ['Moving parts', 'Keep sails, rotors and wheels as separate named parts, pivoted at their hub.'],
  ['Variants', 'Deliver as separate files with a suffix — e.g. pine-snow.glb, car-1950s.glb.'],
  ['Branding', 'No real logos or brand names on shops, cups or vehicles.'],
];

const STATUS_LABEL = {
  done: { text: 'Finished model', cls: 'border-[#4ECB71]/50 text-[#4ECB71]' },
  placeholder: { text: 'Low-poly placeholder', cls: 'border-[#FFD93D]/40 text-[#FFD93D]' },
  wishlist: { text: 'Not in scene yet', cls: 'border-white/20 text-white/50' },
} as const;

const Objects = () => {
  const count = (status: string) => WORLD_OBJECTS.filter((o) => o.status === status).length;
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <h1 className="text-3xl font-extrabold md:text-4xl">Objects</h1>
      <p className="mt-2 max-w-2xl text-white/50">
        Every model the walking world needs. {count('done')} finished,{' '}
        {count('placeholder')} still low-poly placeholders, and {count('wishlist')}{' '}
        suggested additions. Each placeholder is replaced as its finished model
        arrives.
      </p>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <h2 className="text-xl font-bold">How to deliver a model</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm md:grid-cols-2">
          {DELIVERY.map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                {k}
              </dt>
              <dd className="text-white/75">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {OBJECT_CATEGORIES.map((cat) => {
        const items = WORLD_OBJECTS.filter((o) => o.category === cat.id);
        return (
          <section key={cat.id} className="mt-12">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-bold">{cat.label}</h2>
              <span className="font-mono text-xs text-white/40">{items.length}</span>
            </div>
            <p className="mt-1 text-sm text-white/50">{cat.blurb}</p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {items.map((o) => (
                <li
                  key={o.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold">{o.name}</h3>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_LABEL[o.status].cls}`}
                    >
                      {STATUS_LABEL[o.status].text}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-white/40">{o.id}.glb</p>
                  <p className="mt-2 text-sm text-white/70">{o.notes}</p>
                  <dl className="mt-3 space-y-1 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 font-semibold uppercase tracking-[0.12em] text-white/40">Era</dt>
                      <dd className="text-white/70">{o.era}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-20 shrink-0 font-semibold uppercase tracking-[0.12em] text-white/40">Size (m)</dt>
                      <dd className="text-white/70">{o.size}</dd>
                    </div>
                    {o.variants && (
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 font-semibold uppercase tracking-[0.12em] text-white/40">Variants</dt>
                        <dd className="text-white/70">{o.variants.join(' · ')}</dd>
                      </div>
                    )}
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <h2 className="text-xl font-bold">Drawn by the engine — no model needed</h2>
        <ul className="mt-3 grid list-disc gap-x-8 gap-y-1 pl-5 text-sm text-white/70 md:grid-cols-2">
          {ENGINE_EFFECTS.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Objects;
